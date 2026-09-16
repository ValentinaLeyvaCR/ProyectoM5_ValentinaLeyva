//Este archivo crea el mcp server, registra las tools y conecta con el transporte stdio

import "dotenv/config"; // este siempre va al inicio, se encarga de cargar las variables de entorno del archivo .env.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerPing } from "./tools/ping.js";
import { registerSlugify } from "./tools/slugify.js";
import { registerSum } from "./tools/sum.js";
import { registerCreateRepository } from "./tools/create-repository.js"; // Tool: crear repositorio
import { registerListRepositories } from "./tools/list-repositories.js"; // Tool: listar repositorios
import { registerCreateIssue } from "./tools/create-issue.js"; // Tool: crear issue
import { registerListIssues } from "./tools/list-issues.js"; // Tool: listar issues
import { registerCreateCommit } from "./tools/create-commit.js"; // Tool: crear commit

export const server = new McpServer({ // Esta funcion nos permite crear el mcp server, al server se le asigna un nombre y una version.
  name: "HX-GCAMEY-agent",
  version: "1.0.0",
});

async function main(): Promise<void> { // Esta funcion nos permite registrar las tools que se van a usar
  registerPing(server);
  registerSlugify(server);
  registerSum(server);


  registerCreateRepository(server);
  registerListRepositories(server);
  registerCreateIssue(server);
  registerListIssues(server);
  registerCreateCommit(server);

  const transport = new StdioServerTransport(); // Esta funcion nos permite conectar con el transporte stdio, que se encarga de la comunicacion entre el mcp server y el modelo.
  await server.connect(transport);

  console.error("[mcp] Server connected"); //se usa console.error para que no interfiera con la comunicacion entre el mcp server y el modelo.
}

main().catch((err) => { // Esta funcion nos permite manejar los errores que se puedan presentar en el proceso de inicializacion
  console.error("[mcp] fatal:", err);
  process.exit(1);
});
