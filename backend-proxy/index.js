const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz4h5JCrH0cRmXgN-ac5TxCazLIfGcbDRf1rGIUGt4fPZr7Cp_dnoviDrPVk3YXBo-f/exec';

app.post('/upload-albaran', async (req, res) => {
  try {
    const numeroAlbaran = req.query.numero || 'N/A';
    const productos = req.body;

    const url = `${GOOGLE_SCRIPT_URL}?numero=${encodeURIComponent(numeroAlbaran)}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productos),
    });

    const text = await response.text();

    res.status(response.ok ? 200 : 500).send(text);
  } catch (error) {
    console.error('Error en proxy:', error);
    res.status(500).send('Error en el proxy backend');
  }
});

app.listen(PORT, () => {
  console.log(`Proxy backend escuchando en http://localhost:${PORT}`);
});
