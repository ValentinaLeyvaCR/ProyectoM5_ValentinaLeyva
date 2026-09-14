//Este archivo define y registra la herramienta "slugify" en el servidor MCP, que sirve para convertir cadenas de texto en slugs (formatos amigables para URLs).

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"; // Importa el servidor MCP
import zod from "zod"; // Importa la librería zod para la validación de esquemas


export function registerSlugify(server: McpServer) { // Registra la tool slugify en el servidor MCP
    server.registerTool("slugify", { // Define la tool slugify
        description: "Converts a text string into a URL-friendly slug.", // Descripción de la tool, que indica que se encarga de convertir texto en un formato amigable para URLs.
        inputSchema: {text: zod.string()}, // se usa zod para definir que se espera un texto de tipo string como entrada
    },

    async ({ text }) => { // Función asincrónica que recibe el texto a convertir en slug
        const slug = text // Convierte el texto en un slug
          .toLowerCase() // Convierte a minúsculas
          .trim() // Elimina espacios al inicio y al final
          .replace(/[^\w\s-]/g, "") // Elimina caracteres no alfanuméricos, espacios y guiones
          .replace(/[\s_]+/g, "-") // Reemplaza espacios y guiones bajos por guiones
          .replace(/^-+|-+$/g, "") // Elimina guiones al inicio y al final
        return { content: [{ type: "text", text: slug }] }; // Devuelve el slug generado como contenido de tipo texto
    }
  );
} 

