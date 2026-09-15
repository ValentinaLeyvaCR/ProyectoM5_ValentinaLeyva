import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createIssueShape } from "../schemas/index.js";
import { getDefaultGitHubClient } from "../github/client.js";
import { createIssue } from "../github/operations.js";
import { AppError } from "../errors/index.js";
import { logger } from "../utils/logging.js";

export function registerCreateIssue(server: McpServer) { 
  server.registerTool(
    "create_issue",
    {
      description:
        "Abre un nuevo issue en un repositorio de GitHub existente, con título y descripción. " +
        "Úsala cuando el usuario pida crear, abrir o reportar un issue en un repositorio específico. " +
        "Necesita el usuario dueño del repositorio y el nombre del repositorio.",
      inputSchema: createIssueShape,
    },
    async ({ owner, repo, title, body }) => {
      try {
        const octokit = getDefaultGitHubClient();
        const issue = await createIssue(octokit, { owner, repo, title, body });

        return {
          content: [
            {
              type: "text",
              text: `Issue #${issue.number} creado en ${owner}/${repo}: "${issue.title}"\nURL: ${issue.htmlUrl}`,
            },
          ],
        };
      } catch (error) {
        const message =
          error instanceof AppError ? error.userMessage : "Ocurrió un error inesperado al crear el issue.";
        logger.error("create_issue falló", { error: String(error) });
        return {
          content: [{ type: "text", text: message }],
          isError: true,
        };
      }
    }
  );
}
