const nodemailer = require('nodemailer');
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, FRONTEND_URL, NODE_ENV, ADMIN_EMAIL } = require('../config/env');

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (!SMTP_USER) {
    // En desarrollo sin SMTP configurado, usar cuenta de prueba de Ethereal
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    console.log('📧 [Email] Usando cuenta de prueba Ethereal:', testAccount.user);
  } else {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }

  return transporter;
};

const sendVerificationEmail = async (email, token) => {
  const transport = await getTransporter();
  const verifyUrl = `${FRONTEND_URL}/verify?token=${token}`;

  const info = await transport.sendMail({
    from: `"Obras Particulares — Godoy Cruz" <${SMTP_FROM}>`,
    to: email,
    subject: 'Verificá tu cuenta',
    text: `Para terminar tu registro tocá el siguiente enlace:\n\n${verifyUrl}\n\nEste enlace expira en 24 horas.`,
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #f8f7ff;">
        <div style="background: white; border-radius: 16px; padding: 36px; box-shadow: 0 4px 24px rgba(0,0,0,0.07);">
          <div style="text-align: center; margin-bottom: 28px;">
            <div style="width: 56px; height: 56px; border-radius: 14px; background: linear-gradient(135deg, #7c3aed, #4f46e5); display: inline-flex; align-items: center; justify-content: center; font-size: 26px; margin-bottom: 16px;">🏗️</div>
            <h1 style="font-size: 20px; font-weight: 700; color: #1a1a2e; margin: 0;">Godoy Cruz</h1>
            <p style="font-size: 13px; color: #6b7280; margin: 4px 0 0;">Obras Particulares</p>
          </div>
          <h2 style="font-size: 18px; font-weight: 700; color: #1a1a2e; margin: 0 0 12px;">Verificá tu cuenta</h2>
          <p style="font-size: 14px; color: #374151; line-height: 1.6; margin: 0 0 24px;">
            Para terminar tu registro tocá el siguiente enlace:
          </p>
          <a href="${verifyUrl}" style="display: inline-block; padding: 13px 28px; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 600; margin-bottom: 20px;">
            Verificar cuenta
          </a>
          <p style="font-size: 12px; color: #9ca3af; margin: 16px 0 0; word-break: break-all;">
            O copiá este enlace: <a href="${verifyUrl}" style="color: #7c3aed;">${verifyUrl}</a>
          </p>
          <p style="font-size: 12px; color: #9ca3af; margin: 8px 0 0;">Este enlace expira en 24 horas.</p>
        </div>
      </div>
    `,
  });

  if (NODE_ENV !== 'production') {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log('📧 [Email] Preview URL:', previewUrl);
  }
};

const sendResetPasswordEmail = async (email, token) => {
  const transport = await getTransporter();
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;

  const info = await transport.sendMail({
    from: `"Obras Particulares — Godoy Cruz" <${SMTP_FROM}>`,
    to: email,
    subject: 'Recuperar contraseña',
    text: `Para recuperar tu contraseña tocá el siguiente enlace:\n\n${resetUrl}\n\nEste enlace expira en 1 hora. Si no solicitaste esto, ignorá este email.`,
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #f8f7ff;">
        <div style="background: white; border-radius: 16px; padding: 36px; box-shadow: 0 4px 24px rgba(0,0,0,0.07);">
          <div style="text-align: center; margin-bottom: 28px;">
            <div style="width: 56px; height: 56px; border-radius: 14px; background: linear-gradient(135deg, #7c3aed, #4f46e5); display: inline-flex; align-items: center; justify-content: center; font-size: 26px; margin-bottom: 16px;">🏗️</div>
            <h1 style="font-size: 20px; font-weight: 700; color: #1a1a2e; margin: 0;">Godoy Cruz</h1>
            <p style="font-size: 13px; color: #6b7280; margin: 4px 0 0;">Obras Particulares</p>
          </div>
          <h2 style="font-size: 18px; font-weight: 700; color: #1a1a2e; margin: 0 0 12px;">Recuperar contraseña</h2>
          <p style="font-size: 14px; color: #374151; line-height: 1.6; margin: 0 0 24px;">
            Recibimos una solicitud para restablecer la contraseña de tu cuenta. Tocá el enlace para continuar:
          </p>
          <a href="${resetUrl}" style="display: inline-block; padding: 13px 28px; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 600; margin-bottom: 20px;">
            Recuperar contraseña
          </a>
          <p style="font-size: 12px; color: #9ca3af; margin: 16px 0 0; word-break: break-all;">
            O copiá este enlace: <a href="${resetUrl}" style="color: #7c3aed;">${resetUrl}</a>
          </p>
          <p style="font-size: 12px; color: #9ca3af; margin: 8px 0 0;">Este enlace expira en 1 hora. Si no solicitaste esto, ignorá este email.</p>
        </div>
      </div>
    `,
  });

  if (NODE_ENV !== 'production') {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log('📧 [Email] Preview URL:', previewUrl);
  }
};

