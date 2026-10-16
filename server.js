const http = require('http');
const fs = require('fs');
const path = require('path');

// 📂 RUTAS
const RAIZ = 'C:\\DoliNueva';
const CARPETA_PANTALLAS = path.join(RAIZ, 'www');
const CARPETA_FOTOS = path.join(RAIZ, 'fotos_vuelos');
const ARCHIVO_DATOS = path.join(RAIZ, 'vuelos_fuente.json');

[RAIZ, CARPETA_PANTALLAS, CARPETA_FOTOS].forEach(c => {
  if (!fs.existsSync(c)) fs.mkdirSync(c, { recursive: true });
});

let vuelos = [];
let vuelosOcultos = new Set();

// ✅ CARGAR VUELOS
function cargarVuelos() {
  try {
    if (fs.existsSync(ARCHIVO_DATOS)) {
      const datos = fs.readFileSync(ARCHIVO_DATOS, 'utf8');
      const json = JSON.parse(datos);
      vuelos = json.vuelos || json || [];
      console.log(`✅ Cargados ${vuelos.length} vuelos`);
      vuelos.forEach(v => {
        console.log(`→ Vuelo ${v.nroVuelo}: esArribo=${v.esArribo}, ` +
          `horaSalida=${v.horaSalida||v.STD}, ` +
          `horaSubida=${v.horaSubida}, ` +
          `horaBajada=${v.horaBajada}, ` +
          `STA=${v.STA||v.horaArribo}`);
      });
    }
  } catch (e) {
    console.log('⚠️ Error cargando:', e.message);
    vuelos = [];
  }
}

// ✅ GUARDAR VUELOS
function guardarVuelos() {
  try {
    fs.writeFileSync(ARCHIVO_DATOS, JSON.stringify({ vuelos }, null, 2), 'utf8');
  } catch (e) {}
}

// ✅ LISTAR FOTOS
function listarFotosVuelo(nroVuelo) {
  if (!fs.existsSync(CARPETA_FOTOS)) return [];
  const archivos = fs.readdirSync(CARPETA_FOTOS);
  const prefijo = String(nroVuelo).replace(/[<>:"/\\|?*]/g, '_') + '_';
  return archivos.filter(n => n.startsWith(prefijo)).sort().map(n => `/foto/${encodeURIComponent(n)}`);
}

// ✅ NORMALIZAR FECHA
function normalizarFecha(fecha) {
  if (!fecha) return null;
  const partes = fecha.trim().split(/[-/]/);
  if (partes.length === 3 && partes[0].length === 2) {
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
  }
  return fecha;
}

// 💚 DEVOLVER VALOR O "—" — AHORA IGNORA "undefined"
function val(v, ...campos) {
  for (const c of campos) {
    const valor = v[c];
    if (valor !== undefined && valor !== null && valor !== '' && valor !== '—' && valor !== 'undefined') {
      return valor;
    }
  }
  return '—';
}

// ✅ PROCESAR CONSULTA
function procesarConsulta(textoConsulta) {
  const partes = textoConsulta.trim().split(/\s+/);
  let fechaInicio = null, fechaFin = null, matricula = null;
  
  if (partes.length >= 1) {
    const f1 = normalizarFecha(partes[0]);
    if (f1) fechaInicio = f1;
  }
  if (partes.length >= 2) {
    const f2 = normalizarFecha(partes[1]);
    if (f2) fechaFin = f2;
    else if (!matricula) matricula = partes[1].toUpperCase();
  }
  if (partes.length >= 3 && !matricula) {
    matricula = partes[2].toUpperCase();
  }
  
  const fechaFinReal = fechaFin || fechaInicio;
  const coincidentes = vuelos.filter(v => {
    const fechaVuelo = v.fecha;
    const coincideFecha = !fechaInicio || (fechaVuelo >= fechaInicio && fechaVuelo <= fechaFinReal);
    const coincideMatricula = !matricula || 
      String(v.matricula || '').toUpperCase() === matricula ||
      String(v.matricula || '').replace(/-/g, '').toUpperCase() === matricula;
    return coincideFecha && coincideMatricula;
  });

  if (coincidentes.length === 0) {
    return `
----------------------------------------
📭 No se encontraron vuelos
   Fecha: ${fechaInicio || 'Todas'}
   Matrícula: ${matricula || 'Todas'}
----------------------------------------
`;
  }

  let salida = `
========================================
📋 Vuelos encontrados — TOTAL: ${coincidentes.length}
   Fecha: ${fechaInicio || 'Todas'}${fechaFin ? ' al ' + fechaFin : ''}
   Matrícula: ${matricula || 'Todas'}
========================================
`;

  coincidentes.forEach(v => {
    const nro = val(v, 'nroVuelo', 'vuelo');
    const mat = val(v, 'matricula');
    const pos = val(v, 'posicion');
    const encargado = val(v, 'encargadoAsignado', 'encargado');
    const obs = val(v, 'comentario', 'IMP');
    
    // 💚 LEE HORA DE SALIDA: primero horaSalida, si no STD
    const horaSalida = val(v, 'horaSalida', 'STD');
    const horaSubida = val(v, 'horaSubida');
    const horaBajada = val(v, 'horaBajada');
    // 💚 LEE HORA DE ARRIBO: STA, horaArribo o ETA
    const horaArribo = val(v, 'STA', 'horaArribo', 'ETA');

    const esArribo = v.esArribo === true;
    const esSalida = !esArribo;

    if (esSalida) {
      salida += `
--- SALIDA ---
N° Vuelo:     ${nro}
Matrícula:   ${mat}
Posición:    ${pos}
Encargado:   ${encargado}
Hora Salida: ${horaSalida}
Hora Subida: ${horaSubida}
Hora Bajada: ${horaBajada}
Comentario:  ${obs}
`;
    }

    if (esArribo) {
      salida += `
--- ARRIBO ---
N° Vuelo:     ${nro}
Matrícula:   ${mat}
Posición:    ${pos}
Encargado:   ${encargado}
Hora Arribo: ${horaArribo}
Comentario:  ${obs}
`;
    }
  });

  salida += `========================================\n`;
  return salida;
}

cargarVuelos();

function visibles() {
  return vuelos
    .filter(v => !vuelosOcultos.has(String(v.nroVuelo || v.vuelo || '').trim()))
    .map(v => ({ ...v, fotos: listarFotosVuelo(v.nroVuelo || v.vuelo) }));
}

// 🌐 SERVIDOR HTTP
const servidor = http.createServer((req, res) => {
  if (req.url.includes('mensaje_actual.json')) {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ texto: '', remitente: '', destino: '' }));
  }
  if (req.url === '/config.js') {
    res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
    return res.end(`const DIRECCION_BASE = '';`);
  }
  if (req.url.startsWith('/subir-foto') && req.method === 'POST') {
    const partes = req.url.split('?vuelo=');
    const nroVuelo = partes[1] || 'foto';
    let cuerpo = [];
    req.on('data', t => cuerpo.push(t));
    req.on('end', () => {
      const nombre = `${nroVuelo.replace(/[<>:"/\\|?*]/g, '_')}_${Date.now()}.jpg`;
      fs.writeFileSync(path.join(CARPETA_FOTOS, nombre), Buffer.concat(cuerpo));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    });
    return;
  }
  if (req.url.startsWith('/foto/')) {
    const archivo = decodeURIComponent(req.url.replace('/foto/', ''));
    const ruta = path.join(CARPETA_FOTOS, archivo);
    if (fs.existsSync(ruta)) {
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      return fs.createReadStream(ruta).pipe(res);
    }
    res.writeHead(404);
    return res.end('No');
  }
  
  let ruta = req.url === '/' ? '/menu_anarober.html' : req.url;
  const ext = path.extname(ruta);
  const tipos = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg'
  };
  const archivo = path.join(CARPETA_PANTALLAS, ruta.replace(/^\//, ''));
  fs.readFile(archivo, (err, contenido) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('No: ' + ruta);
    }
    res.writeHead(200, { 'Content-Type': tipos[ext] || 'application/octet-stream' });
    res.end(contenido);
  });
});

