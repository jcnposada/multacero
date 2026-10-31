const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Ruta principal de consulta
app.post('/api/consultar', (req, res) => {
  const { cedula } = req.body;

  if (!cedula || cedula.length < 5) {
    return res.status(400).json({ error: 'Por favor ingresa un número de documento válido' });
  }

  // Guardar registro de consulta
  const fechaConsulta = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });
  const registro = `[${fechaConsulta}] Cédula: ${cedula}\n`;
  const rutaArchivo = path.join(__dirname, 'consultas.txt');
  fs.appendFileSync(rutaArchivo, registro, 'utf8');

  res.json({
    mensaje: 'Redirigido a SIMIT',
    cedula: cedula
  });
});

// Ruta para guardar el cálculo de prescripción
app.post('/api/guardar-calculo', (req, res) => {
  const { cedula, fechaCoactivo, antiguedadAnios, prescribio } = req.body;
  
  if (!cedula) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  const fechaConsulta = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });
  const registro = `[${fechaConsulta}] Cédula: ${cedula} | Fecha Coactivo: ${fechaCoactivo || 'No ingresada'} | Antigüedad: ${antiguedadAnios || 0} años | Prescribió: ${prescribio ? 'SÍ ✅' : 'NO ⚠️'}\n`;
  
  const rutaArchivo = path.join(__dirname, 'consultas.txt');
  fs.appendFileSync(rutaArchivo, registro, 'utf8');
  
  res.json({ ok: true });
});

// Ruta para descargar las consultas (solo para ti)
app.get('/admin/descargar-consultas', (req, res) => {
  const rutaArchivo = path.join(__dirname, 'consultas.txt');
  if (!fs.existsSync(rutaArchivo)) {
    return res.send('No hay consultas registradas aún');
  }
  res.download(rutaArchivo, 'consultas.txt');
});

app.listen(PORT, () => {
  console.log('✅ MultaCero activo en el puerto', PORT);
});