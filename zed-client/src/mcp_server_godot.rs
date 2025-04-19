use zed_extension_api::{self as zed, Command, ContextServerId, Project, Result};

const SERVER_PATH: &str = "/home/artur/Documents/MCP/Godot-MCP/server/dist/index.js";

struct GodotMcpExtension;
impl zed::Extension for GodotMcpExtension {
    fn new() -> Self {
        Self
    }

    fn context_server_command(
        &mut self,
        _context_server_id: &ContextServerId,
        _project: &Project,
    ) -> Result<Command> {
        Ok(Command {
            command: zed::node_binary_path()?,
            args: vec![SERVER_PATH.to_string()],
            env: vec![("MCP_TRANSPORT".to_string(), "stdio".to_string())],
        })
    }
}

zed::register_extension!(GodotMcpExtension);
