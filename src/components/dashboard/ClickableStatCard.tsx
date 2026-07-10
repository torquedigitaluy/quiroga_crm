"use client";

import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ClickableStatCard({
  label,
  value,
  variant = "default",
  title,
  description,
  children,
}: {
  label: string;
  value: string;
  variant?: "default" | "warning" | "danger";
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const color =
    variant === "warning" ? "text-warning-foreground" : variant === "danger" ? "text-danger" : "text-foreground";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="text-left transition hover:opacity-80">
          <Card className="cursor-pointer">
            <CardContent className="flex flex-col gap-1 p-4">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
              <span className={`text-lg font-semibold ${color}`}>{value}</span>
              <span className="text-xs text-brand">Ver detalle →</span>
            </CardContent>
          </Card>
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
