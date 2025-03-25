import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import { PDFDocument } from 'pdf-lib';
import nodemailer from 'nodemailer';
import fontkit from '@pdf-lib/fontkit';
import dotenv from 'dotenv';
import path from 'path';

// 加載環境變量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 初始化提交次數
let submissionCount = 0;

// 解析 JSON 請求
app.use(bodyParser.json());

// 靜態文件服務
app.use(express.static('public'));

// 處理表單提交 API
app.post('/submit-form', (req, res) => {
    const formData = req.body;

    // 立即返回成功響應
    res.status(200).send({ message: '表單提交成功！' });

    // 在後台處理 PDF 生成和郵件發送
    (async () => {
        try {
            const templateBytes = fs.readFileSync('./template.pdf');
            const pdfDoc = await PDFDocument.load(templateBytes);
            pdfDoc.registerFontkit(fontkit);

            const chineseFontBytes = fs.readFileSync('./fonts/NotoSansTC-Regular.ttf');
            const chineseFont = await pdfDoc.embedFont(chineseFontBytes);

            const englishFontBytes = fs.readFileSync('./fonts/Roboto-Regular.ttf');
            const englishFont = await pdfDoc.embedFont(englishFontBytes);

            const pages = pdfDoc.getPages();
            const firstPage = pages[0];
            const fontSize = 12;

            // 填寫 PDF 表單
            firstPage.drawText(formData.chineseName, { x: 135, y: 700, size: fontSize, font: chineseFont });
            firstPage.drawText(formData.surname, { x: 330, y: 700, size: fontSize, font: englishFont });
            firstPage.drawText(formData.givenName, { x: 455, y: 700, size: fontSize, font: englishFont });
            firstPage.drawText(formData.gender, { x: 90, y: 675, size: fontSize, font: chineseFont });
            firstPage.drawText(formData.contact, { x: 250, y: 675, size: fontSize, font: englishFont });
            firstPage.drawText(formData.age.toString(), { x: 380, y: 675, size: fontSize, font: englishFont });
            firstPage.drawText(formData.idNumber.replace(/\s+/g, ''), { x: 100, y: 653, size: fontSize, font: englishFont });
            firstPage.drawText(formData.dob, { x: 240, y: 653, size: fontSize, font: englishFont });

            // 保存 PDF
            const pdfBytes = await pdfDoc.save();
            const pdfPath = path.join(process.cwd(), 'filled-form.pdf');
            fs.writeFileSync(pdfPath, pdfBytes);

            // 發送郵件
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });

            const mailOptions = {
                from: process.env.EMAIL,
                to: process.env.EMAIL,
                subject: '表單提交 PDF',
                text: '以下為提交的表單 PDF。',
                attachments: [
                    {
                        filename: 'filled-form.pdf',
                        path: pdfPath,
                    },
                ],
            };

            await transporter.sendMail(mailOptions);

            // 刪除 PDF 文件
            fs.unlinkSync(pdfPath);

            console.log('表單處理完成並郵件發送成功！');
        } catch (error) {
            console.error('表單處理或郵件發送失敗：', error);
        }
    })();

    // 增加提交次數
    submissionCount += 1;
});

// API：返回提交次數
app.get('/submission-count', (req, res) => {
    res.status(200).json({ count: submissionCount });
});

// 啟動服務器
app.listen(PORT, () => {
    console.log(`服務器已啟動：http://localhost:${PORT}`);
});