// 引入必要的模組
import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// 初始化 dotenv 配置
dotenv.config();

// 創建 Express 應用
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 定義一個簡單的根路由
app.get('/', (req, res) => {
  res.send('Hello, Render!');
});

// 定義一個使用 nodemailer 的測試 POST 路由
app.post('/send-email', async (req, res) => {
  const { to, subject, text } = req.body;

  try {
    // 配置郵件服務
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL, // 你的 Gmail 地址
        pass: process.env.PASSWORD // 你的 Gmail 應用程式密碼
      }
    });

    // 發送郵件
    const info = await transporter.sendMail({
      from: process.env.EMAIL, // 發件人
      to, // 收件人
      subject, // 郵件主題
      text // 郵件內容
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