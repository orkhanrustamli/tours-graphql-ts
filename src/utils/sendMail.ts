import nodemailer from "nodemailer";

export default async (options: { reciever: string; subject: string; message: string }) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST!,
    port: +process.env.EMAIL_SMTP_PORT!,
    auth: {
      user: process.env.EMAIL_AUTH_USER!,
      pass: process.env.EMAIL_AUTH_PASSWORD!,
    },
  });

  interface MailProperties {
    from: string;
    to: string;
    subject: string;
    text: string;
  }

  const mailProperties: MailProperties = {
    from: "Orkhan Rustamli <orkhan@gmail.com>",
    to: options.reciever,
    subject: options.subject,
    text: options.message,
  };

  await transport.sendMail(mailProperties);
};
