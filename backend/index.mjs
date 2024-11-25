import express from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import cors from "cors";
import { Expo } from "expo-server-sdk";

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Initialize Expo SDK
let expo = new Expo();

const PORT = process.env.PORT || 3000;

// Configure SMTP transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "semnomealen@gmail.com", // Your email
    pass: "txsv epdj ftur tczr", // Your password or app password
  },
  tls: {
    rejectUnauthorized: false, // Disable certificate check (for development)
  },
});

// Route to send email
app.post("/send-email", (req, res) => {
  const { email, codigo } = req.body;

  // Email options
  const mailOptions = {
    from: "bonpointetectcc@gmail.com",
    to: email,
    subject: "Código de Verificação",
    text: `Seu código de verificação é: ${codigo}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Erro ao enviar e-mail:", error);
      return res.status(500).send("Erro ao enviar e-mail.");
    }
    console.log("E-mail enviado:", info.response);
    return res.status(200).send("E-mail enviado com sucesso!");
  });
});

// Route to handle report submissions
app.post("/denunciar", (req, res) => {
  const { email, mensagem } = req.body;

  if (!email || !mensagem) {
    return res.status(400).send("Email e mensagem são obrigatórios.");
  }

  const mailOptions = {
    from: "bonpointetectcc@gmail.com",
    to: "bonpointetectcc@gmail.com",
    subject: "Denúncia de Usuário",
    text: `Mensagem de denúncia:\n\n${mensagem}\n\nEnviada por: ${email}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Erro ao enviar e-mail de denúncia:", error);
      return res.status(500).send("Erro ao enviar denúncia.");
    }
    console.log("Denúncia enviada:", info.response);
    return res.status(200).send("Denúncia enviada com sucesso!");
  });
});

// Endpoint to send notifications
app.post("/send-notification", async (req, res) => {
  const { token, title, body } = req.body;

  console.log("Received notification request:", { token, title, body });

  if (!token || !title || !body) {
    console.log("Missing fields");
    return res.status(400).send("Token, title, and body are required.");
  }

  const messages = [
    {
      to: token,
      sound: "default",
      title: title,
      body: body,
    },
  ];

  try {
    const receipt = await expo.sendPushNotificationsAsync(messages);
    console.log("Successfully sent message:", receipt);
    res.status(200).send("Notification sent successfully");
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).send("Error sending notification");
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
