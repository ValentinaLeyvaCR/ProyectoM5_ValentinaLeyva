import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listRepositoriesShape } from "../schemas/index.js";
import { getDefaultGitHubClient } from "../github/client.js";
import { listRepositories } from "../github/operations.js";
import { AppError } from "../errors/index.js";
import { logger } from "../utils/logging.js";

export function registerListRepositories(server: McpServer) { 
  server.registerTool(
    "list_repositories",
    {
      description:
        "Lista los repositorios del usuario de GitHub autenticado. " +
        "Úsala cuando el usuario pida ver, listar o revisar sus repositorios.",
      inputSchema: listRepositoriesShape,
    },
    async ({ perPage, page }) => {
      try {
        const octokit = getDefaultGitHubClient();
        const repos = await listRepositories(octokit, { perPage, page });

        if (repos.length === 0) {
          return { content: [{ type: "text", text: "No se encontraron repositorios para esta cuenta." }] };
        }

       
        const listado = repos
          .map((repo) => `- ${repo.fullName} (${repo.private ? "privado" : "público"}) — ${repo.htmlUrl}`)
          .join("\n");

        return {
          content: [{ type: "text", text: `Repositorios encontrados (${repos.length}):\n${listado}` }],
        };
      } catch (error) {
        const message =
          error instanceof AppError ? error.userMessage : "Ocurrió un error inesperado al listar los repositorios.";
        logger.error("list_repositories falló", { error: String(error) });
        return {
          content: [{ type: "text", text: message }],
          isError: true,
        };
      }
    }
  );
}
