"use client";
import { rethrowIfNextControlFlow } from "@/lib/nextControlFlow";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";

export type ImagenData = { id: string; dataUrl: string; categoria: string };

const CATEGORIA_LABELS: Record<string, string> = {
  INGRESO: "Al ingresar",
  REPARACION: "Durante la reparación",
  FINALIZADO: "Al finalizar",
  OTRA: "Otras",
};

function GaleriaCategoria({
  titulo,
  imagenes,
  editable,
  onDelete,
}: {
  titulo: string;
  imagenes: ImagenData[];
  editable: boolean;
  onDelete: (imagenId: string) => Promise<void>;
}) {
  if (imagenes.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium text-foreground">{titulo}</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {imagenes.map((img) => (
          <div key={img.id} className="group relative overflow-hidden rounded-md border border-border">
            <a href={img.dataUrl} target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.dataUrl} alt="Foto de la orden" className="h-32 w-full object-cover" />
            </a>
            {editable && (
              <div className="absolute right-1 top-1">
                <ConfirmDeleteButton
                  onConfirm={() => onDelete(img.id)}
                  title="Eliminar foto"
                  description="¿Estás seguro que querés eliminar esta foto?"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ImagenesGallery({
  imagenes,
  editable,
  onUpload,
  onDelete,
}: {
  imagenes: ImagenData[];
  editable: boolean;
  onUpload: (formData: FormData) => Promise<void>;
  onDelete: (imagenId: string) => Promise<void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleUpload = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await onUpload(formData);
        router.refresh();
        const form = document.getElementById("imagenes-upload-form") as HTMLFormElement | null;
        form?.reset();
      } catch (e) {
        rethrowIfNextControlFlow(e);
        setError(e instanceof Error ? e.message : "Error al subir las imágenes");
      }
    });
  };

  const porCategoria = (cat: string) => imagenes.filter((i) => i.categoria === cat);

  return (
    <div className="flex flex-col gap-4">
      <GaleriaCategoria titulo="Al ingresar" imagenes={porCategoria("INGRESO")} editable={editable} onDelete={onDelete} />
      <GaleriaCategoria titulo="Durante la reparación" imagenes={porCategoria("REPARACION")} editable={editable} onDelete={onDelete} />
      <GaleriaCategoria titulo="Al finalizar" imagenes={porCategoria("FINALIZADO")} editable={editable} onDelete={onDelete} />
      <GaleriaCategoria titulo="Otras" imagenes={porCategoria("OTRA")} editable={editable} onDelete={onDelete} />
      {imagenes.length === 0 && <p className="text-sm text-muted-foreground">Sin fotos cargadas todavía.</p>}

      {editable && (
        <form id="imagenes-upload-form" action={handleUpload} className="flex flex-wrap items-end gap-2">
          <div className="flex w-48 flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Categoría</label>
            <Select name="categoria" defaultValue="OTRA">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORIA_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <input
            type="file"
            name="imagenes"
            accept="image/*"
            multiple
            className="text-sm text-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-surface file:px-3 file:py-1.5 file:text-sm file:font-medium"
          />
          <Button type="submit" variant="outline" disabled={pending}>
            <Upload className="h-4 w-4" />
            Subir
          </Button>
        </form>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
