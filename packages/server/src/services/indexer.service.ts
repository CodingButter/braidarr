import { prisma } from '../lib/prisma.js';
import { Indexer, Prisma } from '@prisma/client';

export interface IndexerScope {
  resource: string;
  actions: string[];
}

export interface CreateIndexerRequest {
  name: string;
  type: 'usenet' | 'torrent';
  baseUrl: string;
  apiKey?: string | undefined;
  categories: number[];
  priority?: number;
  isEnabled?: boolean;
}

export interface UpdateIndexerRequest {
  name?: string | undefined;
  type?: 'usenet' | 'torrent' | undefined;
  baseUrl?: string | undefined;
  apiKey?: string | undefined;
  categories?: number[] | undefined;
  priority?: number | undefined;
  isEnabled?: boolean | undefined;
}

export interface IndexerTestResult {
  success: boolean;
  message: string;
  categories?: Array<{ id: number; name: string }>;
}

export class IndexerService {
  /**
   * Get all indexers
   */
  async getAllIndexers(): Promise<Indexer[]> {
    return prisma.indexer.findMany({
      orderBy: [
        { priority: 'asc' },
        { name: 'asc' }
      ]
    });
  }

  /**
   * Get enabled indexers only
   */
  async getEnabledIndexers(): Promise<Indexer[]> {
    return prisma.indexer.findMany({
      where: { isEnabled: true },
      orderBy: [
        { priority: 'asc' },
        { name: 'asc' }
      ]
    });
  }

  /**
   * Get indexer by ID
   */
  async getIndexerById(id: string): Promise<Indexer | null> {
    return prisma.indexer.findUnique({
      where: { id }
    });
  }

  /**
   * Create a new indexer
   */
  async createIndexer(data: CreateIndexerRequest): Promise<Indexer> {
    return prisma.indexer.create({
      data: {
        name: data.name,
        type: data.type,
        baseUrl: data.baseUrl,
        apiKey: data.apiKey || null,
        categories: JSON.stringify(data.categories),
        priority: data.priority || 25,
        isEnabled: data.isEnabled ?? true,
      }
    });
  }

