import express, {Request, Response} from 'express';
import cors from 'cors';
import mainRouter from './Routes/index';
const app = express();

app.use(cors());
app.use(express.json())

app.use('/api/v1',mainRouter);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});