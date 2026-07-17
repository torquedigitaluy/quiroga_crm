type VehiculoLike = { marca: string; modelo: string; matricula?: string | null } | null | undefined;

/** Label consistente para filas que pueden venir del stock o ser un vehículo externo cargado a mano. */
export function vehiculoLabel(vehiculo: VehiculoLike, vehiculoExterno?: string | null): string {
  if (vehiculo) return `${vehiculo.marca} ${vehiculo.modelo}`;
  return vehiculoExterno || "Vehículo externo";
}
