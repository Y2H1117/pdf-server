require('dotenv').config(); // 加載環境變數
console.log('GMAIL_USER:', process.env.GMAIL_USER);
console.log('GMAIL_PASS:', process.env.GMAIL_PASS);
const nodemailer = require('nodemailer'); // 引入 nodemailer 模組

// 設置 Gmail SMTP 配置
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587, // 使用 587（STARTTLS）或 465（SSL）
  secure: false, // 如果使用 465，設置為 true
  auth: {
    user: process.env.GMAIL_USER, // 從 .env 文件加載 Gmail 地址
    pass: process.env.GMAIL_PASS, // 從 .env 文件加載應用程式專用密碼
  },
});

// 配置郵件的內容
const mailOptions = {
  from: process.env.GMAIL_USER, // 發件人
  to: 'recipient@example.com', // 收件人（替換為實際郵箱）
  subject: '測試郵件主題', // 郵件標題
  text: '這是一封測試郵件！', // 郵件文本內容
};

// 發送郵件
transporter.sendMail(mailOptions, (err, info) => {
  if (err) {
    console.error('郵件發送失敗:', err.message || err); // 打印錯誤信息
  } else {
    console.log('郵件發送成功:', info.response); // 打印成功信息
  }
});