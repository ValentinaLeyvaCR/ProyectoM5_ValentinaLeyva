import zod from "zod"; // Importa la librería zod para la validación de esquemas
export function registerSum(server) {
    server.registerTool("sum", {
        description: "Returns the sum of two numbers.", // Descripción de la tool sum que dice que se encarga de sumar dos números
        inputSchema: { a: zod.number(), b: zod.number() }, // Define el esquema de entrada que espera dos números: a y b
    }, async ({ a, b }) => ({
        content: [{ type: "text", text: String(a + b) }] // Devuelve la suma de a y b como contenido de tipo texto
    }));
}
//# sourceMappingURL=sum.js.map