const sendTecnicoRegistroAdmin = async (tecnico) => {
  const transport = await getTransporter();
  const adminUrl = `${FRONTEND_URL}/admin/tecnicos`;

  const info = await transport.sendMail({
    from: `"Obras Particulares — Godoy Cruz" <${SMTP_FROM}>`,
    to: ADMIN_EMAIL,
    subject: `Nueva solicitud de registro — Técnico: ${tecnico.nombre} ${tecnico.apellido}`,
    text: `El técnico ${tecnico.nombre} ${tecnico.apellido} (DNI: ${tecnico.dni}, email: ${tecnico.email}) solicitó acceso al sistema.\n\nIniciá sesión para aprobar o rechazar: ${adminUrl}`,
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #f8f7ff;">
        <div style="background: white; border-radius: 16px; padding: 36px; box-shadow: 0 4px 24px rgba(0,0,0,0.07);">
          <div style="text-align: center; margin-bottom: 28px;">
            <div style="width: 56px; height: 56px; border-radius: 14px; background: linear-gradient(135deg, #7c3aed, #4f46e5); display: inline-flex; align-items: center; justify-content: center; font-size: 26px; margin-bottom: 16px;">🏗️</div>
            <h1 style="font-size: 20px; font-weight: 700; color: #1a1a2e; margin: 0;">Godoy Cruz</h1>
            <p style="font-size: 13px; color: #6b7280; margin: 4px 0 0;">Obras Particulares</p>
          </div>
          <h2 style="font-size: 18px; font-weight: 700; color: #1a1a2e; margin: 0 0 16px;">Nueva solicitud de técnico</h2>
          <div style="background: #f8f7ff; border-radius: 10px; padding: 16px; margin: 0 0 24px; border: 1px solid #e5e7eb;">
            <p style="margin: 0 0 8px; font-size: 14px; color: #374151;"><strong>Nombre:</strong> ${tecnico.nombre} ${tecnico.apellido}</p>
            <p style="margin: 0 0 8px; font-size: 14px; color: #374151;"><strong>DNI:</strong> ${tecnico.dni}</p>
            <p style="margin: 0; font-size: 14px; color: #374151;"><strong>Email:</strong> ${tecnico.email}</p>
          </div>
          <p style="font-size: 14px; color: #374151; line-height: 1.6; margin: 0 0 24px;">
            Este técnico solicita acceso al sistema. Ingresá al panel de administración para aprobar o rechazar la solicitud.
          </p>
          <a href="${adminUrl}" style="display: inline-block; padding: 13px 28px; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 600;">
            Ir al panel de administración
          </a>
        </div>
      </div>
    `,
  });

  if (NODE_ENV !== 'production') {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log('📧 [Email admin] Preview URL:', previewUrl);
  }
};

const sendTecnicoAprobado = async (email, nombre) => {
  const transport = await getTransporter();
  const loginUrl = `${FRONTEND_URL}/login`;

  await transport.sendMail({
    from: `"Obras Particulares — Godoy Cruz" <${SMTP_FROM}>`,
    to: email,
    subject: 'Tu cuenta fue aprobada',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #f8f7ff;">
        <div style="background: white; border-radius: 16px; padding: 36px; box-shadow: 0 4px 24px rgba(0,0,0,0.07);">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 48px; margin-bottom: 12px;">✅</div>
            <h1 style="font-size: 20px; font-weight: 700; color: #1a1a2e; margin: 0;">Cuenta aprobada</h1>
          </div>
          <p style="font-size: 14px; color: #374151; line-height: 1.6; margin: 0 0 24px;">
            Hola <strong>${nombre}</strong>, tu solicitud de acceso como técnico fue aprobada. Ya podés iniciar sesión en el sistema.
          </p>
          <a href="${loginUrl}" style="display: inline-block; padding: 13px 28px; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 600;">
            Iniciar sesión
          </a>
        </div>
      </div>
    `,
  });
};

const sendTecnicoRechazado = async (email, nombre) => {
  const transport = await getTransporter();

  await transport.sendMail({
    from: `"Obras Particulares — Godoy Cruz" <${SMTP_FROM}>`,
    to: email,
    subject: 'Tu solicitud de registro fue rechazada',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #f8f7ff;">
        <div style="background: white; border-radius: 16px; padding: 36px; box-shadow: 0 4px 24px rgba(0,0,0,0.07);">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 48px; margin-bottom: 12px;">❌</div>
            <h1 style="font-size: 20px; font-weight: 700; color: #1a1a2e; margin: 0;">Solicitud rechazada</h1>
          </div>
          <p style="font-size: 14px; color: #374151; line-height: 1.6; margin: 0;">
            Hola <strong>${nombre}</strong>, lamentablemente tu solicitud de acceso como técnico no fue aprobada. Para más información contactá a la administración municipal.
          </p>
        </div>
      </div>
    `,
  });
};

module.exports = { sendVerificationEmail, sendResetPasswordEmail, sendTecnicoRegistroAdmin, sendTecnicoAprobado, sendTecnicoRechazado };
