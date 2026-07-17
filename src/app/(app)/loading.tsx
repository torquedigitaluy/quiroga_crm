// Sin un loading.tsx el App Router bloquea la navegación: al hacer clic no pasa
// nada visible hasta que el servidor termina de responder (se siente como si
// "pensara"). Con esto la navegación es inmediata y se muestra un esqueleto.

function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />;
}

export default function Loading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Cargando">
      <div className="flex flex-col gap-2">
        <Bar className="h-7 w-64" />
        <Bar className="h-4 w-96" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Bar key={i} className="h-20" />
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Bar className="h-9 w-full" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Bar key={i} className="h-11 w-full" />
        ))}
      </div>
    </div>
  );
}
