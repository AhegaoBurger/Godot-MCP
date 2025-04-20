var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
// File: /server/src/index.ts
import { FastMCP } from "fastmcp";
import { nodeTools } from "./tools/node_tools.js";
import { scriptTools } from "./tools/script_tools.js";
import { sceneTools } from "./tools/scene_tools.js";
import { editorTools } from "./tools/editor_tools.js";
import { assetTools } from "./tools/asset_tools.js";
import { enhancedTools } from "./tools/enhanced_tools.js";
import { scriptResourceTools } from "./tools/script_resource_tools.js";
import { getGodotConnection } from "./utils/godot_connection.js";
// Import resources
import { sceneListResource, sceneStructureResource, fullSceneTreeResource, } from "./resources/scene_resources.js";
import { scriptResource, scriptListResource, scriptMetadataResource, } from "./resources/script_resources.js";
import { projectStructureResource, projectSettingsResource, projectResourcesResource, } from "./resources/project_resources.js";
import { editorStateResource, selectedNodeResource, currentScriptResource, } from "./resources/editor_resources.js";
import { assetListResource } from "./resources/asset_resources.js";
import { debugOutputResource } from "./resources/debug_resources.js";
/**
 * Main entry point for the Godot MCP server
 */
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var server, allTools, godot, err, cleanup;
        return __generator(this, function (_a) {
            console.error("Starting Enhanced Godot MCP server...");
            server = new FastMCP({
                name: "EnhancedGodotMCP",
                version: "1.1.0",
            });
            // --- BEGIN FIX: Attach Error Handler to Session on Connect ---
            server.on("connect", function (_a) {
                var session = _a.session;
                console.error("MCP Session Connected. Client Capabilities:", session.clientCapabilities);
                // Attach the error handler to *this specific session*
                session.on("error", function (_a) {
                    var error = _a.error;
                    // Destructure error from the event payload
                    console.error("--- MCP Session Error Caught ---");
                    if (error instanceof Error) {
                        console.error("Error Name: ".concat(error.name));
                        console.error("Error Message: ".concat(error.message));
                        // Check if it's the timeout error
                        if (error.message.includes("Request timed out") ||
                            error.code === -32001) {
                            console.error("Type: Request Timeout");
                            var errorData_1 = error.data;
                            if (errorData_1 && typeof errorData_1 === "object" && errorData_1.timeout) {
                                console.error("Timeout Duration: ".concat(errorData_1.timeout, "ms"));
                            }
                        }
                        else if (error.code) {
                            console.error("Error Code: ".concat(error.code));
                        }
                        var errorData = error.data;
                        if (errorData) {
                            console.error("Error Data: ".concat(JSON.stringify(errorData)));
                        }
                        console.error("Stack Trace:\n".concat(error.stack));
                    }
                    else {
                        console.error("Caught non-Error object:", error);
                    }
                    console.error("-------------------------------");
                    // Process continues, error is logged but not fatal.
                });
                // Optional: Handle other session events if needed
                session.on("rootsChanged", function (_a) {
                    var roots = _a.roots;
                    console.error("MCP Session Roots Changed:", roots);
                });
            });
            // Handle disconnects if needed (optional)
            server.on("disconnect", function (_a) {
                var session = _a.session;
                console.error("MCP Session Disconnected.");
                // Perform any cleanup specific to this session if necessary
            });
            allTools = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], nodeTools, true), scriptTools, true), sceneTools, true), editorTools, true), assetTools, true), enhancedTools, true), scriptResourceTools, true);
            allTools.forEach(function (tool) {
                server.addTool(tool);
                console.error("Registered tool: ".concat(tool.name));
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
                godot = getGodotConnection();
                // Don't await connection here, let it happen lazily or handle errors
                godot.connect().catch(function (err) {
                    console.warn("Initial connection attempt failed: ".concat(err.message));
                    console.warn("Will retry connection when commands are executed");
                });
            }
            catch (error) {
                err = error;
                console.warn("Could not connect to Godot: ".concat(err.message));
                console.warn("Will retry connection when commands are executed");
            }
            // Start the server AFTER the error handler is attached
            server.start({
                transportType: "stdio",
            });
            console.error("Enhanced Godot MCP server started");
            console.error("Ready to process commands from Claude or other AI assistants");
            cleanup = function () {
                console.error("Shutting down Enhanced Godot MCP server...");
                var godot = getGodotConnection();
                godot.disconnect();
                process.exit(0);
            };
            process.on("SIGINT", cleanup);
            process.on("SIGTERM", cleanup);
            return [2 /*return*/];
        });
    });
}
// Start the server
main().catch(function (error) {
    // This catches errors during the initial setup in main()
    console.error("Failed to start Enhanced Godot MCP server:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map