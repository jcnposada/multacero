const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/api/consultar', (req, res) => {
  const { cedula } = req.body;

  if (!cedula || cedula.length < 5) {
    return res.status(400).json({ error: 'Por favor ingresa un número de documento válido' });
  }

  res.json({
    mensaje: 'Redirigido a SIMIT',
    cedula: cedula
  });
});

app.listen(PORT, () => {
  console.log('✅ MultaCero activo en puerto', PORT);
});