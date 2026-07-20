-- CreateTable
CREATE TABLE "ComentarioAsistencia" (
    "id" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "texto" TEXT NOT NULL,
    "autorId" TEXT,
    "autorNombre" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComentarioAsistencia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ComentarioAsistencia_anio_mes_idx" ON "ComentarioAsistencia"("anio", "mes");
