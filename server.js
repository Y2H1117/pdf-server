const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');
const fontkit = require('@pdf-lib/fontkit');

const app = express();
app.use(bodyParser.json());

// 配置郵件發送器
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'y2h1117@gmail.com', // 替換為你的 Gmail 地址
    pass: 'wenpufnqqhcvenos', // 替換為生成的應用程式專用密碼
  },
});

// `/submit` 路由處理提交的表單數據
app.post('/submit', async (req, res) => {
  const formData = req.body;

  try {
    // 創建 PDF 文檔
    const pdfDoc = await PDFDocument.create();

    // 加載自定義字體
    pdfDoc.registerFontkit(fontkit);
    const fontBytes = fs.readFileSync('./fonts/NotoSansTC-Regular.otf'); // 確保字體路徑正確
    const customFont = await pdfDoc.embedFont(fontBytes);

    // 添加頁面並設置字體
    const page = pdfDoc.addPage([600, 800]);
    page.setFont(customFont);
    page.setFontSize(12);

    // 繪製標題
    page.drawText('接種季節性流感疫苗健康問卷及同意書', {
      x: 50,
      y: 750,
      color: rgb(0, 0, 0),
    });

    // 繪製用戶填寫的數據
    let yPosition = 700;
    for (const [key, value] of Object.entries(formData)) {
      page.drawText(`${key}: ${value}`, {
        x: 50,
        y: yPosition,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;
    }

    // 保存 PDF 為字節流
    const pdfBytes = await pdfDoc.save();

    // 將 PDF 保存到文件
    const pdfPath = './filled-form.pdf'; // 保存到當前目錄
    fs.writeFileSync(pdfPath, pdfBytes);

    // 發送郵件
    await transporter.sendMail({
      from: '你的Gmail地址', // 替換為你的 Gmail 地址
      to: 'y2h1117@gmail.com', // 替換為收件人地址
      subject: '疫苗接種表單',
      text: '請參考附件。',
      attachments: [
        {
          filename: 'filled-form.pdf', // 附件名稱
          path: pdfPath, // 附件路徑
        },
      ],
    });

    res.status(200).send('表單提交成功，PDF 已發送到指定電郵！');
  } catch (error) {
    console.error('錯誤:', error);
    res.status(500).send('伺服器錯誤，請稍後再試。');
  }
});

// 啟動伺服器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`伺服器正在運行於 http://localhost:${PORT}`);
});