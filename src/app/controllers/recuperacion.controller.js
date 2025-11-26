import {
	Usuario,
	TokenRecuperacion,
} from '../models/index.js';
import bcrypt from 'bcrypt';
import transporter from '../utils/mailer.js'; 
import crypto from 'crypto';

export const enviarCorreoRecuperacion = async (req, res) => {
  const { email } = req.body;

  try {
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) return res.status(200).json({ message: 'Si el email existe, se enviará el enlace.' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiracion = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await TokenRecuperacion.create({
      id_usuario: usuario.id_usuario,
      token,
      expiracion,
    });

    const enlace = `http://localhost:3000/api/recuperacion/restablecer-password/${token}`;

    await transporter.sendMail({
      to: email,
      subject: 'Recuperación de contraseña',
      html: `
        <p>Hola ${usuario.username},</p>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${enlace}">${enlace}</a>
        <p>Este enlace expirará en 1 hora.</p>
      `,
    });

    res.status(200).json({ message: 'Correo enviado' });
  } catch (error) {
    console.error('❌ Error al enviar email:', error);
    console.error(error); 
    res.status(500).json({ message: 'Error interno' });
  }
};

export const procesarRestablecerPassword = async (req, res) => {
  const { token } = req.params;
  const { nueva, confirmar } = req.body;

  if (!nueva || !confirmar || nueva !== confirmar) {
    return res.render('restablecerPassword', {
      token,
      error: 'Las contraseñas no coinciden o están incompletas',
    });
  }

  try {
    const registro = await TokenRecuperacion.findOne({ where: { token } });

    if (!registro || new Date() > registro.expiracion) {
      return res.render('mensaje', {
        titulo: 'Enlace vencido',
        mensaje: 'Solicita una nueva recuperación de contraseña.',
      });
    }

    const hash = await bcrypt.hash(nueva, 10);
    await Usuario.update(
      { password: hash },
      { where: { id_usuario: registro.id_usuario } }
    );

    await TokenRecuperacion.destroy({ where: { token } });

    res.render('mensaje', {
      titulo: 'Contraseña actualizada',
      mensaje: 'Ya podés iniciar sesión con tu nueva contraseña.',
    });
  } catch (error) {
    console.error('❌ Error al restablecer contraseña:', error);
    res.status(500).send('Error interno');
  }
};

export const vistaFormularioRestablecer = async (req, res) => {
  const { token } = req.params;

  try {
    const registro = await TokenRecuperacion.findOne({ where: { token } });

    if (!registro || new Date() > registro.expiracion) {
      return res.render('mensaje', {
        titulo: 'Enlace inválido o expirado',
        mensaje: 'Solicitá nuevamente la recuperación de contraseña.',
      });
    }

    res.render('restablecerPassword', { token, error: null });
  } catch (error) {
    console.error('❌ Error al cargar formulario:', error);
    res.status(500).send('Error interno');
  }
};

