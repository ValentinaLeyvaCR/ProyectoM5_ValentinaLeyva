import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createCommitShape } from "../schemas/index.js";
import { getDefaultGitHubClient } from "../github/client.js";
import { createCommit } from "../github/operations.js";
import { AppError } from "../errors/index.js";
import { logger } from "../utils/logging.js";

export function registerCreateCommit(server: McpServer) { 
  server.registerTool(
    "create_commit",
    {
      description:
        "Crea o actualiza un archivo en un repositorio de GitHub, generando un commit con el mensaje indicado. " +
        "Si el archivo ya existe en esa ruta, lo actualiza (no lo duplica); si no existe, lo crea. " +
        "Úsala cuando el usuario pida agregar, modificar o subir un archivo a un repositorio. " +
        "Necesita el usuario, el repositorio, la ruta del archivo, su contenido y un mensaje de commit.",
      inputSchema: createCommitShape,
    },
    async ({ owner, repo, path, content, message, branch }) => {
      try {
        const octokit = getDefaultGitHubClient();
        const commit = await createCommit(octokit, { owner, repo, path, content, message, branch });

        return {
          content: [
            {
              type: "text",
              text:
                `Commit creado en ${owner}/${repo}: "${message}"\n` +
                `Archivo: ${commit.contentPath}\n` +
                `Commit: ${commit.commitUrl}`,
            },
          ],
        };
      } catch (error) {
        
        const errorMessage =
          error instanceof AppError ? error.userMessage : "Ocurrió un error inesperado al crear el commit.";
        logger.error("create_commit falló", { error: String(error) });
        return {
          content: [{ type: "text", text: errorMessage }],
          isError: true,
        };
      }
    }
  );
}
