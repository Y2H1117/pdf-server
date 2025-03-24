const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const nodemailer = require('nodemailer');
const fontkit = require('@pdf-lib/fontkit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// **這行代碼設置靜態資源資料夾**
app.use(express.static('public'));

app.use(bodyParser.json());

// POST API 用於接收表單數據
app.post('/submit-form', async (req, res) => {
    // 這是你的表單處理代碼
});

app.listen(PORT, () => {
    console.log(`服務器正在運行：http://localhost:${PORT}`);
});