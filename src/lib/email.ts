import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  if (!host || !port || !user || !password) {
    throw new Error("SMTP no configurado: faltan variables de entorno SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASSWORD.");
  }
  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass: password },
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM ?? "Quiroga Automóviles <no-reply@quirogaautomoviles.com>";

  await transporter.sendMail({
    from,
    to,
    subject: "Recuperar contraseña — Quiroga Automóviles",
    html: `
      <p>Recibimos una solicitud para restablecer tu contraseña en el sistema de Quiroga Automóviles.</p>
      <p><a href="${resetUrl}">Hacé clic acá para elegir una nueva contraseña</a></p>
      <p>Este enlace vence en 1 hora. Si vos no pediste este cambio, podés ignorar este email.</p>
    `,
  });
}

export async function sendLoginCodeEmail(to: string, code: string) {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM ?? "Quiroga Automóviles <no-reply@quirogaautomoviles.com>";

  await transporter.sendMail({
    from,
    to,
    subject: `${code} — Código de acceso a Quiroga Automóviles`,
    html: `
      <p>Tu código para iniciar sesión en el sistema de Quiroga Automóviles es:</p>
      <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px;">${code}</p>
      <p>Vence en 10 minutos. Si vos no intentaste iniciar sesión, ignorá este email.</p>
    `,
  });
}
