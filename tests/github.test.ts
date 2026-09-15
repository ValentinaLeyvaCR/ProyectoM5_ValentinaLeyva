import { describe, it, expect, vi } from "vitest";
import { createRepository, listIssues, createCommit } from "../src/github/operations.js";
import { ValidationError } from "../src/errors/index.js";
import type { Octokit } from "@octokit/rest";


function makeOctokitMock(overrides: Record<string, unknown>): Octokit {
  return overrides as unknown as Octokit;
}

describe("createRepository", () => {
  it("llama a createForAuthenticatedUser con los parámetros correctos y devuelve el repo mapeado", async () => {
    const createForAuthenticatedUser = vi.fn().mockResolvedValue({
      data: {
        id: 1,
        name: "mi-repo",
        full_name: "valentina/mi-repo",
        private: false,
        html_url: "https://github.com/valentina/mi-repo",
        description: "repo de prueba",
        default_branch: "main",
        created_at: "2026-01-01T00:00:00Z",
      },
    });
    const octokit = makeOctokitMock({ rest: { repos: { createForAuthenticatedUser } } });

    const repo = await createRepository(octokit, { name: "mi-repo", description: "repo de prueba" });

    expect(createForAuthenticatedUser).toHaveBeenCalledWith({
      name: "mi-repo",
      description: "repo de prueba",
      private: false,
    });
    expect(repo.fullName).toBe("valentina/mi-repo");
  });

  it("propaga un ValidationError con mensaje amigable cuando GitHub responde 422 (nombre ya existente)", async () => {
    const createForAuthenticatedUser = vi.fn().mockRejectedValue({
      status: 422,
      message: "Validation Failed",
      response: { data: { message: "name already exists on this account" } },
    });
    const octokit = makeOctokitMock({ rest: { repos: { createForAuthenticatedUser } } });

    await expect(createRepository(octokit, { name: "repo-repetido" })).rejects.toThrow(ValidationError);
  });
});

describe("listIssues", () => {
  it("filtra los pull requests del listado (la API de issues también los incluye)", async () => {
    const listForRepo = vi.fn().mockResolvedValue({
      data: [
        { number: 1, title: "Bug real", state: "open", html_url: "x", created_at: "x", user: null },
        {
          number: 2,
          title: "PR que no debería listarse como issue",
          state: "open",
          html_url: "x",
          created_at: "x",
          user: null,
          pull_request: {},
        },
      ],
    });
    const octokit = makeOctokitMock({ rest: { issues: { listForRepo } } });

    const issues = await listIssues(octokit, { owner: "octocat", repo: "hello-world" });

    expect(issues).toHaveLength(1);
    expect(issues[0].number).toBe(1);
  });
});

describe("createCommit", () => {
  it("obtiene el sha del archivo existente y lo envía para actualizarlo", async () => {
    const getContent = vi.fn().mockResolvedValue({ data: { sha: "sha-existente" } });
    const createOrUpdateFileContents = vi.fn().mockResolvedValue({
      data: {
        commit: { sha: "abc123", html_url: "https://github.com/commit/abc123" },
        content: { html_url: "https://github.com/blob/abc123" },
      },
    });
    const octokit = makeOctokitMock({ rest: { repos: { getContent, createOrUpdateFileContents } } });

    await createCommit(octokit, {
      owner: "octocat",
      repo: "hello-world",
      path: "README.md",
      content: "hola",
      message: "actualiza readme",
    });

    expect(createOrUpdateFileContents).toHaveBeenCalledWith(expect.objectContaining({ sha: "sha-existente" }));
  });

  it("crea el archivo sin sha cuando getContent responde 404 (archivo nuevo)", async () => {
    const getContent = vi.fn().mockRejectedValue({ status: 404, message: "Not Found" });
    const createOrUpdateFileContents = vi.fn().mockResolvedValue({
      data: {
        commit: { sha: "def456", html_url: "https://github.com/commit/def456" },
        content: { html_url: "https://github.com/blob/def456" },
      },
    });
    const octokit = makeOctokitMock({ rest: { repos: { getContent, createOrUpdateFileContents } } });

    await createCommit(octokit, {
      owner: "octocat",
      repo: "hello-world",
      path: "nuevo.md",
      content: "hola",
      message: "crea archivo nuevo",
    });

    expect(createOrUpdateFileContents).toHaveBeenCalledWith(expect.objectContaining({ sha: undefined }));
  });
});
