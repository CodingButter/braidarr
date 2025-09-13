import { prisma } from '../lib/prisma.js';
import { QualityProfile, Prisma } from '@prisma/client';

export interface QualityItem {
  id: number;
  name: string;
  allowed: boolean;
  weight: number;
  minSize?: number;
  maxSize?: number;
  preferredSize?: number;
}

export interface CreateQualityProfileRequest {
  name: string;
  cutoff: number;
  items: QualityItem[];
  isDefault?: boolean;
}

export interface UpdateQualityProfileRequest {
  name?: string;
  cutoff?: number;
  items?: QualityItem[];
  isDefault?: boolean;
}

export class QualityProfileService {
  /**
   * Get all quality profiles
   */
  async getAllProfiles(): Promise<QualityProfile[]> {
    return prisma.qualityProfile.findMany({
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' }
      ]
    });
  }

  /**
   * Get quality profile by ID
   */
  async getProfileById(id: string): Promise<QualityProfile | null> {
    return prisma.qualityProfile.findUnique({
      where: { id }
    });
  }

  /**
   * Get default quality profile
   */
  async getDefaultProfile(): Promise<QualityProfile | null> {
    return prisma.qualityProfile.findFirst({
      where: { isDefault: true }
    });
  }

  /**
   * Create a new quality profile
   */
  async createProfile(data: CreateQualityProfileRequest): Promise<QualityProfile> {
    // If this is set as default, unset other defaults
    if (data.isDefault) {
      await prisma.qualityProfile.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      });
    }

    return prisma.qualityProfile.create({
      data: {
        name: data.name,
        cutoff: data.cutoff,
        items: JSON.stringify(data.items),
        isDefault: data.isDefault ?? false,
      }
    });
  }

  /**
   * Update a quality profile
   */
  async updateProfile(id: string, data: UpdateQualityProfileRequest): Promise<QualityProfile | null> {
    try {
      // If this is set as default, unset other defaults
      if (data.isDefault) {
        await prisma.qualityProfile.updateMany({
          where: { 
            isDefault: true,
            id: { not: id }
          },
          data: { isDefault: false }
        });
      }

      const updateData: Prisma.QualityProfileUpdateInput = {};
      
      if (data.name !== undefined) updateData.name = data.name;
      if (data.cutoff !== undefined) updateData.cutoff = data.cutoff;
      if (data.items !== undefined) updateData.items = JSON.stringify(data.items);
      if (data.isDefault !== undefined) updateData.isDefault = data.isDefault;

      return await prisma.qualityProfile.update({
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
   * Delete a quality profile
   */
  async deleteProfile(id: string): Promise<boolean> {
    try {
      const profile = await this.getProfileById(id);
      
      if (!profile) {
        return false;
      }

      // Don't allow deletion of default profile if it's the only one
      if (profile.isDefault) {
        const totalProfiles = await prisma.qualityProfile.count();
        if (totalProfiles === 1) {
          throw new Error('Cannot delete the only quality profile');
        }
        
        // Set another profile as default
        const nextProfile = await prisma.qualityProfile.findFirst({
          where: { id: { not: id } },
          orderBy: { name: 'asc' }
        });
        
        if (nextProfile) {
          await prisma.qualityProfile.update({
            where: { id: nextProfile.id },
            data: { isDefault: true }
          });
        }
      }

      await prisma.qualityProfile.delete({
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
   * Get available quality definitions
   */
  getAvailableQualities(): QualityItem[] {
    return [
      { id: 1, name: 'SDTV', allowed: true, weight: 1 },
      { id: 2, name: 'DVD', allowed: true, weight: 2 },
      { id: 3, name: 'WEBDL-1080p', allowed: true, weight: 3 },
      { id: 4, name: 'HDTV-720p', allowed: true, weight: 4 },
      { id: 5, name: 'WEBDL-720p', allowed: true, weight: 5 },
      { id: 6, name: 'Bluray-720p', allowed: true, weight: 6 },
      { id: 7, name: 'HDTV-1080p', allowed: true, weight: 7 },
      { id: 8, name: 'WEBDL-1080p', allowed: true, weight: 8 },
      { id: 9, name: 'Bluray-1080p', allowed: true, weight: 9 },
      { id: 10, name: 'Raw-HD', allowed: false, weight: 10 },
      { id: 16, name: 'HDTV-2160p', allowed: true, weight: 16 },
      { id: 18, name: 'WEBDL-2160p', allowed: true, weight: 18 },
      { id: 19, name: 'Bluray-2160p', allowed: true, weight: 19 },
    ];
  }

  /**
   * Create default quality profile if none exists
   */
  async ensureDefaultProfile(): Promise<QualityProfile> {
    const existingDefault = await this.getDefaultProfile();
    
    if (existingDefault) {
      return existingDefault;
    }

    // Check if any profiles exist
    const existingProfiles = await this.getAllProfiles();
    
    if (existingProfiles.length > 0) {
      // Set first profile as default
      const updated = await this.updateProfile(existingProfiles[0]!.id, { isDefault: true });
      if (!updated) {
        throw new Error('Failed to update existing profile as default');
      }
      return updated;
    }

    // Create default profile
    const defaultQualities = this.getAvailableQualities();
    const allowedQualities = defaultQualities.map(q => ({
      ...q,
      allowed: q.weight >= 4 && q.weight <= 9 // Allow 720p to 1080p by default
    }));

    return await this.createProfile({
      name: 'Standard',
      cutoff: 8, // WEBDL-1080p
      items: allowedQualities,
      isDefault: true
    });
  }

  /**
   * Validate quality profile
   */
  validateProfile(data: CreateQualityProfileRequest | UpdateQualityProfileRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if ('name' in data && data.name) {
      if (data.name.length < 1 || data.name.length > 100) {
        errors.push('Profile name must be between 1 and 100 characters');
      }
    }
    
    if ('items' in data && data.items) {
      const allowedItems = data.items.filter(item => item.allowed);
      
      if (allowedItems.length === 0) {
        errors.push('At least one quality must be allowed');
      }
      
      if ('cutoff' in data && data.cutoff) {
        const cutoffItem = allowedItems.find(item => item.id === data.cutoff);
        if (!cutoffItem) {
          errors.push('Cutoff quality must be one of the allowed qualities');
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get quality profile with parsed items
   */
  async getProfileWithParsedItems(id: string): Promise<(QualityProfile & { parsedItems: QualityItem[] }) | null> {
    const profile = await this.getProfileById(id);
    
    if (!profile) {
      return null;
    }

    try {
      const parsedItems = JSON.parse(profile.items) as QualityItem[];
      return {
        ...profile,
        parsedItems
      };
    } catch (error) {
      // If items can't be parsed, return default qualities
      return {
        ...profile,
        parsedItems: this.getAvailableQualities()
      };
    }
  }

  /**
   * Clone a quality profile
   */
  async cloneProfile(id: string, newName: string): Promise<QualityProfile | null> {
    const sourceProfile = await this.getProfileById(id);
    
    if (!sourceProfile) {
      return null;
    }

    try {
      const items = JSON.parse(sourceProfile.items) as QualityItem[];
      
      return await this.createProfile({
        name: newName,
        cutoff: sourceProfile.cutoff,
        items: items,
        isDefault: false
      });
    } catch (error) {
      throw new Error('Failed to clone profile: Invalid source profile data');
    }
  }
}