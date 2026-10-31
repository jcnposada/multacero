const WHATSAPP_NUMBER = '573114018282';

// Elementos
const cedulaInput = document.getElementById('cedula');
const btnTengoFecha = document.getElementById('btnTengoFecha');
const btnNoTengoFecha = document.getElementById('btnNoTengoFecha');
const resultadosDiv = document.getElementById('resultados');
const bloqueSinFecha = document.getElementById('bloqueSinFecha');
const bloqueCalculo = document.getElementById('bloqueCalculo');
const bloqueAccion = document.getElementById('bloqueAccion');

// Enter para buscar
cedulaInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') cedulaInput.blur();
});

// Validar cédula primero
function hayCedula() {
  const cedula = cedulaInput.value.trim();
  if (!cedula) {
    alert('⚠️ Por favor ingresa un número de cédula');
    return null;
  }
  return cedula;
}

// Opción 1: SÍ tengo la fecha
btnTengoFecha.addEventListener('click', async () => {
  const cedula = hayCedula();
  if (!cedula) return;

  await guardarConsulta(cedula);
  mostrarSeccion(cedula, 'calculo');
});

// Opción 2: NO tengo la fecha
btnNoTengoFecha.addEventListener('click', async () => {
  const cedula = hayCedula();
  if (!cedula) return;

  await guardarConsulta(cedula);
  mostrarSeccion(cedula, 'sinfecha');
});

// Mostrar sección según caso
function mostrarSeccion(cedula, tipo) {
  resultadosDiv.classList.remove('hidden');
  document.getElementById('cedulaMostrada').textContent = cedula;
  document.getElementById('cedulaCopiar').textContent = cedula;
  
  bloqueSinFecha.classList.add('hidden');
  bloqueCalculo.classList.add('hidden');
  bloqueAccion.classList.add('hidden');

  if (tipo === 'sinfecha') {
    bloqueSinFecha.classList.remove('hidden');
    activarCopiar(cedula);
  } else {
    bloqueCalculo.classList.remove('hidden');
  }
}

// Copiar cédula al portapapeles
function activarCopiar(cedula) {
  const copiarDiv = document.getElementById('copiarCedula');
  copiarDiv.onclick = () => {
    navigator.clipboard.writeText(cedula).then(() => {
      copiarDiv.style.background = '#a5b4fc';
      copiarDiv.innerHTML = `${cedula}<div style="font-size:0.7rem; color:#3730a3; margin-top:5px;">✅ ¡Copiado!</div>`;
      setTimeout(() => {
        copiarDiv.style.background = '#c7d2fe';
        copiarDiv.innerHTML = `${cedula}<div style="font-size:0.7rem; color:#4f46e5; margin-top:5px;">Haz clic para copiar</div>`;
      }, 2000);
    });
  };
}

// Abrir SIMIT
document.getElementById('btnAbrirSimit').addEventListener('click', () => {
  window.open('https://www.fcm.org.co/simit/#/home-public', '_blank');
});

// Ya conseguí la fecha
document.getElementById('btnYaTengoFecha').addEventListener('click', () => {
  bloqueSinFecha.classList.add('hidden');
  bloqueCalculo.classList.remove('hidden');
});

// Calcular prescripción
document.getElementById('btnCalcular').addEventListener('click', async () => {
  const fechaInput = document.getElementById('fechaCoactivoCalculo').value;
  const cedula = document.getElementById('cedulaMostrada').textContent;
  
  if (!fechaInput) {
    alert('⚠️ Ingresa la fecha de cobro coactivo');
    return;
  }

  const fechaCoact = new Date(fechaInput);
  const hoy = new Date();
  const anios = Number(((hoy - fechaCoact) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1));
  const prescribio = anios > 3;

  // Guardar cálculo
  await fetch('/api/guardar-calculo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cedula, fechaCoactivo: fechaInput, antiguedadAnios: anios, prescribio })
  });

  // Mostrar resultado
  const div = document.getElementById('resultadoCalculo');
  div.style.display = 'block';
  
  if (prescribio) {
    div.innerHTML = `
      <div style="background:#dcfce7; padding:20px; border-radius:10px; color:#065f46; font-weight:bold; text-align:center;">
        ✅ ¡SÍ PRESCRIBIÓ!<br><br>
        Antigüedad: ${anios} años (más de 3 años)<br>
        Tienes derecho a solicitar la eliminación legal
      </div>
    `;
    document.getElementById('ahorroTotal').textContent = 'Aplica ✅';
    bloqueAccion.classList.remove('hidden');
  } else {
    div.innerHTML = `
      <div style="background:#fef3c7; padding:20px; border-radius:10px; color:#92400e; font-weight:bold; text-align:center;">
        ⚠️ Aún NO prescribió<br><br>
        Antigüedad: ${anios} años de 3 necesarios<br>
        Te recomendamos esperar a completar el plazo
      </div>
    `;
    document.getElementById('ahorroTotal').textContent = 'Aún no aplica';
    bloqueAccion.classList.add('hidden');
  }

  // Enlace de WhatsApp
  const texto = encodeURIComponent(
    `📋 REPORTE PRESCRIPCIÓN\n` +
    `Cédula: ${cedula}\n` +
    `Fecha Coactivo: ${fechaInput}\n` +
    `Antigüedad: ${anios} años\n` +
    `Prescribió: ${prescribio ? 'SÍ ✅' : 'NO ⚠️'}`
  );
  document.getElementById('btnWhatsApp').href = `https://wa.me/${WHATSAPP_NUMBER}?text=${texto}`;
});

// Guardar consulta inicial
async function guardarConsulta(cedula) {
  try {
    await fetch('/api/consultar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cedula })
    });
  } catch (e) {
    console.log('Error guardando');
  }
}