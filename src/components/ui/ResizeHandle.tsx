"use client";

export function ResizeHandle({ onResizeStart }: { onResizeStart: (e: React.MouseEvent) => void }) {
  return (
    <span
      onMouseDown={onResizeStart}
      role="separator"
      aria-orientation="vertical"
      className="absolute right-0 top-0 h-full w-2 cursor-col-resize select-none touch-none hover:bg-brand/30 active:bg-brand/50"
    />
  );
}
