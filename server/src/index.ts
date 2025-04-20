// File: /server/src/index.ts
import { FastMCP, FastMCPSession } from "fastmcp";
import { nodeTools } from "./tools/node_tools.js";
import { scriptTools } from "./tools/script_tools.js";
import { sceneTools } from "./tools/scene_tools.js";
import { editorTools } from "./tools/editor_tools.js";
import { assetTools } from "./tools/asset_tools.js";
import { enhancedTools } from "./tools/enhanced_tools.js";
import { scriptResourceTools } from "./tools/script_resource_tools.js";
import { getGodotConnection } from "./utils/godot_connection.js";

// Import resources
import {
  sceneListResource,
  sceneStructureResource,
  fullSceneTreeResource,
} from "./resources/scene_resources.js";
import {
  scriptResource,
  scriptListResource,
  scriptMetadataResource,
} from "./resources/script_resources.js";
import {
  projectStructureResource,
  projectSettingsResource,
  projectResourcesResource,
} from "./resources/project_resources.js";
import {
  editorStateResource,
  selectedNodeResource,
  currentScriptResource,
} from "./resources/editor_resources.js";
import { assetListResource } from "./resources/asset_resources.js";
import { debugOutputResource } from "./resources/debug_resources.js";

/**
 * Main entry point for the Godot MCP server
 */
async function main() {
  console.error("Starting Enhanced Godot MCP server...");

  // Create FastMCP instance
  const server = new FastMCP({
    name: "EnhancedGodotMCP",
    version: "1.1.0",
  });

  // --- BEGIN FIX: Attach Error Handler to Session on Connect ---
  server.on("connect", ({ session }: { session: FastMCPSession<any> }) => {
    console.error(
      `MCP Session Connected. Client Capabilities:`,
      session.clientCapabilities,
    );

    // Attach the error handler to *this specific session*
    session.on("error", ({ error }: { error: Error }) => {
      // Destructure error from the event payload
      console.error("--- MCP Session Error Caught ---");
      if (error instanceof Error) {
        console.error(`Error Name: ${error.name}`);
        console.error(`Error Message: ${error.message}`);
        // Check if it's the timeout error
        if (
          error.message.includes("Request timed out") ||
          (error as any).code === -32001
        ) {
          console.error(`Type: Request Timeout`);
          const errorData = (error as any).data;
          if (errorData && typeof errorData === "object" && errorData.timeout) {
            console.error(`Timeout Duration: ${errorData.timeout}ms`);
          }
        } else if ((error as any).code) {
          console.error(`Error Code: ${(error as any).code}`);
        }
        const errorData = (error as any).data;
        if (errorData) {
          console.error(`Error Data: ${JSON.stringify(errorData)}`);
        }
        console.error(`Stack Trace:\n${error.stack}`);
      } else {
        console.error("Caught non-Error object:", error);
      }
      console.error("-------------------------------");
      // Process continues, error is logged but not fatal.
    });

    // Optional: Handle other session events if needed
    session.on("rootsChanged", ({ roots }) => {
      console.error("MCP Session Roots Changed:", roots);
    });
  });

  // Handle disconnects if needed (optional)
  server.on("disconnect", ({ session }) => {
    console.error("MCP Session Disconnected.");
    // Perform any cleanup specific to this session if necessary
  });
  // --- END FIX ---

  // Register all tools
  const allTools = [
    ...nodeTools,
    ...scriptTools,
    ...sceneTools,
    ...editorTools,
    ...assetTools,
    ...enhancedTools,
    ...scriptResourceTools,
  ];

  allTools.forEach((tool) => {
    server.addTool(tool);
    console.error(`Registered tool: ${tool.name}`);
  });

  // Register all resources
  server.addResource(sceneListResource);
  server.addResource(scriptListResource);
  server.addResource(projectStructureResource);
  server.addResource(projectSettingsResource);
  server.addResource(projectResourcesResource);
  server.addResource(editorStateResource);
  server.addResource(selectedNodeResource);
  server.addResource(currentScriptResource);
  server.addResource(sceneStructureResource);
  server.addResource(scriptResource);
  server.addResource(scriptMetadataResource);
  server.addResource(fullSceneTreeResource);
  server.addResource(debugOutputResource);
  server.addResource(assetListResource);

  console.error("All resources and tools registered");

  // Try to connect to Godot
  try {
    const godot = getGodotConnection();
    // Don't await connection here, let it happen lazily or handle errors
    godot.connect().catch((err) => {
      console.warn(`Initial connection attempt failed: ${err.message}`);
      console.warn("Will retry connection when commands are executed");
    });
  } catch (error) {
    const err = error as Error;
    console.warn(`Could not connect to Godot: ${err.message}`);
    console.warn("Will retry connection when commands are executed");
  }

  // Start the server AFTER the error handler is attached
  server.start({
    transportType: "stdio",
  });

  console.error("Enhanced Godot MCP server started");
  console.error("Ready to process commands from Claude or other AI assistants");

  // Handle cleanup
  const cleanup = () => {
    console.error("Shutting down Enhanced Godot MCP server...");
    const godot = getGodotConnection();
    godot.disconnect();
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
}

// Start the server
main().catch((error) => {
  // This catches errors during the initial setup in main()
  console.error("Failed to start Enhanced Godot MCP server:", error);
  process.exit(1);
});
