import zod from "zod";


const repositoryNameSchema = zod
  .string()
  .min(3, "El nombre del repositorio debe tener al menos 3 caracteres.")
  .max(100, "El nombre del repositorio no puede superar los 100 caracteres.")
  .regex(
    /^[A-Za-z0-9._-]+$/,
    "El nombre del repositorio solo puede contener letras, números, guiones, guiones bajos y puntos."
  )
  .describe(
    "Nombre del repositorio de GitHub. Entre 3 y 100 caracteres: letras, números, guiones, guiones bajos y puntos."
  );

const ownerSchema = zod
  .string()
  .min(1, "Usuario no puede estar vacío.")
  .describe("Usuario  dueño del repositorio en GitHub.");



export const createRepositoryShape = {
  name: repositoryNameSchema,
  description: zod
    .string()
    .max(350, "La descripción no puede superar los 350 caracteres.")
    .optional()
    .describe("Descripción breve del repositorio (opcional)."),
  isPrivate: zod
    .boolean()
    .optional()
    .describe("true para crear el repositorio como privado. Por defecto es público (false)."),
};
export const createRepositorySchema = zod.object(createRepositoryShape);



export const listRepositoriesShape = {
  perPage: zod
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe("Cantidad de repositorios por página (1-100). Por defecto 30."),
  page: zod
    .number()
    .int()
    .min(1)
    .optional()
    .describe("Número de página a consultar, empezando en 1. Por defecto 1."),
};
export const listRepositoriesSchema = zod.object(listRepositoriesShape);



export const createIssueShape = {
  owner: ownerSchema,
  repo: repositoryNameSchema,
  title: zod
    .string()
    .min(1, "El título del issue no puede estar vacío.")
    .max(256, "El título del issue no puede superar los 256 caracteres.")
    .describe("Título del issue a crear."),
  body: zod
    .string()
    .max(65536, "El cuerpo del issue es demasiado largo.")
    .optional()
    .describe("Descripción/cuerpo del issue en formato Markdown (opcional)."),
};
export const createIssueSchema = zod.object(createIssueShape);



export const listIssuesShape = {
  owner: ownerSchema,
  repo: repositoryNameSchema,
  state: zod
    .enum(["open", "closed", "all"])
    .optional()
    .describe("Filtro de estado de los issues a listar. Por defecto 'open'."),
};
export const listIssuesSchema = zod.object(listIssuesShape);



export const createCommitShape = {
  owner: ownerSchema,
  repo: repositoryNameSchema,
  path: zod
    .string()
    .min(1, "La ruta del archivo no puede estar vacía.")
    .describe("Ruta del archivo dentro del repositorio."),
  content: zod
    .string()
    .min(1, "El contenido del archivo no puede estar vacío.")
    .describe("Contenido del archivo en texto plano."),
  message: zod
    .string()
    .min(1, "El mensaje de commit no puede estar vacío.")
    .max(500, "El mensaje de commit es demasiado largo.")
    .describe("Mensaje del commit."),
  branch: zod
    .string()
    .optional()
    .describe("Donde crear/actualizar el archivo."),
};
export const createCommitSchema = zod.object(createCommitShape);
