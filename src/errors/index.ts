//Este archivo es el que maneja los errores que se puedan presentar en el mcp server.

export abstract class AppError extends Error { // aca se defina una clase que tiene como proposito definir la estructura basica de un error.
  abstract readonly code: string;
  readonly userMessage: string;
  readonly cause?: unknown;

  constructor(userMessage: string, cause?: unknown) { // el constructor recibe como parametro el mensaje de error y la causa del error. de esta forma podemos tener un control sobre los errores que se puedan presentar en el mcp server.
    super(userMessage);
    this.userMessage = userMessage;
    this.cause = cause;
    this.name = this.constructor.name;
  }
}


export class ValidationError extends AppError { // clase que extiende de AppError y define el tipo de error como VALIDATION_ERROR. que pasa cuando un dato es invalido.
  readonly code = "VALIDATION_ERROR";
}


export class AuthenticationError extends AppError { // clase que extiende de AppError y define el tipo de error como AUTHENTICATION_ERROR. que pasa cuando no se tiene permisos para realizar una operacion.
  readonly code = "AUTHENTICATION_ERROR";
}


export class GitHubAPIError extends AppError { // clase que extiende de AppError y define el tipo de error como GITHUB_API_ERROR. que pasa cuando hay un error en la API de GitHub.


  readonly code: string = "GITHUB_API_ERROR";
  readonly status?: number;

  constructor(userMessage: string, status?: number, cause?: unknown) {
    super(userMessage, cause);
    this.status = status;
  }
}


export class RateLimitError extends GitHubAPIError { // clase que extiende de GitHubAPIError y define el tipo de error como RATE_LIMIT_ERROR. que pasa cuando se alcanza el limite de solicitudes a la API de GitHub.
  override readonly code = "RATE_LIMIT_ERROR";
  readonly retryAfterSeconds?: number;

  constructor(userMessage: string, retryAfterSeconds?: number, cause?: unknown) {
    super(userMessage, 429, cause);
    this.retryAfterSeconds = retryAfterSeconds;
  }
}


export class NetworkError extends AppError { // clase que extiende de AppError y define el tipo de error como NETWORK_ERROR. que pasa cuando hay un error en la red.
  readonly code = "NETWORK_ERROR";
}


interface OctokitLikeError {
  status: number;
  response?: { data?: { message?: string }; headers?: Record<string, string> };
  message: string;
}

function isOctokitLikeError(error: unknown): error is OctokitLikeError { // funcion que verifica si un error es de tipo OctokitLikeError. osea si tiene un estatus.
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status: unknown }).status === "number"
  );
}

function getRetryAfterSeconds(error: OctokitLikeError): number | undefined { // funcion que obtiene el tiempo de espera para reintentar la solicitud.
  const raw = error.response?.headers?.["retry-after"];
  if (!raw) return undefined;
  const seconds = Number(raw);
  return Number.isFinite(seconds) ? seconds : undefined;
}

function isNetworkErrorMessage(message: string): boolean {
  return /ENOTFOUND|ECONNREFUSED|ECONNRESET|ETIMEDOUT|EAI_AGAIN|fetch failed/i.test(message);
}


export function classifyError(error: unknown, context?: { owner?: string; repo?: string }): AppError { // funcion que clasifica los errores que se puedan presentar en el mcp server.

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
        `GitHub rechazó la solicitud porque algunos datos no son válidos (por ejemplo, un nombre de repositorio que ya existe). Detalle: ${error.response?.data?.message ?? error.message
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
      `GitHub devolvió un error inesperado (status ${status}). Detalle: ${error.response?.data?.message ?? error.message
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
