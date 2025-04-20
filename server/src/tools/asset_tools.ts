// File: /server/src/tools/asset_tools.ts
import { z } from 'zod';
import { getGodotConnection } from '../utils/godot_connection.js';
import { MCPTool } from '../utils/types.js';

/**
 * Tools for asset management in Godot
 */
export const assetTools: MCPTool[] = [
  {
    name: 'list_assets_by_type',
    description: 'List all assets of a specific type in the project',
    parameters: z.object({
      type: z.string()
        .describe('Type of assets to list (e.g. "images", "audio", "models", "all")'),
    }),
    execute: async ({ type }): Promise<string> => {
      const godot = getGodotConnection();
      
      try {
        const result = await godot.sendCommand('list_assets_by_type', { type });
        
        // Format the results into human-readable output
        const assetCount = result.count || 0;
        const assetType = result.assetType || type;
        
        if (assetCount === 0) {
          return `No ${assetType} assets found in the project.`;
        }
        
        const fileList = result.files.slice(0, 10).join('\n- ');
        let summary = `Found ${assetCount} ${assetType} assets in the project.\n\nFirst 10 assets:\n- ${fileList}`;
        
        if (assetCount > 10) {
          summary += `\n\n(${assetCount - 10} more not shown)`;
        }
        
        return summary;
      } catch (error) {
        throw new Error(`Failed to list assets: ${(error as Error).message}`);
      }
    },
  },
  
  {
    name: 'list_project_files',
    description: 'List files in the project matching specified extensions',
    parameters: z.object({
      extensions: z.array(z.string()).optional()
        .describe('File extensions to filter by (e.g. [".tscn", ".gd"])'),
    }),
    execute: async ({ extensions = [] }): Promise<string> => {
      const godot = getGodotConnection();
      
      try {
        const result = await godot.sendCommand('list_project_files', { extensions });
        
        const fileCount = result.files ? result.files.length : 0;
        const extensionStr = extensions.length > 0 ? extensions.join(', ') : 'all';
        
        if (fileCount === 0) {
          return `No files with extensions ${extensionStr} found in the project.`;
        }
        
        const fileList = result.files.slice(0, 10).join('\n- ');
        let summary = `Found ${fileCount} files with extensions ${extensionStr} in the project.\n\nFirst 10 files:\n- ${fileList}`;
        
        if (fileCount > 10) {
          summary += `\n\n(${fileCount - 10} more not shown)`;
        }
        
        return summary;
      } catch (error) {
        throw new Error(`Failed to list project files: ${(error as Error).message}`);
      }
    },
  },
];