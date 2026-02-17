import express from 'express';
import cors from 'cors';
import verifyRouter from './routes/verify.js';

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(
  cors({
    origin: ['chrome-extension://*'],
    methods: ['POST']
  })
);

app.use((req, res, next) => {
  req.setTimeout(10_000);
  next();
});

app.use('/verify', verifyRouter);

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Factum API escuchando en puerto ${port}`);
});
