"use client";

import { useRef, useState, useEffect } from "react";
import { Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Firma a mano con mouse o dedo (touch), sin dependencias externas: dibuja
 * en un <canvas> y expone el resultado como PNG base64 en un input oculto. */
export function SignaturePad({
  name,
  initialDataUrl,
}: {
  name: string;
  initialDataUrl?: string | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [value, setValue] = useState(initialDataUrl ?? "");
  const drawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !initialDataUrl) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    img.src = initialDataUrl;
  }, [initialDataUrl]);

  function getPoint(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    e.preventDefault();
    drawing.current = true;
    lastPoint.current = getPoint(e);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !lastPoint.current) return;
    const point = getPoint(e);
    ctx.strokeStyle = "#1a1d29";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPoint.current = point;
  }

  function handlePointerUp() {
    if (!drawing.current) return;
    drawing.current = false;
    const canvas = canvasRef.current;
    if (canvas) setValue(canvas.toDataURL("image/png"));
  }

  function handleClear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setValue("");
  }

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={value} />
      <canvas
        ref={canvasRef}
        width={500}
        height={160}
        className="w-full touch-none rounded-md border border-border bg-white"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Firmá con el dedo o el mouse.</p>
        <Button type="button" variant="outline" size="sm" onClick={handleClear}>
          <Eraser className="h-3.5 w-3.5" />
          Borrar
        </Button>
      </div>
    </div>
  );
}
