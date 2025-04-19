# Godot-MCP Zed Extension

This Zed editor extension provides context server integration for the [Godot-MCP](https://github.com/AhegaoBurger/Godot-MCP) project. It allows Zed to leverage the Godot-MCP Node.js server, enabling interactions (e.g., with AI assistants supporting the Model Context Protocol) directly within the editor for your Godot projects.

## Prerequisites

Before setting up this extension, ensure you have the following installed:

1.  **Zed Editor:** Download and install from [zed.dev](https://zed.dev/).
2.  **Node.js & npm:** Required for the Godot-MCP server. Install from [nodejs.org](https://nodejs.org/).
3.  **Rust & Cargo:** Required to build the Zed extension. Install from [rustup.rs](https://rustup.rs/).
    *   You will also need the WebAssembly target: `rustup target add wasm32-wasip1`
4.  **Godot Editor:** Required to run your Godot project. Install from [godotengine.org](https://godotengine.org/).
5.  **Godot-MCP Project:** Clone the main repository if you haven't already:
    ```bash
    git clone https://github.com/AhegaoBurger/Godot-MCP.git
    cd Godot-MCP
    ```

## Setup & Installation

Follow these steps to build and install the extension:

1.  **Build the Node.js Server:**
    Navigate to the server directory within the main `Godot-MCP` project and build it:
    ```bash
    cd server
    npm install
    npm run build
    cd .. # Go back to the Godot-MCP root directory
    ```
    *This ensures the required `server/dist/index.js` file exists.*

2.  **Build the Zed Extension:**
    Navigate to the Zed extension's directory (assuming it's called `zed-extension` within the `Godot-MCP` root):
    ```bash
    # Make sure you are in the Godot-MCP root directory first
    cd zed-extension # Or whatever you called the extension directory
    cargo build --target wasm32-wasip1 --release
    cd .. # Go back to the Godot-MCP root directory
    ```
    *This creates the necessary `.wasm` file in the `zed-extension/target/wasm32-wasip1/release/` directory.*

3.  **Install the Extension in Zed (Development Mode):**
    Create a symbolic link from Zed's development extensions directory to your local extension source code. This allows Zed to pick up changes when you rebuild.

    *   **macOS:**
        ```bash
        # Replace '/path/to/your/Godot-MCP/zed-extension' with the actual absolute path
        ln -s /path/to/your/Godot-MCP/zed-extension ~/Library/Application\ Support/Zed/extensions/dev/godot-mcp
        ```
    *   **Linux:**
        ```bash
        # Replace '/path/to/your/Godot-MCP/zed-extension' with the actual absolute path
        ln -s /path/to/your/Godot-MCP/zed-extension ~/.config/zed/extensions/dev/godot-mcp
        ```
    *   **Windows (Run PowerShell as Administrator):**
        ```powershell
        # Replace 'C:\path\to\your\Godot-MCP\zed-extension' with the actual absolute path
        New-Item -ItemType SymbolicLink -Path "$env:APPDATA\Zed\extensions\dev\godot-mcp" -Target "C:\path\to\your\Godot-MCP\zed-extension"
        ```
    *(Ensure the target directory (`.../dev/godot-mcp`) path is correct for your Zed installation and create the `dev` directory if it doesn't exist)*

4.  **Restart Zed:** Close and reopen the Zed editor completely for it to recognize the new extension.

## Usage

1.  **Run Godot Project:** Open your corresponding Godot project in the Godot Editor. **Press Play (F5)** to run the game/scene. This is necessary to start the Godot-MCP WebSocket server (listening on port 9080 by default).
2.  **Open Project in Zed:** Open the **root folder** of the cloned `Godot-MCP` repository in Zed. The extension expects to find the `server/dist/index.js` file relative to this root folder.
3.  **Verify:** Zed should automatically detect the project and attempt to start the Godot-MCP context server (the Node.js process). You can check Zed's logs for confirmation or errors:
    *   Open the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`).
    *   Search for and select `Developer: Open Zed Logs`.
    *   Look for lines like `Starting Godot MCP server...` or any connection errors.
4.  **Interact:** Once the Node.js server connects successfully to the running Godot instance, the MCP context server is active and ready for use by compatible tools within Zed.

## Troubleshooting

*   **Error: "Cannot find module ... server/dist/index.js" in Zed logs:**
    *   Ensure you ran `npm install` and `npm run build` inside the `Godot-MCP/server` directory.
    *   Make sure you opened the *root* `Godot-MCP` folder in Zed, not just the `server` or `zed-extension` folder.
*   **Error: "ECONNREFUSED 127.0.0.1:9080" in Zed logs:**
    *   Make sure your Godot project is **running** (press Play/F5 in the Godot Editor).
    *   Verify the Godot-side MCP plugin is active and listening on the correct port (default 9080).
*   **Extension Not Loading:**
    *   Double-check the symbolic link path is correct and points to the directory containing the extension's `Cargo.toml`.
    *   Ensure you rebuilt the extension (`cargo build ... --release`) after any code changes.
    *   Verify the `wasm.path` in `extension.json` points to the correct build output location.
    *   Restart Zed.
