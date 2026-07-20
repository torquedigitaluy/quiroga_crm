"use client";

const SORT_OPTIONS = [
  { value: "marca_asc", label: "Marca: A-Z" },
  { value: "marca_desc", label: "Marca: Z-A" },
  { value: "fechaIngreso_desc", label: "Ingreso: más nuevo primero" },
  { value: "fechaIngreso_asc", label: "Ingreso: más antiguo primero" },
];

export function CostosSortSelect({ defaultValue }: { defaultValue: string }) {
  return (
    <select
      name="sortCombo"
      defaultValue={defaultValue}
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
      className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
