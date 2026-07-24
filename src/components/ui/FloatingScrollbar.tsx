"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Barra de scroll horizontal "flotante", sincronizada con el scroll real de
 * `targetRef`. Queda pegada (sticky) al fondo del contenedor donde se
 * renderiza, así siempre está a mano sin tener que bajar hasta el final de
 * una tabla larga para encontrar la barra nativa del navegador.
 */
export function FloatingScrollbar({ targetRef }: { targetRef: React.RefObject<HTMLDivElement | null> }) {
  const barRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const syncing = useRef(false);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;
    const update = () => setContentWidth(target.scrollWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(target);
    return () => ro.disconnect();
  }, [targetRef]);

  useEffect(() => {
    const target = targetRef.current;
    const bar = barRef.current;
    if (!target || !bar) return;

    const onTargetScroll = () => {
      if (syncing.current) {
        syncing.current = false;
        return;
      }
      syncing.current = true;
      bar.scrollLeft = target.scrollLeft;
    };
    const onBarScroll = () => {
      if (syncing.current) {
        syncing.current = false;
        return;
      }
      syncing.current = true;
      target.scrollLeft = bar.scrollLeft;
    };

    target.addEventListener("scroll", onTargetScroll);
    bar.addEventListener("scroll", onBarScroll);
    return () => {
      target.removeEventListener("scroll", onTargetScroll);
      bar.removeEventListener("scroll", onBarScroll);
    };
  }, [targetRef]);

  if (contentWidth <= 0) return null;

  return (
    <div
      ref={barRef}
      className="sticky bottom-0 z-20 overflow-x-auto overflow-y-hidden rounded-b-lg border-x border-b border-border bg-surface-muted"
      style={{ scrollbarWidth: "auto" }}
    >
      <div style={{ width: contentWidth, height: 12 }} />
    </div>
  );
}
