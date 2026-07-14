"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";

export type ImagenData = { id: string; dataUrl: string };

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
        setError(e instanceof Error ? e.message : "Error al subir las imágenes");
      }
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {imagenes.length > 0 && (
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
      )}
      {imagenes.length === 0 && <p className="text-sm text-muted-foreground">Sin fotos cargadas todavía.</p>}

      {editable && (
        <form id="imagenes-upload-form" action={handleUpload} className="flex items-end gap-2">
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
