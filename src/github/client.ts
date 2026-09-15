import { Octokit } from "@octokit/rest";
import { AuthenticationError } from "../errors/index.js";


export function createGitHubClient(token?: string): Octokit {
  const authToken = token ?? process.env.GITHUB_TOKEN;

  if (!authToken) {
    throw new AuthenticationError(
      "No se encontró un GitHub Token. Configura la variable de entorno GITHUB_TOKEN en tu archivo .env."
    );
  }

  return new Octokit({ auth: authToken });
}

let defaultClient: Octokit | undefined;

export function getDefaultGitHubClient(): Octokit {
  if (!defaultClient) {
    defaultClient = createGitHubClient();
  }
  return defaultClient;
}
