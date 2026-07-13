"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function RevealableStat({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: string;
  variant?: "default" | "warning" | "danger";
}) {
  const [revealed, setRevealed] = useState(false);
  const color = variant === "warning" ? "text-warning-foreground" : variant === "danger" ? "text-danger" : "text-foreground";

  return (
    <Card>
      <CardContent className="flex flex-col gap-1 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
          >
            {revealed ? (
              <>
                <EyeOff className="h-3 w-3" /> Ocultar
              </>
            ) : (
              <>
                <Eye className="h-3 w-3" /> Ver
              </>
            )}
          </button>
        </div>
        <span className={`text-lg font-semibold ${revealed ? color : "select-none text-muted-foreground"}`}>
          {revealed ? value : "• • • • • •"}
        </span>
      </CardContent>
    </Card>
  );
}
