const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuración desde variables de entorno
const PLACAPI_KEY = process.env.PLACAPI_KEY || '';

// Ruta de consulta
app.post('/api/consultar', async (req, res) => {
  try {
    const { cedula } = req.body;

    if (!cedula) {
      return res.status(400).json({ error: 'Ingresa un número de cédula' });
    }

    if (!PLACAPI_KEY) {
      return res.status(500).json({ error: 'Clave de API no configurada' });
    }

    // Llamada a la API del SIMIT
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

    if (!respuesta.ok) {
      return res.status(respuesta.status).json({ error: 'Error al consultar en el servicio' });
    }

    const datos = await respuesta.json();
    const hoy = new Date();

    // Calcular antigüedad y prescripción automática
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
    console.error('Error en consulta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor activo en el puerto ${PORT}`);
});