const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const PLACAPI_KEY = process.env.PLACAPI_KEY;

app.post('/api/consultar', async (req, res) => {
  try {
    const { cedula } = req.body;

    if (!cedula) {
      return res.status(400).json({ error: 'Ingresa un número de cédula' });
    }

    if (!PLACAPI_KEY) {
      console.error('❌ PLACAPI_KEY no está definida');
      return res.status(500).json({ error: 'Clave de API no configurada en el servidor' });
    }

    console.log('🔍 Consultando cédula:', cedula);

    const respuesta = await fetch('https://placapi.com/api/comparendos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PLACAPI_KEY}`
      },
      body: JSON.stringify({
        tipoDocumento: 'CC',
        numeroDocumento: cedula
      })
    });

    console.log('📡 Respuesta API — Estado:', respuesta.status);

    if (!respuesta.ok) {
      const errorTexto = await respuesta.text();
      console.error('❌ Error de la API:', respuesta.status, errorTexto);
      return res.status(respuesta.status).json({ 
        error: `Servicio respondió con código ${respuesta.status}. Verifica tu clave o saldo.` 
      });
    }

    const datos = await respuesta.json();
    console.log('✅ Datos recibidos:', datos);

    const hoy = new Date();

    if (datos && Array.isArray(datos.multas)) {
      datos.multas = datos.multas.map(multa => {
        const fechaCoact = multa.fechaCoactivo ? new Date(multa.fechaCoactivo) : null;
        const antiguedadAnios = fechaCoact
          ? Number(((hoy - fechaCoact) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1))
          : 0;

        return {
          ...multa,
          antiguedadAnios,
          aptaEliminacion: antiguedadAnios > 3
        };
      });
    }

    res.json(datos);
  } catch (error) {
    console.error('❌ Error interno:', error.message);
    res.status(500).json({ error: 'Error del servidor: ' + error.message });
  }
});

app.listen(PORT, () => {
  console.log('✅ Servidor activo en el puerto', PORT);
});