  /**
   * Update an indexer
   */
  async updateIndexer(id: string, data: UpdateIndexerRequest): Promise<Indexer | null> {
    try {
      const updateData: Prisma.IndexerUpdateInput = {};
      
      if (data.name !== undefined) updateData.name = data.name;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.baseUrl !== undefined) updateData.baseUrl = data.baseUrl;
      if (data.apiKey !== undefined) updateData.apiKey = data.apiKey;
      if (data.categories !== undefined) updateData.categories = JSON.stringify(data.categories);
      if (data.priority !== undefined) updateData.priority = data.priority;
      if (data.isEnabled !== undefined) updateData.isEnabled = data.isEnabled;

      return await prisma.indexer.update({
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
   * Delete an indexer
   */
  async deleteIndexer(id: string): Promise<boolean> {
    try {
      await prisma.indexer.delete({
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
   * Test indexer connection
   */
  async testIndexer(id: string): Promise<IndexerTestResult> {
    const indexer = await this.getIndexerById(id);
    
    if (!indexer) {
      return {
        success: false,
        message: 'Indexer not found'
      };
    }

    try {
      // Test connection based on indexer type
      if (indexer.type === 'usenet') {
        return await this.testUsenetIndexer(indexer);
      } else if (indexer.type === 'torrent') {
        return await this.testTorrentIndexer(indexer);
      } else {
        return {
          success: false,
          message: 'Unknown indexer type'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Test Usenet indexer (Newznab API)
   */
  private async testUsenetIndexer(indexer: Indexer): Promise<IndexerTestResult> {
    const baseUrl = indexer.baseUrl.replace(/\/$/, '');
    const apiKey = indexer.apiKey;
    
    if (!apiKey) {
      return {
        success: false,
        message: 'API key is required for Usenet indexers'
      };
    }

    // Test with caps query
    const testUrl = `${baseUrl}/api?t=caps&apikey=${apiKey}`;
    
    try {
      const response = await fetch(testUrl, { 
        headers: {
          'User-Agent': 'Braidarr/1.0'
        }
      });

      if (!response.ok) {
        return {
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const xmlText = await response.text();
      
      // Basic XML validation
      if (!xmlText.includes('<caps>') && !xmlText.includes('<categories>')) {
        return {
          success: false,
          message: 'Invalid response format - expected Newznab XML'
        };
      }

      return {
        success: true,
        message: 'Indexer connection successful'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  /**
   * Test Torrent indexer (Torznab API)
   */
  private async testTorrentIndexer(indexer: Indexer): Promise<IndexerTestResult> {
    const baseUrl = indexer.baseUrl.replace(/\/$/, '');
    const apiKey = indexer.apiKey;

    // Test with caps query (same as Newznab for Torznab)
    const testUrl = apiKey 
      ? `${baseUrl}/api?t=caps&apikey=${apiKey}`
      : `${baseUrl}/api?t=caps`;
    
    try {
      const response = await fetch(testUrl, { 
        headers: {
          'User-Agent': 'Braidarr/1.0'
        }
      });

      if (!response.ok) {
        return {
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const xmlText = await response.text();
      
      // Basic XML validation
      if (!xmlText.includes('<caps>') && !xmlText.includes('<categories>')) {
        return {
          success: false,
          message: 'Invalid response format - expected Torznab XML'
        };
      }

      return {
        success: true,
        message: 'Indexer connection successful'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  /**
   * Search across indexers
   */
  async search(query: string, category?: number, indexerIds?: string[]): Promise<any[]> {
    const indexers = indexerIds 
      ? await prisma.indexer.findMany({
          where: { 
            id: { in: indexerIds },
            isEnabled: true
          }
        })
      : await this.getEnabledIndexers();

    const searchPromises = indexers.map(indexer => 
      this.searchIndexer(indexer, query, category)
    );

    const results = await Promise.allSettled(searchPromises);
    
    // Flatten successful results
    return results
      .filter((result): result is PromiseFulfilledResult<any[]> => result.status === 'fulfilled')
      .flatMap(result => result.value);
  }

  /**
   * Search a specific indexer
   */
  private async searchIndexer(indexer: Indexer, query: string, category?: number): Promise<any[]> {
    const baseUrl = indexer.baseUrl.replace(/\/$/, '');
    const apiKey = indexer.apiKey;
    
    let searchUrl = `${baseUrl}/api?t=search&q=${encodeURIComponent(query)}`;
    
    if (apiKey) {
      searchUrl += `&apikey=${apiKey}`;
    }
    
    if (category) {
      searchUrl += `&cat=${category}`;
    }

    try {
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Braidarr/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      await response.text(); // consume response
      
      // Parse XML response (simplified - would need proper XML parser)
      // For now, return empty array
      // TODO: Implement proper XML parsing for search results
      return [];
      
    } catch (error) {
      console.error(`Search failed for indexer ${indexer.name}:`, error);
      return [];
    }
  }

  /**
   * Get supported indexer types
   */
  getSupportedTypes(): Array<{ value: string; label: string; description: string }> {
    return [
      {
        value: 'usenet',
        label: 'Usenet (Newznab)',
        description: 'Usenet indexer supporting the Newznab API'
      },
      {
        value: 'torrent',
        label: 'Torrent (Torznab)',
        description: 'Torrent indexer supporting the Torznab API'
      }
    ];
  }

  /**
   * Get default categories for indexer types
   */
  getDefaultCategories(type: string): Array<{ id: number; name: string }> {
    const categories = {
      usenet: [
        { id: 2000, name: 'Movies' },
        { id: 5000, name: 'TV' },
        { id: 3000, name: 'Audio' },
        { id: 7000, name: 'Other' }
      ],
      torrent: [
        { id: 2000, name: 'Movies' },
        { id: 5000, name: 'TV' },
        { id: 3000, name: 'Audio' },
        { id: 1000, name: 'Console' },
        { id: 4000, name: 'PC' },
        { id: 7000, name: 'Other' }
      ]
    };

    return categories[type as keyof typeof categories] || [];
  }
}