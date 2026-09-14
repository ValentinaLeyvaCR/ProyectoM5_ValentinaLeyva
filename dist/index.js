//En este archivo se configura e inicia el servidor MCP 
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"; // Importa el servidor MCP
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"; // Importa el transporte estándar de entrada/salida
import { registerPing } from "./tools/ping.js";
import { registerSlugify } from "./tools/slugify.js"; // Importa la función para registrar la tool slugify
import { registerSum } from "./tools/sum.js";
export const server = new McpServer({
    name: "HX-GCAMEY-agent",
    version: "1.0.0",
});
async function main() {
    registerPing(server); // Registra la tool ping en el servidor MCP
    registerSlugify(server); // Registra la tool slugify en el servidor MCP
    registerSum(server); // Registra la tool sum en el servidor MCP
    const transport = new StdioServerTransport(); // Crea una instancia del transporte estándar de entrada/salida
    await server.connect(new StdioServerTransport()); // Conecta el servidor MCP utilizando el transporte estándar de entrada/salida
    console.error("[mcp] Server connected"); // Mensaje de error que indica que el servidor MCP se ha conectado correctamente
}
main().catch((err) => {
    console.error("[mcp] fatal:", err); // Mensaje de error que indica que ocurrió un error fatal al iniciar el servidor MCP
    process.exit(1); // Termina el proceso para que la terminal no se quede colgada al ocurrir un error
});
//# sourceMappingURL=index.js.map