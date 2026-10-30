const btnConsultar = document.getElementById('btnConsultar');
const resultadosDiv = document.getElementById('resultados');
const tarjetaMulta = document.getElementById('tarjetaMulta');

// Tu número de WhatsApp
const WHATSAPP_NUMBER = '573114018282'; // Reemplaza por el tuyo

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
      throw new Error(datos.error || 'Error en la consulta');
    }

    if (!datos.multas || datos.multas.length === 0) {
      alert('✅ No se encontraron multas registradas para este documento.');
      return;
    }

    // Buscar multa apta o usar la primera
    let multaSeleccionada = datos.multas.find(m => m.aptaEliminacion) || datos.multas[0];

    // Actualizar estilo según prescripción
    if (multaSeleccionada.aptaEliminacion) {
      tarjetaMulta.className = 'card-resultado verde';
      tarjetaMulta.querySelector('.etiqueta-exito').textContent = '✅ APTA PARA ELIMINACIÓN (ES MAYOR A 3 AÑOS)';
      tarjetaMulta.querySelector('.etiqueta-exito').style.display = 'block';
    } else {
      tarjetaMulta.className = 'card-resultado rojo';
      tarjetaMulta.querySelector('.etiqueta-exito').textContent = '⚠️ NO APTA — Menos de 3 años';
      tarjetaMulta.querySelector('.etiqueta-exito').classList.remove('etiqueta-exito');
      tarjetaMulta.querySelector('.etiqueta-exito').classList.add('etiqueta-no');
    }

    // Llenar datos
    document.getElementById('cedulaMostrada').textContent = cedula;
    document.getElementById('numComparendo').textContent = multaSeleccionada.numeroComparendo || '—';
    document.getElementById('lugar').textContent = multaSeleccionada.municipio || 'Caucasia Vía Nacional';
    document.getElementById('placa').textContent = multaSeleccionada.placa || '—';
    document.getElementById('infraccion').textContent = multaSeleccionada.codigoInfraccion || '—';
    document.getElementById('fechaCoactivo').textContent = multaSeleccionada.fechaCoactivo || '—';
    document.getElementById('antiguedad').textContent = multaSeleccionada.antiguedadAnios || '0';
    
    const capital = multaSeleccionada.valor || 0;
    const intereses = multaSeleccionada.intereses || 0;
    const total = multaSeleccionada.valorTotal || (capital + intereses);

    document.getElementById('capital').textContent = Number(capital).toLocaleString('es-CO');
    document.getElementById('intereses').textContent = Number(intereses).toLocaleString('es-CO');
    document.getElementById('totalMulta').textContent = Number(total).toLocaleString('es-CO');
    document.getElementById('ahorroTotal').textContent = Number(total).toLocaleString('es-CO');

    // Enlace WhatsApp
    const texto = encodeURIComponent(
      `📋 REPORTE MULTA CERO\n` +
      `Cédula: ${cedula}\n` +
      `Comparendo: ${multaSeleccionada.numeroComparendo || 'N/D'}\n` +
      `Placa: ${multaSeleccionada.placa || 'N/D'}\n` +
      `Infracción: ${multaSeleccionada.codigoInfraccion || 'N/D'}\n` +
      `Fecha Coactivo: ${multaSeleccionada.fechaCoactivo || 'N/D'}\n` +
      `Antigüedad: ${multaSeleccionada.antiguedadAnios} años\n` +
      `Valor Total: $${Number(total).toLocaleString('es-CO')} COP\n` +
      `✅ Apta para prescripción: ${multaSeleccionada.aptaEliminacion ? 'SÍ' : 'NO'}`
    );
    document.getElementById('btnWhatsApp').href = `https://wa.me/${WHATSAPP_NUMBER}?text=${texto}`;

    resultadosDiv.classList.remove('hidden');

  } catch (error) {
    alert(`❌ ${error.message}`);
    console.error(error);
  } finally {
    btnConsultar.textContent = '🔍 Consultar Estado SIMIT';
    btnConsultar.disabled = false;
  }
});