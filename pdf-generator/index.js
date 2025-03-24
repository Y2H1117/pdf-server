const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');

async function fillPdfTemplate(formData) {
    const templateBytes = fs.readFileSync('./template.pdf');
    const pdfDoc = await PDFDocument.load(templateBytes);
    pdfDoc.registerFontkit(fontkit);

    // 嵌入支持中文的字體
    const chineseFontBytes = fs.readFileSync('./NotoSansTC-Regular.ttf'); // 中文字體
    const chineseFont = await pdfDoc.embedFont(chineseFontBytes);

    // 嵌入支持英文字母和數字的字體
    const englishFontBytes = fs.readFileSync('./Roboto-Regular.ttf'); // 英文字體
    const englishFont = await pdfDoc.embedFont(englishFontBytes);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const fontSize = 9; // 字體大小

    // 填寫中文姓名
    firstPage.drawText(formData.chineseName, {
        x: 135,
        y: 700,
        size: fontSize,
        font: chineseFont, // 使用中文字體
    });

    // 填寫英文姓氏和名字
    firstPage.drawText(formData.surname, {
        x: 330,
        y: 700,
        size: fontSize,
        font: englishFont, // 使用英文字體
    });
    firstPage.drawText(formData.givenName, {
        x: 455,
        y: 700,
        size: fontSize,
        font: englishFont, // 使用英文字體
    });

    // 填寫性別
    firstPage.drawText(formData.gender, {
        x: 90,
        y: 675,
        size: fontSize,
        font: chineseFont, // 使用中文字體
    });

    // 填寫聯絡電話、年齡
    firstPage.drawText(formData.contact, {
        x: 250,
        y: 675,
        size: fontSize,
        font: englishFont, // 使用英文字體
    });
    firstPage.drawText(formData.age.toString(), {
        x: 380,
        y: 675,
        size: fontSize,
        font: englishFont, // 使用英文字體
    });

    // 填寫身分證號碼（稍微向上移動）
    const formattedIdNumber = formData.idNumber.replace(/\s+/g, ''); // 去掉空格
    firstPage.drawText(formattedIdNumber, {
        x: 100,
        y: 653, // 調整 y 坐標，讓身分證號碼位置稍微向上
        size: fontSize,
        font: englishFont, // 使用英文字體
    });

    // 填寫出生日期（稍微向上移動）
    firstPage.drawText(formData.dob, {
        x: 240,
        y: 653, // 調整 y 坐標，讓出生日期位置稍微向上
        size: fontSize,
        font: englishFont, // 使用英文字體
    });

    // 保存填寫後的 PDF
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync('./filled-form.pdf', pdfBytes);
    console.log('✅ PDF 填寫完成，已保存為 filled-form.pdf');
}

// 測試數據
const formData = {
    chineseName: '張三', // 中文姓名
    surname: 'Cheung', // 英文姓
    givenName: 'Sam', // 英文名
    gender: '男', // 性別
    contact: '91234567', // 聯絡電話
    age: 30, // 年齡
    idNumber: 'A123456(7)', // 身分證號碼
    dob: '1993-01-01' // 出生日期
};

// 執行函數
fillPdfTemplate(formData).catch(err => {
    console.error('❌ 填寫PDF時出錯:', err);
});