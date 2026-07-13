"use client";

const SORT_OPTIONS = [
  { value: "fechaIngreso_asc", label: "Ingreso: más antiguo primero" },
  { value: "fechaIngreso_desc", label: "Ingreso: más nuevo primero" },
  { value: "precio_asc", label: "Precio: menor a mayor" },
  { value: "precio_desc", label: "Precio: mayor a menor" },
  { value: "marca_asc", label: "Marca: A-Z" },
  { value: "marca_desc", label: "Marca: Z-A" },
];

export function StockSortSelect({ defaultValue }: { defaultValue: string }) {
  return (
    <select
      name="sortCombo"
      defaultValue={defaultValue}
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
      className="h-9 rounded-md border border-border bg-surface px-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
