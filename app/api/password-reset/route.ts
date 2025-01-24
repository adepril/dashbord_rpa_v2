import { createMailOptions, createMailTransporter } from '../../../lib/mail/nodemailer';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, login, password } = await req.json();

    const transporter = createMailTransporter();
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Récupération de mot de passe - Dashboard RPA',
      html: `
        <h2>Récupération de mot de passe</h2>
        <p>Voici votre mot de passe pour le Dashboard RPA :</p>
        <p><strong>${password}</strong></p>
        <p>Pour rappel, votre identifiant est : <strong>${login}</strong></p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Email envoyé avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de l\'email' },
      { status: 500 }
    );
  }
}
