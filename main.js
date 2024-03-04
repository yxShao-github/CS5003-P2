// main.js
// 导入必要的模块
import express from 'express';
import gameRoutes from './src/routes/gameRoutes.js';

// 创建Express应用
const app = express();

// 设置端口
const PORT = process.env.PORT || 3000;

// 使用Express内置的中间件来解析JSON格式的请求体
app.use(express.json());

// 设置静态文件目录，假设你的前端静态文件放在项目根目录的public文件夹
app.use(express.static('public'));

// 设置跨源资源共享(CORS)的中间件，允许所有来源
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// 使用游戏相关的路由
app.use('/api', gameRoutes);

// 设置根路由
app.get('/', (req, res) => {
    res.send('Welcome to the Prospector Game API');
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

