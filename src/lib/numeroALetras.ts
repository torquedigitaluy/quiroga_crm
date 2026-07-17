// Convierte un entero (0..999.999.999) a su representación en letras en español,
// en MAYÚSCULAS. Se usa para el "monto en letras" del Conforme.
// Ej: 115 -> "CIENTO QUINCE", 2500 -> "DOS MIL QUINIENTOS".

const UNIDADES = [
  "",
  "UNO",
  "DOS",
  "TRES",
  "CUATRO",
  "CINCO",
  "SEIS",
  "SIETE",
  "OCHO",
  "NUEVE",
  "DIEZ",
  "ONCE",
  "DOCE",
  "TRECE",
  "CATORCE",
  "QUINCE",
  "DIECISÉIS",
  "DIECISIETE",
  "DIECIOCHO",
  "DIECINUEVE",
  "VEINTE",
];

const DECENAS = ["", "", "VEINTI", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];

const CENTENAS = [
  "",
  "CIENTO",
  "DOSCIENTOS",
  "TRESCIENTOS",
  "CUATROCIENTOS",
  "QUINIENTOS",
  "SEISCIENTOS",
  "SETECIENTOS",
  "OCHOCIENTOS",
  "NOVECIENTOS",
];

function menorA100(n: number): string {
  if (n <= 20) return UNIDADES[n];
  if (n < 30) return `VEINTI${UNIDADES[n - 20]}`.replace("VEINTIUNO", "VEINTIUNO");
  const d = Math.floor(n / 10);
  const u = n % 10;
  return u === 0 ? DECENAS[d] : `${DECENAS[d]} Y ${UNIDADES[u]}`;
}

function menorA1000(n: number): string {
  if (n === 100) return "CIEN";
  const c = Math.floor(n / 100);
  const resto = n % 100;
  const centena = CENTENAS[c];
  if (resto === 0) return centena;
  return centena ? `${centena} ${menorA100(resto)}` : menorA100(resto);
}

export function numeroALetras(numero: number): string {
  const n = Math.floor(Math.abs(numero));
  if (n === 0) return "CERO";

  const millones = Math.floor(n / 1_000_000);
  const miles = Math.floor((n % 1_000_000) / 1000);
  const resto = n % 1000;

  const partes: string[] = [];

  if (millones > 0) {
    partes.push(millones === 1 ? "UN MILLÓN" : `${menorA1000(millones)} MILLONES`);
  }
  if (miles > 0) {
    partes.push(miles === 1 ? "MIL" : `${menorA1000(miles)} MIL`);
  }
  if (resto > 0) {
    partes.push(menorA1000(resto));
  }

  return partes.join(" ").trim();
}
