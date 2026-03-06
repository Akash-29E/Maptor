const express = require('express');
const cors = require('cors');
const routeRouter = require('./routes/route');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: ['http://localhost:3000', 'https://Akash-29E.github.io', 'https://maptor.onrender.com', 'http://maptor.ca', 'https://maptor.ca', 'http://www.maptor.ca', 'https://www.maptor.ca'] }));
app.use(express.json());

app.use('/api/route', routeRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
