import type { Octokit } from "@octokit/rest";
import { classifyError } from "../errors/index.js";
import { withRetry } from "../utils/retry.js";
import { logger } from "../utils/logging.js";
import type { GitHubRepository, GitHubIssue, GitHubCommitResult, RepoRef } from "../types.js";


export interface CreateRepositoryParams {
  name: string;
  description?: string;
  isPrivate?: boolean;
}

export async function createRepository(
  octokit: Octokit,
  params: CreateRepositoryParams
): Promise<GitHubRepository> {
  logger.info("Creando repositorio", { name: params.name });
  try {
    return await withRetry(async () => {
      const { data } = await octokit.rest.repos.createForAuthenticatedUser({
        name: params.name,
        description: params.description,
        private: params.isPrivate ?? false,
      });
      return toGitHubRepository(data);
    });
  } catch (error) {
    throw classifyError(error, { repo: params.name });
  }
}



export interface ListRepositoriesParams {
  perPage?: number;
  page?: number;
}

export async function listRepositories(
  octokit: Octokit,
  params: ListRepositoriesParams = {}
): Promise<GitHubRepository[]> {
  logger.info("Listando repositorios del usuario autenticado", params);
  try {
    return await withRetry(async () => {
      const { data } = await octokit.rest.repos.listForAuthenticatedUser({
        per_page: params.perPage ?? 30,
        page: params.page ?? 1,
        sort: "updated",
      });
      return data.map(toGitHubRepository);
    });
  } catch (error) {
    throw classifyError(error);
  }
}



export interface CreateIssueParams extends RepoRef {
  title: string;
  body?: string;
}

export async function createIssue(octokit: Octokit, params: CreateIssueParams): Promise<GitHubIssue> {
  logger.info("Creando issue", { owner: params.owner, repo: params.repo, title: params.title });
  try {
    return await withRetry(async () => {
      const { data } = await octokit.rest.issues.create({
        owner: params.owner,
        repo: params.repo,
        title: params.title,
        body: params.body,
      });
      return toGitHubIssue(data);
    });
  } catch (error) {
    throw classifyError(error, { owner: params.owner, repo: params.repo });
  }
}



export interface ListIssuesParams extends RepoRef {
  state?: "open" | "closed" | "all";
}

export async function listIssues(octokit: Octokit, params: ListIssuesParams): Promise<GitHubIssue[]> {
  logger.info("Listando issues", { owner: params.owner, repo: params.repo, state: params.state });
  try {
    return await withRetry(async () => {
      const { data } = await octokit.rest.issues.listForRepo({
        owner: params.owner,
        repo: params.repo,
        state: params.state ?? "open",
      });
      
      return data.filter((issue) => !issue.pull_request).map(toGitHubIssue);
    });
  } catch (error) {
    throw classifyError(error, { owner: params.owner, repo: params.repo });
  }
}



export interface CreateCommitParams extends RepoRef {
  path: string;
  content: string;
  message: string;
  branch?: string;
}

export async function createCommit(
  octokit: Octokit,
  params: CreateCommitParams
): Promise<GitHubCommitResult> {
  logger.info("Creando commit", { owner: params.owner, repo: params.repo, path: params.path });
  try {
    return await withRetry(async () => {
      
      const existingSha = await getExistingFileSha(octokit, params);

      const { data } = await octokit.rest.repos.createOrUpdateFileContents({
        owner: params.owner,
        repo: params.repo,
        path: params.path,
        message: params.message,
        content: Buffer.from(params.content, "utf-8").toString("base64"),
        branch: params.branch,
        sha: existingSha,
      });

      return {
        commitSha: data.commit.sha ?? "",
        commitUrl: data.commit.html_url ?? "",
        contentPath: params.path,
        htmlUrl: data.content?.html_url ?? "",
      };
    });
  } catch (error) {
    throw classifyError(error, { owner: params.owner, repo: params.repo });
  }
}

async function getExistingFileSha(
  octokit: Octokit,
  params: Pick<CreateCommitParams, "owner" | "repo" | "path" | "branch">
): Promise<string | undefined> {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: params.owner,
      repo: params.repo,
      path: params.path,
      ref: params.branch,
    });
    
    return Array.isArray(data) ? undefined : (data as { sha: string }).sha;
  } catch (error) {
    if (isNotFound(error)) return undefined; 
    throw error;
  }
}

function isNotFound(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { status?: number }).status === 404;
}


function toGitHubRepository(data: {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  default_branch: string;
  created_at: string | null;
}): GitHubRepository {
  return {
    id: data.id,
    name: data.name,
    fullName: data.full_name,
    private: data.private,
    htmlUrl: data.html_url,
    description: data.description,
    defaultBranch: data.default_branch,
    createdAt: data.created_at,
  };
}

function toGitHubIssue(data: {
  number: number;
  title: string;
  state: string;
  html_url: string;
  body?: string | null;
  created_at: string;
  user: { login: string } | null;
}): GitHubIssue {
  return {
    number: data.number,
    title: data.title,
    state: data.state,
    htmlUrl: data.html_url,
    body: data.body ?? null,
    createdAt: data.created_at,
    user: data.user?.login ?? null,
  };
}
