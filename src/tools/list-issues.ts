import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listIssuesShape } from "../schemas/index.js";
import { getDefaultGitHubClient } from "../github/client.js";
import { listIssues } from "../github/operations.js";
import { AppError } from "../errors/index.js";
import { logger } from "../utils/logging.js";

export function registerListIssues(server: McpServer) { 
  server.registerTool(
    "list_issues",
    {
      description:
        "Lista los issues de un repositorio de GitHub específico, filtrando opcionalmente por estado " +
        "Úsala cuando el usuario pida ver o revisar los issues de un repositorio. " +
        "Necesita el usuario dueño del repositorio y el nombre del repositorio.",
      inputSchema: listIssuesShape,
    },
    async ({ owner, repo, state }) => {
      try {
        const octokit = getDefaultGitHubClient();
        const issues = await listIssues(octokit, { owner, repo, state });

        if (issues.length === 0) {
          return {
            content: [{ type: "text", text: `No se encontraron issues (${state ?? "open"}) en ${owner}/${repo}.` }],
          };
        }

        const listado = issues.map((issue) => `- #${issue.number} [${issue.state}] ${issue.title}`).join("\n");

        return {
          content: [
            { type: "text", text: `Issues encontrados en ${owner}/${repo} (${issues.length}):\n${listado}` },
          ],
        };
      } catch (error) {
        const message =
          error instanceof AppError ? error.userMessage : "Ocurrió un error inesperado al listar los issues.";
        logger.error("list_issues falló", { error: String(error) });
        return {
          content: [{ type: "text", text: message }],
          isError: true,
        };
      }
    }
  );
}
