export abstract class AppError extends Error {
  abstract readonly code: string;
  readonly userMessage: string;
  readonly cause?: unknown;

  constructor(userMessage: string, cause?: unknown) {
    super(userMessage);
    this.userMessage = userMessage;
    this.cause = cause;
    this.name = this.constructor.name;
  }
}


export class ValidationError extends AppError {
  readonly code = "VALIDATION_ERROR";
}


export class AuthenticationError extends AppError {
  readonly code = "AUTHENTICATION_ERROR";
}


export class GitHubAPIError extends AppError {


  readonly code: string = "GITHUB_API_ERROR";
  readonly status?: number;

  constructor(userMessage: string, status?: number, cause?: unknown) {
    super(userMessage, cause);
    this.status = status;
  }
}


export class RateLimitError extends GitHubAPIError {
  override readonly code = "RATE_LIMIT_ERROR";
  readonly retryAfterSeconds?: number;

  constructor(userMessage: string, retryAfterSeconds?: number, cause?: unknown) {
    super(userMessage, 429, cause);
    this.retryAfterSeconds = retryAfterSeconds;
  }
}


export class NetworkError extends AppError {
  readonly code = "NETWORK_ERROR";
}


interface OctokitLikeError {
  status: number;
  response?: { data?: { message?: string }; headers?: Record<string, string> };
  message: string;
}

function isOctokitLikeError(error: unknown): error is OctokitLikeError {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status: unknown }).status === "number"
  );
}

function getRetryAfterSeconds(error: OctokitLikeError): number | undefined {
  const raw = error.response?.headers?.["retry-after"];
  if (!raw) return undefined;
  const seconds = Number(raw);
  return Number.isFinite(seconds) ? seconds : undefined;
}

function isNetworkErrorMessage(message: string): boolean {
  return /ENOTFOUND|ECONNREFUSED|ECONNRESET|ETIMEDOUT|EAI_AGAIN|fetch failed/i.test(message);
}


export function classifyError(error: unknown, context?: { owner?: string; repo?: string }): AppError {

  if (error instanceof AppError) return error;

  if (isOctokitLikeError(error)) {
    const { status } = error;
    const repoLabel = context?.repo
      ? context.owner
        ? `${context.owner}/${context.repo}`
        : context.repo
      : "solicitado";

    if (status === 401) {
      return new AuthenticationError(
        "El token de GitHub no es válido o expiró. Verifica la variable de entorno GITHUB_TOKEN.",
        error
      );
    }

    if (status === 403) {
      const retryAfter = getRetryAfterSeconds(error);
      if (retryAfter !== undefined || /rate limit/i.test(error.message)) {
        return new RateLimitError(
          "Se alcanzó el límite de solicitudes de GitHub (rate limit). Intenta de nuevo en unos minutos.",
          retryAfter,
          error
        );
      }
      return new AuthenticationError(
        "El token de GitHub no tiene permisos suficientes para esta operación. Verifica que tenga el scope 'repo'.",
        error
      );
    }

    if (status === 404) {
      return new GitHubAPIError(
        `El repositorio ${repoLabel} no fue encontrado. Verifica el nombre e intenta de nuevo.`,
        404,
        error
      );
    }

    if (status === 422) {
      return new ValidationError(
        `GitHub rechazó la solicitud porque algunos datos no son válidos (por ejemplo, un nombre de repositorio que ya existe). Detalle: ${
          error.response?.data?.message ?? error.message
        }`,
        error
      );
    }

    if (status === 429) {
      return new RateLimitError(
        "Se alcanzó el límite de solicitudes de GitHub (rate limit). Intenta de nuevo en unos minutos.",
        getRetryAfterSeconds(error),
        error
      );
    }

    return new GitHubAPIError(
      `GitHub devolvió un error inesperado (status ${status}). Detalle: ${
        error.response?.data?.message ?? error.message
      }`,
      status,
      error
    );
  }

  if (error instanceof Error && isNetworkErrorMessage(error.message)) {
    return new NetworkError(
      "No se pudo conectar con GitHub. Verifica tu conexión a internet e intenta de nuevo.",
      error
    );
  }

  const message = error instanceof Error ? error.message : String(error);
  return new GitHubAPIError(`Ocurrió un error inesperado: ${message}`, undefined, error);
}
