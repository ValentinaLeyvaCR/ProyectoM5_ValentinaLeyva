import { describe, it, expect } from "vitest";
import { createRepositorySchema, createIssueSchema, listIssuesSchema } from "../src/schemas/index.js";

describe("createRepositorySchema", () => {
  it("acepta un nombre de repositorio válido", () => {
    const result = createRepositorySchema.safeParse({ name: "mi-repo-nuevo" });
    expect(result.success).toBe(true);
  });

  it("rechaza un nombre demasiado corto (menos de 3 caracteres)", () => {
    const result = createRepositorySchema.safeParse({ name: "ab" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("al menos 3 caracteres");
    }
  });

  it("rechaza un nombre con caracteres no permitidos (espacios, símbolos)", () => {
    const result = createRepositorySchema.safeParse({ name: "mi repo!" });
    expect(result.success).toBe(false);
  });
});

describe("createIssueSchema", () => {
  it("rechaza un título vacío", () => {
    const result = createIssueSchema.safeParse({ owner: "octocat", repo: "hello-world", title: "" });
    expect(result.success).toBe(false);
  });

  it("acepta un issue válido sin body (body es opcional)", () => {
    const result = createIssueSchema.safeParse({
      owner: "octocat",
      repo: "hello-world",
      title: "Bug al iniciar sesión",
    });
    expect(result.success).toBe(true);
  });
});

describe("listIssuesSchema", () => {
  it("rechaza un valor de 'state' fuera del enum permitido (open, closed, all)", () => {
    const result = listIssuesSchema.safeParse({ owner: "octocat", repo: "hello-world", state: "archived" });
    expect(result.success).toBe(false);
  });

  it("acepta la solicitud sin 'state' (el valor por defecto lo aplica el tool, no el schema)", () => {
    const result = listIssuesSchema.safeParse({ owner: "octocat", repo: "hello-world" });
    expect(result.success).toBe(true);
  });
});
