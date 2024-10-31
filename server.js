const express = require('express');
const app = express();
const path = require('path');

let currentNumber = 0;
let lastNumber = 0;
let queue = [];
let callHistory = [];

app.use((req, res, next) => {
    console.log('收到请求:', req.method, req.url);
    next();
});

const publicPath = path.join(__dirname, 'public');
console.log('静态文件目录:', publicPath);
app.use(express.static(publicPath));

app.get('/getNumber', (req, res) => {
    lastNumber++;
    queue.push(lastNumber);
    
    console.log('\n=== 新号码生成 ===');
    console.log('号码:', lastNumber);
    console.log('当前服务号码:', currentNumber);
    console.log('当前队列:', queue);
    console.log('==================\n');

    res.json({ number: lastNumber });
});

app.get('/callNumber', (req, res) => {
    const windowNumber = parseInt(req.query.window) || 1;
    
    if (queue.length > 0) {
        currentNumber = queue.shift();
        
        callHistory.push({
            number: currentNumber,
            window: windowNumber,
            time: new Date()
        });

        if (callHistory.length > 10) {
            callHistory = callHistory.slice(-10);
        }
        
        console.log(`${windowNumber}号窗口叫号:`, currentNumber);
        console.log('剩余队列:', queue);
        res.json({ number: currentNumber, window: windowNumber });
    } else {
        console.log('队列为空');
        res.json({ number: currentNumber || 0, window: windowNumber });
    }
});

app.get('/currentNumber', (req, res) => {
    res.json({ 
        currentNumber: currentNumber || 0,
        queue: queue
    });
});

app.get('/queueStatus', (req, res) => {
    console.log('当前队列长度:', queue.length);
    const nextNumber = queue.length > 0 ? queue[0] : null;
    res.json({ 
        length: queue.length,
        nextNumber: nextNumber
    });
});

app.get('/callHistory', (req, res) => {
    const nextNumber = queue.length > 0 ? queue[0] : null;
    
    res.json({ 
        history: callHistory,
        nextNumber: nextNumber
    });
});

app.use((err, req, res, next) => {
    console.error('发生错误:', err);
    res.status(500).send('服务器错误');
});

app.use((req, res) => {
    console.log('404 未找到:', req.url);
    res.status(404).send('页面未找到');
});

app.listen(4000, () => {
    console.log('服务器运行在 http://localhost:4000');
    console.log('静态文件目录:', publicPath);
    const fs = require('fs');
    const indexPath = path.join(publicPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        console.log('index.html 文件存在');
    } else {
        console.log('警告: index.html 文件不存在!');
    }
}); 