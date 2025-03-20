const express = require("express");
const bodyParser = require("body-parser");
const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");
const fs = require("fs");

const app = express();

// 使用 body-parser 解析表單數據
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/submit", (req, res) => {
    const { chineseName, surname, givenName, gender, contact, age, idNo, dob } = req.body;

    // 生成 PDF
    const doc = new PDFDocument();
    const pdfPath = `./${chineseName}_form.pdf`;
    doc.pipe(fs.createWriteStream(pdfPath));
    doc.fontSize(20).text("疫苗接種健康問卷及同意書", { align: "center" });
    doc.text("\n個人資料");
    doc.text(`中文姓名: ${chineseName}`);
    doc.text(`英文姓名: ${surname} ${givenName}`);
    doc.text(`性別: ${gender}`);
    doc.text(`電話: ${contact}`);
    doc.text(`年齡: ${age}`);
    doc.text(`身分證號碼: ${idNo}`);
    doc.text(`出生日期: ${dob}`);
    doc.end();

    // 發送 PDF 到指定郵箱
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "your-email@gmail.com", // 替換為你的 Gmail
            pass: "your-app-password",  // 替換為應用程式密碼
        },
    });

    const mailOptions = {
        from: "your-email@gmail.com", // 替換為你的 Gmail
        to: "y2h1117@gmail.com",     // 接收郵箱
        subject: "疫苗接種表單提交結果",
        text: "以下是用戶提交的表單數據，請查收附件。",
        attachments: [
            {
                filename: `${chineseName}_form.pdf`,
                path: pdfPath,
            },
        ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("郵件發送失敗:", error);
            res.status(500).send("提交失敗，請稍後再試！");
        } else {
            console.log("郵件發送成功:", info.response);
            res.send("表單提交成功！PDF 已發送到指定郵箱。");
        }
    });
});

// 啟動伺服器
app.listen(3000, () => {
    console.log("伺服器已啟動：http://localhost:3000");
});