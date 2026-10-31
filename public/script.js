const btnConsultar = document.getElementById('btnConsultar');
const resultadosDiv = document.getElementById('resultados');
const tarjetaMulta = document.getElementById('tarjetaMulta');

const WHATSAPP_NUMBER = '573114018282';

document.getElementById('cedula').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') btnConsultar.click();
});

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

    alert(`✅ Abriendo página oficial del SIMIT...\nTu cédula: ${cedula}\n\nCópiala y pégala en el campo de consulta.`);
    window.open('https://www.fcm.org.co/simit/#/home-public', '_blank');

    tarjetaMulta.className = 'card-resultado verde';
    tarjetaMulta.innerHTML = `
      <div class="etiqueta-exito">✅ Página oficial abierta en pestaña nueva</div>
      <p style="margin:10px 0 15px;">Tu número de documento listo para copiar:</p>
      <div style="background:#e0e7ff; padding:15px; border-radius:10px; text-align:center; font-size:1.5rem; font-weight:bold; color:#1e40af; letter-spacing:2px; cursor:pointer;" id="copiarCedula">
        ${cedula}
        <div style="font-size:0.7rem; color:#6366f1; margin-top:5px;">Haz clic para copiar</div>
      </div>
      <p style="color:#059669; margin-top:15px;">1. Copia el número de arriba<br>2. Pégalo en la página del SIMIT<br>3. Vuelve aquí para calcular prescripción</p>
    `;

    setTimeout(() => {
      const copiarDiv = document.getElementById('copiarCedula');
      if (copiarDiv) {
        copiarDiv.addEventListener('click', () => {
          navigator.clipboard.writeText(cedula).then(() => {
            copiarDiv.style.background = '#dcfce7';
            copiarDiv.innerHTML = `${cedula}<div style="font-size:0.7rem; color:#16a34a; margin-top:5px;">✅ ¡Copiado!</div>`;
            setTimeout(() => {
              copiarDiv.style.background = '#e0e7ff';
              copiarDiv.innerHTML = `${cedula}<div style="font-size:0.7rem; color:#6366f1; margin-top:5px;">Haz clic para copiar</div>`;
            }, 2000);
          });
        });
      }
    }, 100);

    document.getElementById('cedulaMostrada').textContent = cedula;
    document.getElementById('ahorroTotal').textContent = 'Calcula abajo';

    const texto = encodeURIComponent(
      `CONSULTA MULTA CERO\n` +
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

document.getElementById('btnCalcular').addEventListener('click', async () => {
  const fechaInput = document.getElementById('fechaCoactivoCalculo').value;
  const cedula = document.getElementById('cedulaMostrada').textContent;
  
  if (!fechaInput) {
    alert('⚠️ Ingresa la fecha de cobro coactivo que aparece en tu multa');
    return;
  }

  const fechaCoact = new Date(fechaInput);
  const hoy = new Date();
  const anios = Number(((hoy - fechaCoact) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1));
  const prescribio = anios > 3;

  // Enviar datos al servidor para guardar
  await fetch('/api/guardar-calculo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cedula,
      fechaCoactivo: fechaInput,
      antiguedadAnios: anios,
      prescribio
    })
  });

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