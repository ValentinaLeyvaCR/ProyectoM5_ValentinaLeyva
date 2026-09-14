//Este archivo define y registra la herramienta "sum" en el servidor MCP, que sirve para sumar dos números.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"; // Importa el servidor MCP
import zod from "zod"; // Importa la librería zod para la validación de esquemas

export function registerSum(server: McpServer) { // Registra la tool sum en el servidor MCP
    server.registerTool("sum", { // Define la tool sum
        description: "Returns the sum of two numbers.", // Descripción de la tool sum que dice que se encarga de sumar dos números
        inputSchema: {a: zod.number(), b: zod.number()}, // Define el esquema de entrada que espera dos números: a y b
    },
    async ({ a, b }) => ({ // Función asincrónica que recibe los números a y b y devuelve su suma
        content: [{ type: "text", text: String(a + b)}] // Devuelve la suma de a y b como contenido de tipo texto
    })
    );
}