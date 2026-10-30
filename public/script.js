const btnConsultar = document.getElementById('btnConsultar');
const resultadosDiv = document.getElementById('resultados');
const tarjetaMulta = document.getElementById('tarjetaMulta');

// ==== CONFIGURA TU NÚMERO DE WHATSAPP AQUÍ ====
const WHATSAPP_NUMBER = '573114018282'; // Reemplaza por el tuyo
// ==============================================

// Permitir buscar presionando Enter
document.getElementById('cedula').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') btnConsultar.click();
});

// Consultar y redirigir al SIMIT
btnConsultar.addEventListener('click', async () => {
  const cedula = document.getElementById('cedula').value.trim();
  
  if (!cedula) {
    alert('⚠️ Por favor ingresa un número de cédula');
    return;
  }

  resultadosDiv.classList.add('hidden');
  btnConsultar.textContent = '🔄 Consultando...';
  btnConsultar.disabled = true;

  try {
    const respuesta = await fetch('/api/consultar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cedula })
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(datos.error);
    }

    // Abrir página oficial del SIMIT en pestaña nueva
    alert(`✅ Te redirigimos a la página oficial del SIMIT\nDocumento: ${cedula}`);
    window.open('https://www.simit.gov.co/consulta-ciudadano', '_blank');

    // Mostrar sección informativa
    tarjetaMulta.className = 'card-resultado verde';
    tarjetaMulta.innerHTML = `
      <div class="etiqueta-exito">✅ Ingresa directamente al SIMIT</div>
      <p style="margin:10px 0;">En la página oficial ingresa tu documento:</p>
      <p style="font-weight:bold; font-size:1.2rem;">${cedula}</p>
      <p style="color:#059669; margin-top:15px;">Una vez verifiques tus multas, vuelve aquí para evaluar si prescribieron.</p>
    `;

    // Actualizar datos existentes
    document.getElementById('cedulaMostrada').textContent = cedula;
    document.getElementById('ahorroTotal').textContent = 'Calcula abajo';

    // Enlace de WhatsApp
    const texto = encodeURIComponent(
      `📋 CONSULTA MULTA CERO\n` +
      `Cédula: ${cedula}\n` +
      `Consulta realizada en página oficial del SIMIT`
    );
    document.getElementById('btnWhatsApp').href = `https://wa.me/${WHATSAPP_NUMBER}?text=${texto}`;

    resultadosDiv.classList.remove('hidden');

  } catch (error) {
    alert(`❌ ${error.message}`);
  } finally {
    btnConsultar.textContent = '🔍 Consultar Estado SIMIT';
    btnConsultar.disabled = false;
  }
});

// Calculadora de Prescripción
document.getElementById('btnCalcular').addEventListener('click', () => {
  const fechaInput = document.getElementById('fechaCoactivoCalculo').value;
  
  if (!fechaInput) {
    alert('⚠️ Ingresa la fecha de cobro coactivo que aparece en tu multa');
    return;
  }

  const fechaCoact = new Date(fechaInput);
  const hoy = new Date();
  const anios = Number(((hoy - fechaCoact) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1));
  const prescribio = anios > 3;

  const div = document.getElementById('resultadoCalculo');
  div.style.display = 'block';
  
  if (prescribio) {
    div.innerHTML = `
      <div style="background:#dcfce7; padding:15px; border-radius:10px; color:#065f46; font-weight:bold;">
        ✅ ¡SÍ PRESCRIBIÓ!<br>
        Antigüedad: ${anios} años (más de 3 años)<br>
        Tienes derecho a solicitar eliminación por el Art. 159 CNT
      </div>
    `;
    document.getElementById('ahorroTotal').textContent = 'Aplica eliminación';
  } else {
    div.innerHTML = `
      <div style="background:#fef3c7; padding:15px; border-radius:10px; color:#92400e; font-weight:bold;">
        ⚠️ Aún NO prescribió<br>
        Antigüedad: ${anios} años de 3 necesarios
      </div>
    `;
    document.getElementById('ahorroTotal').textContent = 'No aplica aún';
  }
});