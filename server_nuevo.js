const http = require('http');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');

const CARPETA = 'C:\\Appdoli';
const ARCHIVO_JSON = path.join(CARPETA, 'vuelos_fuente.json');

if (!fs.existsSync(CARPETA)) fs.mkdirSync(CARPETA, { recursive: true });

console.log('========================================');
console.log('✅ SERVIDOR NUEVO — LEE EL MISMO JSON');
console.log('📄 Archivo:', ARCHIVO_JSON);
console.log('========================================');

function leerVuelos() {
  try {
    if (!fs.existsSync(ARCHIVO_JSON)) {
      console.log('⚠️ Archivo JSON vacío');
      return { vuelos: [] };
    }
    const datos = JSON.parse(fs.readFileSync(ARCHIVO_JSON, 'utf8'));
    console.log(`📋 Leídos: ${datos.vuelos?.length || 0} vuelos`);
    return datos;
  } catch (err) {
    console.log('❌ Error leyendo JSON:', err.message);
    return { vuelos: [] };
  }
}

function guardarVuelos(datos) {
  fs.writeFileSync(ARCHIVO_JSON, JSON.stringify(datos, null, 2), 'utf8');
  console.log(`💾 Guardados: ${datos.vuelos?.length || 0} vuelos`);
}

const servidor = http.createServer((req, res) => {
  let ruta = req.url === '/' ? '/vuelo_activo.html' : req.url;
  const ext = path.extname(ruta);
  const tipos = {
    '.html': 'text/html;charset=utf-8',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg'
  };
  const archivo = path.join(CARPETA, ruta.replace(/^\//, ''));
  fs.readFile(archivo, (err, contenido) => {
    if (err) return res.end('❌ No encontrado: ' + ruta);
    res.writeHead(200, { 'Content-Type': tipos[ext] || 'application/octet-stream' });
    res.end(contenido);
  });
});

const io = new Server(servidor, { 
  cors: { origin: '*', methods: ['GET', 'POST'], credentials: true } 
});

io.on('connection', (socket) => {
  console.log('🔌 PANTALLA CONECTADA →', socket.id.substring(0, 8));
  console.log('👥 Conectados:', io.engine.clientsCount);

  socket.emit('cargaInicial', leerVuelos());

  socket.on('vueloAsignado', (datos) => {
    console.log('✈️ VUELO ASIGNADO →', datos);
    const todos = leerVuelos();
    todos.vuelos = todos.vuelos.filter(v => v.posicion !== datos.posicion);
    todos.vuelos.push({
      numeroVuelo: datos.vuelo,
      posicion: datos.posicion,
      matricula: datos.matricula,
      estado: 'asignado',
      horaAlerta: '',
      horaLimpieza: ''
    });
    guardarVuelos(todos);
    io.emit('vueloAsignado', datos);
  });

  socket.on('vueloCerrado', (datos) => {
    console.log('🔴 VUELO CERRADO →', datos.posicion);
    const todos = leerVuelos();
    const vuelo = todos.vuelos?.find(v => v.posicion === datos.posicion);
    if (vuelo) {
      vuelo.estado = 'cerrado';
      vuelo.horaAlerta = datos.horaCierre || new Date().toLocaleTimeString('es-AR', {hour:'2-digit', minute:'2-digit'});
      guardarVuelos(todos);
    }
    io.emit('vueloCerrado', datos);
  });

  socket.on('vueloLimpio', (datos) => {
    console.log('✅ VUELO LIMPIO →', datos.posicion);
    const todos = leerVuelos();
    const vuelo = todos.vuelos?.find(v => v.posicion === datos.posicion);
    if (vuelo) {
      vuelo.estado = 'limpio';
      vuelo.horaLimpieza = datos.horaLimpieza || new Date().toLocaleTimeString('es-AR', {hour:'2-digit', minute:'2-digit'});
      guardarVuelos(todos);
    }
    io.emit('vueloLimpio', datos);
  });

  socket.on('disconnect', () => {
    console.log('🔌 DESCONECTADO →', socket.id.substring(0, 8));
  });
});

servidor.listen(3002, () => {
  console.log('========================================');
  console.log('🚀 SERVIDOR NUEVO EN PUERTO 3002 ✅');
  console.log('📄 LEE Y GUARDA EL MISMO JSON ✅');
  console.log('========================================');
});