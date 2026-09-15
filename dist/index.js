import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerPing } from "./tools/ping.js";
import { registerSlugify } from "./tools/slugify.js";
import { registerSum } from "./tools/sum.js";
import { registerCreateRepository } from "./tools/create-repository.js"; // Tool: crear repositorio
import { registerListRepositories } from "./tools/list-repositories.js"; // Tool: listar repositorios
import { registerCreateIssue } from "./tools/create-issue.js"; // Tool: crear issue
import { registerListIssues } from "./tools/list-issues.js"; // Tool: listar issues
import { registerCreateCommit } from "./tools/create-commit.js";
export const server = new McpServer({
    name: "HX-GCAMEY-agent",
    version: "1.0.0",
});
async function main() {
    registerPing(server);
    registerSlugify(server);
    registerSum(server);
    registerCreateRepository(server);
    registerListRepositories(server);
    registerCreateIssue(server);
    registerListIssues(server);
    registerCreateCommit(server);
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("[mcp] Server connected");
}
main().catch((err) => {
    console.error("[mcp] fatal:", err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map