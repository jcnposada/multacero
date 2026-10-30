const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Ruta de verificación — redirige al SIMIT oficial
app.post('/api/consultar', (req, res) => {
  const { cedula } = req.body;

  if (!cedula || cedula.length < 5) {
    return res.status(400).json({ error: 'Por favor ingresa un número de documento válido' });
  }

  res.json({
    mensaje: 'Serás redirigido a la página oficial del SIMIT',
    cedula: cedula,
    urlOficial: 'https://www.simit.gov.co/consulta-ciudadano'
  });
});

app.listen(PORT, () => {
  console.log('✅ MultaCero — Servidor activo en el puerto', PORT);
});