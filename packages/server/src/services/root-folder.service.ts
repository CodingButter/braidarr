import { prisma } from '../lib/prisma.js';
import { RootFolder, Prisma } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';

export interface CreateRootFolderRequest {
  path: string;
  name?: string;
  isDefault?: boolean;
}

export interface UpdateRootFolderRequest {
  path?: string;
  name?: string;
  isDefault?: boolean;
}

export interface RootFolderInfo extends RootFolder {
  freeSpaceFormatted: string;
  totalSpaceFormatted: string;
  usedSpaceFormatted: string;
  usedPercentage: number;
  accessible: boolean;
  exists: boolean;
}

export class RootFolderService {
  /**
   * Get all root folders
   */
  async getAllRootFolders(): Promise<RootFolder[]> {
    return prisma.rootFolder.findMany({
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' },
        { path: 'asc' }
      ]
    });
  }

  /**
   * Get all root folders with disk space info
   */
  async getAllRootFoldersWithInfo(): Promise<RootFolderInfo[]> {
    const folders = await this.getAllRootFolders();
    
    const foldersWithInfo = await Promise.all(
      folders.map(async folder => {
        const info = await this.checkFolderInfo(folder.path);
        return {
          ...folder,
          ...info,
          freeSpaceFormatted: this.formatBytes(info.freeSpace || 0n),
          totalSpaceFormatted: this.formatBytes(info.totalSpace || 0n),
          usedSpaceFormatted: this.formatBytes(
            info.totalSpace && info.freeSpace 
              ? info.totalSpace - info.freeSpace 
              : 0n
          ),
          usedPercentage: info.totalSpace && info.freeSpace
            ? Number(((info.totalSpace - info.freeSpace) * 100n) / info.totalSpace)
            : 0
        };
      })
    );

    return foldersWithInfo;
  }

  /**
   * Get root folder by ID
   */
  async getRootFolderById(id: string): Promise<RootFolder | null> {
    return prisma.rootFolder.findUnique({
      where: { id }
    });
  }

  /**
   * Get root folder by ID with info
   */
  async getRootFolderByIdWithInfo(id: string): Promise<RootFolderInfo | null> {
    const folder = await this.getRootFolderById(id);
    
    if (!folder) {
      return null;
    }

    const info = await this.checkFolderInfo(folder.path);
    
    return {
      ...folder,
      ...info,
      freeSpaceFormatted: this.formatBytes(info.freeSpace || 0n),
      totalSpaceFormatted: this.formatBytes(info.totalSpace || 0n),
      usedSpaceFormatted: this.formatBytes(
        info.totalSpace && info.freeSpace 
          ? info.totalSpace - info.freeSpace 
          : 0n
      ),
      usedPercentage: info.totalSpace && info.freeSpace
        ? Number(((info.totalSpace - info.freeSpace) * 100n) / info.totalSpace)
        : 0
    };
  }

  /**
   * Get default root folder
   */
  async getDefaultRootFolder(): Promise<RootFolder | null> {
    return prisma.rootFolder.findFirst({
      where: { isDefault: true }
    });
  }

  /**
   * Create a new root folder
   */
  async createRootFolder(data: CreateRootFolderRequest): Promise<RootFolder> {
    // Validate path
    const normalizedPath = path.resolve(data.path);
    await this.validatePath(normalizedPath);

    // Check if path already exists
    const existingFolder = await prisma.rootFolder.findUnique({
      where: { path: normalizedPath }
    });

    if (existingFolder) {
      throw new Error('Root folder with this path already exists');
    }

    // If this is set as default, unset other defaults
    if (data.isDefault) {
      await prisma.rootFolder.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      });
    }

    // Get disk space info
    const spaceInfo = await this.getDiskSpace(normalizedPath);

    return prisma.rootFolder.create({
      data: {
        path: normalizedPath,
        name: data.name || path.basename(normalizedPath) || 'Root Folder',
        isDefault: data.isDefault ?? false,
        freeSpace: spaceInfo.freeSpace,
        totalSpace: spaceInfo.totalSpace,
        lastScan: new Date()
      }
    });
  }

  /**
   * Update a root folder
   */
  async updateRootFolder(id: string, data: UpdateRootFolderRequest): Promise<RootFolder | null> {
    try {
      // If path is being updated, validate it
      if (data.path) {
        const normalizedPath = path.resolve(data.path);
        await this.validatePath(normalizedPath);

        // Check if new path conflicts with existing folder
        const existingFolder = await prisma.rootFolder.findFirst({
          where: { 
            path: normalizedPath,
            id: { not: id }
          }
        });

        if (existingFolder) {
          throw new Error('Root folder with this path already exists');
        }
      }

      // If this is set as default, unset other defaults
      if (data.isDefault) {
        await prisma.rootFolder.updateMany({
          where: { 
            isDefault: true,
            id: { not: id }
          },
          data: { isDefault: false }
        });
      }

      const updateData: Prisma.RootFolderUpdateInput = {};
      
      if (data.path !== undefined) {
        updateData.path = path.resolve(data.path);
        // Update disk space if path changed
        const spaceInfo = await this.getDiskSpace(updateData.path as string);
        updateData.freeSpace = spaceInfo.freeSpace;
        updateData.totalSpace = spaceInfo.totalSpace;
        updateData.lastScan = new Date();
      }
      if (data.name !== undefined) updateData.name = data.name;
      if (data.isDefault !== undefined) updateData.isDefault = data.isDefault;

      return await prisma.rootFolder.update({
        where: { id },
        data: updateData
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Delete a root folder
   */
  async deleteRootFolder(id: string): Promise<boolean> {
    try {
      const folder = await this.getRootFolderById(id);
      
      if (!folder) {
        return false;
      }

      // Don't allow deletion of default folder if it's the only one
      if (folder.isDefault) {
        const totalFolders = await prisma.rootFolder.count();
        if (totalFolders === 1) {
          throw new Error('Cannot delete the only root folder');
        }
        
        // Set another folder as default
        const nextFolder = await prisma.rootFolder.findFirst({
          where: { id: { not: id } },
          orderBy: { name: 'asc' }
        });
        
        if (nextFolder) {
          await prisma.rootFolder.update({
            where: { id: nextFolder.id },
            data: { isDefault: true }
          });
        }
      }

      await prisma.rootFolder.delete({
        where: { id }
      });
      
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Refresh disk space for all root folders
   */
  async refreshDiskSpace(): Promise<void> {
    const folders = await this.getAllRootFolders();
    
    await Promise.all(
      folders.map(async folder => {
        try {
          const spaceInfo = await this.getDiskSpace(folder.path);
          await prisma.rootFolder.update({
            where: { id: folder.id },
            data: {
              freeSpace: spaceInfo.freeSpace,
              totalSpace: spaceInfo.totalSpace,
              lastScan: new Date()
            }
          });
        } catch (error) {
          console.error(`Failed to refresh disk space for ${folder.path}:`, error);
        }
      })
    );
  }

  /**
   * Refresh disk space for specific root folder
   */
  async refreshRootFolderDiskSpace(id: string): Promise<RootFolder | null> {
    const folder = await this.getRootFolderById(id);
    
    if (!folder) {
      return null;
    }

    try {
      const spaceInfo = await this.getDiskSpace(folder.path);
      
      return await prisma.rootFolder.update({
        where: { id },
        data: {
          freeSpace: spaceInfo.freeSpace,
          totalSpace: spaceInfo.totalSpace,
          lastScan: new Date()
        }
      });
    } catch (error) {
      console.error(`Failed to refresh disk space for ${folder.path}:`, error);
      throw error;
    }
  }

  /**
   * Validate a path
   */
  private async validatePath(folderPath: string): Promise<void> {
    try {
      const stats = await fs.stat(folderPath);
      
      if (!stats.isDirectory()) {
        throw new Error('Path is not a directory');
      }

      // Test write access
      await fs.access(folderPath, fs.constants.W_OK);
      
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error('Path does not exist');
      } else if ((error as NodeJS.ErrnoException).code === 'EACCES') {
        throw new Error('No write access to path');
      } else {
        throw new Error(`Invalid path: ${(error as Error).message}`);
      }
    }
  }

  /**
   * Get disk space information for a path
   */
  private async getDiskSpace(folderPath: string): Promise<{ freeSpace: bigint; totalSpace: bigint }> {
    try {
      const stats = await fs.statfs(folderPath);
      
      return {
        freeSpace: BigInt(stats.bavail) * BigInt(stats.bsize),
        totalSpace: BigInt(stats.blocks) * BigInt(stats.bsize)
      };
    } catch (error) {
      console.warn(`Could not get disk space for ${folderPath}:`, error);
      return {
        freeSpace: 0n,
        totalSpace: 0n
      };
    }
  }

  /**
   * Check folder accessibility and existence
   */
  private async checkFolderInfo(folderPath: string): Promise<{
    accessible: boolean;
    exists: boolean;
    freeSpace: bigint | null;
    totalSpace: bigint | null;
  }> {
    try {
      await fs.access(folderPath, fs.constants.F_OK);
      const exists = true;

      try {
        await fs.access(folderPath, fs.constants.W_OK);
        const accessible = true;
        const spaceInfo = await this.getDiskSpace(folderPath);
        
        return {
          accessible,
          exists,
          freeSpace: spaceInfo.freeSpace,
          totalSpace: spaceInfo.totalSpace
        };
      } catch {
        return {
          accessible: false,
          exists,
          freeSpace: null,
          totalSpace: null
        };
      }
    } catch {
      return {
        accessible: false,
        exists: false,
        freeSpace: null,
        totalSpace: null
      };
    }
  }

  /**
   * Format bytes to human readable format
   */
  private formatBytes(bytes: bigint): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    if (bytes === 0n) return '0 Bytes';
    
    const i = Math.floor(Math.log(Number(bytes)) / Math.log(1024));
    const size = Number(bytes) / Math.pow(1024, i);
    
    return `${Math.round(size * 100) / 100} ${sizes[i]}`;
  }

  /**
   * Ensure default root folder exists
   */
  async ensureDefaultRootFolder(): Promise<RootFolder> {
    const existingDefault = await this.getDefaultRootFolder();
    
    if (existingDefault) {
      return existingDefault;
    }

    // Check if any folders exist
    const existingFolders = await this.getAllRootFolders();
    
    if (existingFolders.length > 0) {
      // Set first folder as default
      const updated = await this.updateRootFolder(existingFolders[0]!.id, { isDefault: true });
      if (!updated) {
        throw new Error('Failed to update existing folder as default');
      }
      return updated;
    }

    // Create default root folder
    const defaultPath = process.env.DEFAULT_ROOT_FOLDER || '/media';
    
    try {
      return await this.createRootFolder({
        path: defaultPath,
        name: 'Media',
        isDefault: true
      });
    } catch (error) {
      // If default path fails, try current directory
      const fallbackPath = process.cwd();
      return await this.createRootFolder({
        path: fallbackPath,
        name: 'Default',
        isDefault: true
      });
    }
  }
}