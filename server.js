import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 根路由
app.get('/', (req, res) => {
  res.send('Hello, Render!');
});

// 測試郵件發送
app.post('/send-email', async (req, res) => {
  const { to, subject, text } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
      }
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL,
      to,
      subject,
      text
    });

    res.status(200).json({ message: 'Email sent successfully!', info });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send email', error });
  }
});

// 啟動服務器
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});