const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/api/consultar', (req, res) => {
  const { cedula } = req.body;
  if (!cedula || cedula.length < 5) {
    return res.status(400).json({ error: 'Cédula inválida' });
  }
  const fecha = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });
  fs.appendFileSync(path.join(__dirname, 'consultas.txt'), `[${fecha}] Cédula: ${cedula} - Consultó\n`, 'utf8');
  res.json({ ok: true });
});

app.post('/api/guardar-calculo', (req, res) => {
  const { cedula, fechaCoactivo, antiguedadAnios, prescribio } = req.body;
  if (!cedula) return res.status(400).json({ error: 'Faltan datos' });
  const fecha = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });
  const linea = `[${fecha}] Cédula: ${cedula} | Fecha: ${fechaCoactivo} | Antigüedad: ${antiguedadAnios}a | Prescribió: ${prescribio ? 'SÍ ✅' : 'NO ⚠️'}\n`;
  fs.appendFileSync(path.join(__dirname, 'consultas.txt'), linea, 'utf8');
  res.json({ ok: true });
});

app.get('/admin/descargar-consultas', (req, res) => {
  const archivo = path.join(__dirname, 'consultas.txt');
  if (!fs.existsSync(archivo)) return res.send('Sin consultas aún');
  res.download(archivo, 'consultas.txt');
});

app.listen(PORT, () => console.log('✅ MultaCero activo en puerto', PORT));