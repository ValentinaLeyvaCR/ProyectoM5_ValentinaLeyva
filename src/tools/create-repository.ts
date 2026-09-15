import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"; 
import { createRepositoryShape } from "../schemas/index.js"; 
import { getDefaultGitHubClient } from "../github/client.js"; 
import { createRepository } from "../github/operations.js"; 
import { AppError } from "../errors/index.js"; 
import { logger } from "../utils/logging.js"; 

export function registerCreateRepository(server: McpServer) { 
  server.registerTool(
    "create_repository", 
    {
      
      description:
        "Crea un nuevo repositorio en la cuenta de GitHub autenticada. " +
        "Úsala cuando el usuario pida crear, iniciar o generar un repositorio nuevo. " +
        "Requiere un nombre válido de GitHub.",
      inputSchema: createRepositoryShape, 
    },
    async ({ name, description, isPrivate }) => { 
      try {
        const octokit = getDefaultGitHubClient(); 
        const repo = await createRepository(octokit, { name, description, isPrivate });

        return {
          content: [
            {
              type: "text",
              text:
                `Repositorio creado con éxito: ${repo.fullName}\n` +
                `URL: ${repo.htmlUrl}\n` +
                `Visibilidad: ${repo.private ? "privado" : "público"}`,
            },
          ],
        };
      } catch (error) {
        
        const message =
          error instanceof AppError ? error.userMessage : "Ocurrió un error inesperado al crear el repositorio.";
        logger.error("create_repository falló", { error: String(error) });
        return {
          content: [{ type: "text", text: message }],
          isError: true, 
        };
      }
    }
  );
}
