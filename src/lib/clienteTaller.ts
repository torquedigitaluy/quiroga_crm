import { db } from "@/lib/db";

/**
 * Busca un Cliente existente por nombre (y teléfono si está disponible) o lo
 * crea. Usado por Taller y Presupuestos para armar automáticamente la base de
 * clientes a partir de los datos sueltos que ya se tipean en esos formularios.
 */
export async function findOrCreateCliente(nombre: string, telefono: string | null): Promise<string | null> {
  const nombreLimpio = nombre.trim();
  if (!nombreLimpio) return null;

  const existente = await db.cliente.findFirst({
    where: {
      nombre: { equals: nombreLimpio, mode: "insensitive" },
      ...(telefono ? { OR: [{ contacto: telefono }, { contacto: null }] } : {}),
    },
    orderBy: { updatedAt: "desc" },
  });
  if (existente) {
    if (telefono && !existente.contacto) {
      await db.cliente.update({ where: { id: existente.id }, data: { contacto: telefono } });
    }
    return existente.id;
  }

  const creado = await db.cliente.create({ data: { nombre: nombreLimpio, contacto: telefono || null } });
  return creado.id;
}

export type CandidatoClienteTaller = {
  clienteId: string | null;
  clienteNombre: string;
  clienteTelefono: string | null;
  clienteDireccion: string | null;
  vehiculoId: string | null;
  vehMarca: string | null;
  vehModelo: string | null;
  vehVersion: string | null;
  vehAnio: number | null;
  vehColor: string | null;
  vehMatricula: string | null;
  vehKm: number | null;
  vehChasis: string | null;
  vehCombustible: string | null;
};

/**
 * Busca coincidencias por nombre de cliente o matrícula en el historial de
 * órdenes de taller y presupuestos, para autocompletar un formulario nuevo.
 * Devuelve como mucho una fila por cliente/vehículo (la más reciente).
 */
export async function buscarClientesTaller(query: string): Promise<CandidatoClienteTaller[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const [ordenes, presupuestos] = await Promise.all([
    db.ordenTaller.findMany({
      where: {
        archivedAt: null,
        OR: [
          { clienteNombre: { contains: q, mode: "insensitive" } },
          { vehMatricula: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    db.presupuesto.findMany({
      where: {
        archivedAt: null,
        OR: [
          { clienteNombre: { contains: q, mode: "insensitive" } },
          { vehMatricula: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const candidatos: (CandidatoClienteTaller & { createdAt: Date })[] = [
    ...ordenes
      .filter((o) => o.clienteNombre)
      .map((o) => ({
        clienteId: o.clienteId,
        clienteNombre: o.clienteNombre as string,
        clienteTelefono: o.clienteTelefono,
        clienteDireccion: o.clienteDireccion,
        vehiculoId: o.vehiculoId,
        vehMarca: o.vehMarca,
        vehModelo: o.vehModelo,
        vehVersion: o.vehVersion,
        vehAnio: o.vehAnio,
        vehColor: o.vehColor,
        vehMatricula: o.vehMatricula,
        vehKm: o.vehKm,
        vehChasis: o.vehChasis,
        vehCombustible: o.vehCombustible,
        createdAt: o.createdAt,
      })),
    ...presupuestos
      .filter((p) => p.clienteNombre)
      .map((p) => ({
        clienteId: p.clienteId,
        clienteNombre: p.clienteNombre as string,
        clienteTelefono: p.clienteTelefono,
        clienteDireccion: null,
        vehiculoId: p.vehiculoId,
        vehMarca: p.vehMarca,
        vehModelo: p.vehModelo,
        vehVersion: null,
        vehAnio: null,
        vehColor: null,
        vehMatricula: p.vehMatricula,
        vehKm: null,
        vehChasis: null,
        vehCombustible: p.vehCombustible,
        createdAt: p.createdAt,
      })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const vistos = new Set<string>();
  const resultado: CandidatoClienteTaller[] = [];
  for (const c of candidatos) {
    const key = `${c.clienteNombre.trim().toLowerCase()}|${(c.vehMatricula ?? "").trim().toLowerCase()}`;
    if (vistos.has(key)) continue;
    vistos.add(key);
    const { clienteId, clienteNombre, clienteTelefono, clienteDireccion, vehiculoId, vehMarca, vehModelo, vehVersion, vehAnio, vehColor, vehMatricula, vehKm, vehChasis, vehCombustible } = c;
    resultado.push({ clienteId, clienteNombre, clienteTelefono, clienteDireccion, vehiculoId, vehMarca, vehModelo, vehVersion, vehAnio, vehColor, vehMatricula, vehKm, vehChasis, vehCombustible });
    if (resultado.length >= 8) break;
  }
  return resultado;
}
