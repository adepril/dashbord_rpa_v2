import nodemailer from 'nodemailer';
import { ContactFormData } from '../schemas/contact';

export const createMailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const createMailOptions = (data: ContactFormData) => {
  // Remplacer les retours à la ligne par des balises <br>
  const formattedMessage = data.message.replace(/\n/g, '<br>');
  
  return {
    from: data.email,
    to: 'groupebbl.rpa@gmail.com',
    subject: `${data.subject}`,
    html: `
      <p>${formattedMessage}</p>
    `,
  };
};

/* html: `
<p><strong>Name:</strong> ${data.name}</p>
<p><strong>Email:</strong> ${data.email}</p>
<p><strong>Subject:</strong> ${data.subject}</p>
<p><strong>Message:</strong></p>
<p>${formattedMessage}</p>
`, */