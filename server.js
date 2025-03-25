import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import { PDFDocument } from 'pdf-lib';
import nodemailer from 'nodemailer';
import fontkit from '@pdf-lib/fontkit';
import path from 'path';
import dotenv from 'dotenv';

// 加載環境變量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 初始化提交次數
let submissionCount = 0;

// 設置靜態資源目錄
app.use(express.static('public'));

// 解析 JSON 數據
app.use(bodyParser.json());

// POST API：接收表單數據，生成 PDF，並發送到郵箱
app.post('/submit-form', async (req, res) => {
    try {
        const formData = req.body;

        // 加載模板 PDF
        const templateBytes = fs.readFileSync('./template.pdf');
        const pdfDoc = await PDFDocument.load(templateBytes);
        pdfDoc.registerFontkit(fontkit);

        // 嵌入支持中文字體
        const chineseFontBytes = fs.readFileSync('./fonts/NotoSansTC-Regular.ttf');
        const chineseFont = await pdfDoc.embedFont(chineseFontBytes);

        // 嵌入支持英文字體
        const englishFontBytes = fs.readFileSync('./fonts/Roboto-Regular.ttf');
        const englishFont = await pdfDoc.embedFont(englishFontBytes);

        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const fontSize = 9;

        // 填寫 PDF 表單
        firstPage.drawText(formData.chineseName, { x: 135, y: 700, size: fontSize, font: chineseFont });
        firstPage.drawText(formData.surname, { x: 330, y: 700, size: fontSize, font: englishFont });
        firstPage.drawText(formData.givenName, { x: 455, y: 700, size: fontSize, font: englishFont });
        firstPage.drawText(formData.gender, { x: 90, y: 675, size: fontSize, font: chineseFont });
        firstPage.drawText(formData.contact, { x: 250, y: 675, size: fontSize, font: englishFont });
        firstPage.drawText(formData.age.toString(), { x: 380, y: 675, size: fontSize, font: englishFont });
        firstPage.drawText(formData.idNumber.replace(/\s+/g, ''), { x: 100, y: 653, size: fontSize, font: englishFont });
        firstPage.drawText(formData.dob, { x: 240, y: 653, size: fontSize, font: englishFont });

        // 保存生成的 PDF
        const pdfBytes = await pdfDoc.save();
        const pdfPath = path.join(process.cwd(), 'filled-form.pdf');
        fs.writeFileSync(pdfPath, pdfBytes);

        // 使用 Nodemailer 發送郵件
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
            subject: '已填寫的表單',
            text: '以下是用戶填寫的表單：',
            attachments: [
                {
                    filename: 'filled-form.pdf',
                    path: pdfPath,
                },
            ],
        };

        await transporter.sendMail(mailOptions);

        // 刪除本地 PDF 文件
        fs.unlinkSync(pdfPath);

        // 增加提交次數
        submissionCount += 1;

        // 返回成功響應
        res.status(200).send({ message: '表單已成功提交並發送到郵箱！' });
    } catch (error) {
        console.error('發生錯誤：', error);
        res.status(500).send({ message: '表單提交失敗！' });
    }
});

// 新增 API：返回提交次數
app.get('/submission-count', (req, res) => {
    res.status(200).send({ count: submissionCount });
});

// 啟動服務器
app.listen(PORT, () => {
    console.log(`服務器已啟動：http://localhost:${PORT}`);
});

app.get('/submission-count', (req, res) => {
    res.status(200).json({ count: submissionCount }); // 返回 JSON 格式的提交次數
});

let submissionCount = 0; // 初始化提交次數

submissionCount += 1;