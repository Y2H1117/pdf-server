import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import { PDFDocument } from 'pdf-lib';
import nodemailer from 'nodemailer';
import fontkit from '@pdf-lib/fontkit';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();
dotenv.config(); // 加載 .env 文件中的環境變量

const app = express();
const PORT = process.env.PORT || 3000;

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

        // 嵌入支持中文的字體
        const chineseFontBytes = fs.readFileSync('./fonts/NotoSansTC-Regular.ttf'); // 中文字體
        const chineseFont = await pdfDoc.embedFont(chineseFontBytes);

        // 嵌入支持英文字母和數字的字體
        const englishFontBytes = fs.readFileSync('./fonts/Roboto-Regular.ttf'); // 英文字體
        const englishFont = await pdfDoc.embedFont(englishFontBytes);

        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const fontSize = 9; // 字體大小

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
                user: process.env.EMAIL, // 從 .env 文件讀取 Gmail 地址
                pass: process.env.EMAIL_PASSWORD, // 從 .env 文件讀取 Gmail 應用程式密碼
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
                    path: pdfPath, // 附件的路徑
                },
            ],
        };

        await transporter.sendMail(mailOptions);

        // 刪除本地 PDF 文件
        fs.unlinkSync(pdfPath);

        // 返回成功響應
        res.status(200).send({ message: '表單已成功提交並發送到郵箱！' });
    } catch (error) {
        console.error('發生錯誤：', error);
        res.status(500).send({ message: '表單提交失敗！' });
    }
});

// 啟動服務器
app.listen(PORT, () => {
    console.log(`服務器正在運行：http://localhost:${PORT}`);
});

app.get('/test-email', async (req, res) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: process.env.EMAIL, // 發送給自己
            subject: '測試郵件',
            text: '這是一封測試郵件，確認服務器郵件發送功能是否正常。',
        };

        await transporter.sendMail(mailOptions);

        res.status(200).send('測試郵件已成功發送！');
    } catch (error) {
        console.error('郵件發送失敗：', error);
        res.status(500).send('郵件發送失敗！');
    }
});

console.log('EMAIL:', process.env.EMAIL);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD);

app.post('/submit-form', async (req, res) => {
    try {
        console.log('收到的表單數據:', req.body);

        const formData = req.body;

        // 加載 PDF 模板
        const templateBytes = fs.readFileSync('./template.pdf');
        console.log('PDF 模板文件已加載');

        const pdfDoc = await PDFDocument.load(templateBytes);
        pdfDoc.registerFontkit(fontkit);

        // 嵌入字體
        const chineseFontBytes = fs.readFileSync('./fonts/NotoSansTC-Regular.ttf');
        const chineseFont = await pdfDoc.embedFont(chineseFontBytes);
        console.log('嵌入中文字體成功');

        const englishFontBytes = fs.readFileSync('./fonts/Roboto-Regular.ttf');
        const englishFont = await pdfDoc.embedFont(englishFontBytes);
        console.log('嵌入英文字體成功');

        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const fontSize = 9;

        // 填寫 PDF 表單
        firstPage.drawText(formData.chineseName || '', { x: 135, y: 700, size: fontSize, font: chineseFont });
        firstPage.drawText(formData.surname || '', { x: 330, y: 700, size: fontSize, font: englishFont });
        firstPage.drawText(formData.givenName || '', { x: 455, y: 700, size: fontSize, font: englishFont });
        firstPage.drawText(formData.gender || '', { x: 90, y: 675, size: fontSize, font: chineseFont });
        firstPage.drawText(formData.contact || '', { x: 250, y: 675, size: fontSize, font: englishFont });
        firstPage.drawText(formData.age?.toString() || '', { x: 380, y: 675, size: fontSize, font: englishFont });
        firstPage.drawText(formData.idNumber?.replace(/\s+/g, '') || '', { x: 100, y: 653, size: fontSize, font: englishFont });
        firstPage.drawText(formData.dob || '', { x: 240, y: 653, size: fontSize, font: englishFont });
        console.log('PDF 填寫完成');

        // 保存 PDF
        const pdfBytes = await pdfDoc.save();
        const pdfPath = './filled-form.pdf';
        fs.writeFileSync(pdfPath, pdfBytes);
        console.log('PDF 文件已保存:', pdfPath);

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
        console.log('郵件已成功發送');

        // 刪除本地 PDF 文件
        fs.unlinkSync(pdfPath);
        console.log('本地 PDF 文件已刪除');

        res.status(200).send({ message: '表單已成功提交並發送到郵箱！' });
    } catch (error) {
        console.error('表單提交失敗：', error);
        res.status(500).send({ message: '表單提交失敗！' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服務器正在運行：http://localhost:${PORT}`);
});