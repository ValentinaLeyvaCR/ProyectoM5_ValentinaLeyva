//Este archivo define y registra la herramienta "ping" en el servidor MCP, que sirve como una herramienta de verificación de estado.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"; // Importa el servidor MCP
import zod  from "zod"; // Importa la librería zod para la validación de esquemas

export function registerPing(server: McpServer) { // Registra la tool ping en el servidor MCP, esta funcion sirve para evitar dependencias circulares

server.registerTool("ping", { // Registra la herramienta ping en el servidor MCP, se define su nombre, descripción y esquema de entrada

    description: "Health-check tool. Returns pong. If a string is sent returns the string", // Descripción de la herramienta ping que indica que es una herramienta de verificación de estado y que devuelve "pong" y,
    //  si se envía un mensaje de tipo string, devuelve el mismo mensaje 
    inputSchema: {message: zod.string().optional()}, // se usa zod para definir que el mensaje es opcional y de tipo string

},

    async (message) => ({ // Maneja la ejecución de la tool ping
     content: [{ type: "text", text: message ? `pong: ${message}` : "pong" }], // Contenido de la respuesta de la tool ping que hace eco del mensaje recibido o devuelve "pong" si no se envía ningún mensaje
    }),
  );
}