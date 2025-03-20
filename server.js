const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');

const app = express();
app.use(express.static('public')); // 提供靜態文件
app.use(bodyParser.json());

// 處理表單提交
app.post('/submit', async (req, res) => {
  const formData = req.body;

  try {
    // 生成 PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);

    page.drawText(`接種季節性流感/肺炎鏈球菌疫苗健康問卷及同意書`, {
      x: 50,
      y: 750,
      size: 18,
      color: rgb(0, 0, 0),
    });

    // 添加表單資料
    let yPosition = 700;
    for (const [key, value] of Object.entries(formData)) {
      page.drawText(`${key}: ${value}`, {
        x: 50,
        y: yPosition,
        size: 12,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;
    }

    const pdfBytes = await pdfDoc.save();

    // 保存 PDF 到檔案
    const pdfPath = 'filled-form.pdf';
    fs.writeFileSync(pdfPath, pdfBytes);

    // 發送 PDF 到指定電郵
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: '你的Gmail地址',
        pass: '你的應用程式專用密碼',
      },
    });

    await transporter.sendMail({
      from: '你的Gmail地址',
      to: 'y2h1117@gmail.com',
      subject: '填寫完成的疫苗接種表單',
      text: '請參考附件。',
      attachments: [
        {
          filename: 'filled-form.pdf',
          path: pdfPath,
        },
      ],
    });

    res.status(200).send('PDF 已生成並發送到電郵！');
  } catch (error) {
    console.error('處理表單時出錯:', error);
    res.status(500).send('伺服器錯誤，請稍後再試。');
  }
});

// 啟動伺服器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`伺服器正在 http://localhost:${PORT} 運行`);
});