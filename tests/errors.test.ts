import { describe, it, expect } from "vitest";
import {
  classifyError,
  GitHubAPIError,
  AuthenticationError,
  RateLimitError,
  NetworkError,
} from "../src/errors/index.js";


function fakeOctokitError(status: number, message = "error", headers: Record<string, string> = {}) {
  return { status, message, response: { data: { message }, headers } };
}

describe("classifyError", () => {
  it("convierte un 404 en GitHubAPIError con un mensaje que menciona el repositorio", () => {
    const error = classifyError(fakeOctokitError(404), { owner: "octocat", repo: "no-existe" });
    expect(error).toBeInstanceOf(GitHubAPIError);
    expect(error.userMessage).toContain("octocat/no-existe");
    expect(error.userMessage).toContain("no fue encontrado");
  });

  it("convierte un 401 en AuthenticationError con referencia al token", () => {
    const error = classifyError(fakeOctokitError(401));
    expect(error).toBeInstanceOf(AuthenticationError);
    expect(error.userMessage).toMatch(/token/i);
  });

  it("convierte un 403 con cabecera retry-after en RateLimitError", () => {
    const error = classifyError(fakeOctokitError(403, "rate limit exceeded", { "retry-after": "30" }));
    expect(error).toBeInstanceOf(RateLimitError);
    expect((error as RateLimitError).retryAfterSeconds).toBe(30);
  });

  it("convierte un 403 SIN indicios de rate limit en AuthenticationError (token sin permisos)", () => {
    const error = classifyError(fakeOctokitError(403, "Resource not accessible by personal access token"));
    expect(error).toBeInstanceOf(AuthenticationError);
  });

  it("convierte un error de red (ECONNREFUSED) en NetworkError", () => {
    const error = classifyError(new Error("connect ECONNREFUSED 127.0.0.1:443"));
    expect(error).toBeInstanceOf(NetworkError);
  });

  it("no reclasifica un AppError que ya viene clasificado (evita doble envoltura)", () => {
    const original = new AuthenticationError("mensaje original");
    const result = classifyError(original);
    expect(result).toBe(original);
  });
});