// ⚡ SOCKET.IO
const io = require('socket.io')(servidor, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log('🔌 Conectado:', socket.id);
  const lista = visibles();
  socket.emit('listaVuelos', lista);
  socket.emit('vuelosActualizados', { vuelos: lista });

  socket.on('listar-fotos', (nro) => {
    socket.emit('fotos-vuelo', { vuelo: nro, fotos: listarFotosVuelo(nro) });
  });

  socket.on('consulta_fecha', (texto) => {
    console.log('🔍 Consulta:', texto);
    const respuesta = procesarConsulta(texto);
    socket.emit('respuesta_consola', respuesta);
  });

  socket.on('vuelos-nuevos-asignados', (datos) => {
    console.log('📤 Asignados:', datos.vuelos.length);
    datos.vuelos.forEach(v => {
      const existe = vuelos.find(e => {
        const nv = String(e.nroVuelo || e.vuelo || '').trim();
        const nd = String(v.nroVuelo || v.vuelo || '').trim();
        return nv === nd && e.fecha === v.fecha;
      });
      if (!existe) {
        vuelos.push(v);
      }
    });
    guardarVuelos();
    
    const lista = visibles();
    io.emit('listaVuelos', lista);
    io.emit('vuelosActualizados', { vuelos: lista });
    io.emit('vuelos-nuevos-asignados', datos);
  });

  socket.on('pedirTodosMisVuelos', (codigo) => {
    const cod = String(codigo).trim();
    const cod0 = cod.length === 1 ? '0' + cod : cod;
    const mis = visibles().filter(v => {
      const a1 = String(v.encargado || '').trim();
      const a2 = String(v.encargadoAsignado || '').trim();
      return a1 === cod || a1 === cod0 || a2 === cod || a2 === cod0;
    });
    socket.emit('vuelos-nuevos-asignados', { encargado: cod, vuelos: mis });
  });

  socket.on('cerrarVuelo', (datos) => {
    const nro = String(datos.nroVuelo || datos.vuelo).trim();
    const vuelo = vuelos.find(v => String(v.nroVuelo || v.vuelo).trim() === nro);
    if (vuelo) {
      Object.assign(vuelo, datos, { cerrado: true });
      guardarVuelos();
      const lista = visibles();
      io.emit('listaVuelos', lista);
      io.emit('vuelosActualizados', { vuelos: lista });
    }
  });

  socket.on('limpiarDespuesInforme', () => {
    console.log('🧹 Limpieza');
    vuelos.forEach(v => {
      const nro = String(v.nroVuelo || v.vuelo || '').trim();
      if (nro) vuelosOcultos.add(nro);
    });
    io.emit('listaVuelos', []);
    io.emit('vuelosActualizados', { vuelos: [] });
    io.emit('limpiezaTotalRealizada');
  });

  socket.on('mensaje-voz', (datos) => {
    io.emit('mensaje-voz-recibido', datos);
  });
});

servidor.listen(8080, () => {
  console.log('========================================');
  console.log('✅ SERVIDOR — CORREGIDO PARA MOSTRAR TODO');
  console.log('========================================');
});