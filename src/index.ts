import express, { Application } from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import imagesApisRouters from './routes/api/images';

const app: Application = express();

app.use('/public', express.static(path.join(__dirname, '../public')));

app.use([express.json(), cors(), helmet()])

app.use('/api/images', imagesApisRouters);

app.get('/', (_req, res) => {
    res.json({
        message: 'Image Processing API',
        usage: '/api/images?filename=<name>&width=<number>&height=<number>',
        example: '/api/images?filename=encenadaport&width=400&height=300',
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running at port:${PORT}`);
});