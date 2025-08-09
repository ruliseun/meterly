import MailDev from "maildev";
import nodemailer, { Transporter } from "nodemailer";
import Logger from "../../utils/logger";
import { emailPassword, emailUser, nodeEnv } from "../../config/env";
import { Environments } from "../../enums/env.enum";

interface ISendEmail {
  receiverEmail: string;
  subject: string;
  text: string;
  html: string;
  hasAttachment?: boolean;
  attachmentFile?: string | Buffer | NodeJS.ReadWriteStream;
  filename?: string;
  sender?: string;
  contentType?: "application/pdf" | "image/png" | "image/jpg";
}

const senderMail = "support@meterly.com";
let transporter: Transporter;

if (nodeEnv === Environments.DEVELOPMENT || nodeEnv === Environments.LOCAL) {
  const maildev = new MailDev({
    smtp: 1025,
  });

  maildev.listen();

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  transporter = nodemailer.createTransport({
    host: "localhost",
    port: 1025,
    secure: false,
    tls: {
      rejectUnauthorized: false,
    },
  });
} else {
  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });
}

// eslint-disable-next-line max-params
async function sendMail({
  receiverEmail,
  subject,
  text,
  html,
  sender,
}: ISendEmail) {
  const mailOptions = {
    from: sender ? `Support <${sender}>` : `Meterly ⚡︎ <${senderMail}>`,
    to: receiverEmail,
    subject,
    text,
    html,
  };

  if (nodeEnv === Environments.DEVELOPMENT || nodeEnv === Environments.LOCAL) {
    return transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending test email:", error);
        Logger.error("Error sending test email:", error);
      } else {
        console.info(`Email sent: ${mailOptions.to} ` + info.response);
        Logger.info(`Email sent: ${mailOptions.to} ` + info.response);
      }
    });
  } else {
    try {
      await transporter.sendMail(mailOptions);
      console.info(`Email sent: ${mailOptions.to}`);
    } catch (error) {
      console.error("Error sending email", error);
    }
  }
}

const EmailService = { sendMail };

export default EmailService;
