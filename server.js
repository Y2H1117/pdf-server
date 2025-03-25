import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 3000;

// 初始化提交次數
let submissionCount = 0;

// 靜態資源
app.use(express.static('public'));

// 表單提交處理路由
app.post('/submit-form', (req, res) => {
    submissionCount += 1; // 每次提交表單，增加提交次數
    res.status(200).send({ message: '表單提交成功！' });
});

// 提交次數 API
app.get('/submission-count', (req, res) => {
    res.status(200).json({ count: submissionCount }); // 返回提交次數
});

// 啟動服務器
app.listen(PORT, () => {
    console.log(`服務器已啟動：http://localhost:${PORT}`);
});