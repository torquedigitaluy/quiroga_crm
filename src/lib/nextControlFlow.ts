// Next implementa redirect() y notFound() lanzando un "error" especial que la
// propia framework tiene que recibir. Si un try/catch de un formulario lo
// atrapa, la navegación no ocurre y se muestra "NEXT_REDIRECT" como si fuera un
// fallo. Estos helpers permiten re-lanzarlos y solo tratar como error lo real.

function digestOf(e: unknown): string | null {
  if (typeof e === "object" && e !== null && "digest" in e) {
    const d = (e as { digest?: unknown }).digest;
    if (typeof d === "string") return d;
  }
  return null;
}

/** true si el "error" es en realidad un redirect() o notFound() de Next. */
export function isNextControlFlowError(e: unknown): boolean {
  const digest = digestOf(e);
  return digest === "NEXT_NOT_FOUND" || (digest?.startsWith("NEXT_REDIRECT") ?? false);
}

/**
 * Re-lanza los redirect()/notFound() de Next para que la navegación ocurra.
 * Usar al principio del catch de cualquier formulario que llame server actions.
 */
export function rethrowIfNextControlFlow(e: unknown): void {
  if (isNextControlFlowError(e)) throw e;
}
