const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');

const CARPETA = __dirname;
const ARCHIVO_CONFIG = path.join(CARPETA, 'config.js');
let ENLACE_ACTIVO = '';

console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log('║          ✈️  ANAROBER — SISTEMA DE VUELOS 2026             ║');
console.log('║              INICIANDO TODO AUTOMÁTICAMENTE               ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

// ==============================================
// PASO 1 — LEVANTAR EL SERVIDOR
// ==============================================
console.log('📡 Encendiendo servidor...');
const servidor = spawn('node', ['server.js'], { 
  cwd: CARPETA,
  shell: true
});

servidor.stdout.on('data', (d) => process.stdout.write(d));
servidor.stderr.on('data', (e) => console.error('[SERVIDOR]', e.toString()));

// ==============================================
// PASO 2 — CONECTAR CON SERVEO
// ==============================================
setTimeout(() => {
  console.log('\n🌐 Conectando con Serveo...');
  console.log('   (puede tardar unos segundos)\n');

  const serveo = exec('ssh -R 80:localhost:8080 serveo.net', {
    cwd: CARPETA
  });

  serveo.stdout.on('data', (datos) => {
    const texto = datos.toString();
    process.stdout.write(texto);

    // Buscar el enlace
    const coincidencia = texto.match(/https:\/\/[^\s]+\.serveousercontent\.com/i) ||
                         texto.match(/https:\/\/[^\s]+\.serveo\.net/i);

    if (coincidencia && !ENLACE_ACTIVO) {
      ENLACE_ACTIVO = coincidencia[0];
      
      console.log('\n✅ ENLACE OBTENIDO: ' + ENLACE_ACTIVO);

      // Actualizar config.js automáticamente
      const contenidoConfig = `const DIRECCION_BASE = "${ENLACE_ACTIVO}";
const DIRECCION_SERVIDOR = "${ENLACE_ACTIVO}";
`;
      fs.writeFileSync(ARCHIVO_CONFIG, contenidoConfig);
      console.log('✅ config.js actualizado\n');

      // Mostrar el menú
      mostrarMenu();
    }
  });

  serveo.stderr.on('data', (err) => {
    console.error('[SERVEOS]', err.toString());
  });

}, 2500);

// ==============================================
// PASO 3 — MENÚ PRINCIPAL
// ==============================================
function mostrarMenu() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('          📋 MENÚ PRINCIPAL — ANAROBER');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('  Enlace base: ' + ENLACE_ACTIVO + '\n');
  console.log('  [1]  → ENCARGADO 1');
  console.log('  [2]  → ENCARGADO 2');
  console.log('  [3]  → ENCARGADO 3');
  console.log('  [4]  → ENCARGADO 4');
  console.log('  [5]  → ENCARGADO 5');
  console.log('  [6]  → CARGA MANUAL (ANAROBER)');
  console.log('  [7]  → CONSOLA OPERATIVA');
  console.log('  [8]  → TABLA DOLI');
  console.log('  [9]  → MENÚ PRINCIPAL');
  console.log('  [0]  → SALIR\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Escribí el número y ENTER para abrir:');
}

// Leer lo que escribís en la consola
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (entrada) => {
  const opcion = entrada.trim();
  
  if (!ENLACE_ACTIVO) {
    console.log('⏳ Esperando que el enlace esté listo...');
    return;
  }

  let pagina = '';
  switch(opcion) {
    case '1': pagina = '/ventana_encargado1.html'; break;
    case '2': pagina = '/ventana_encargado2.html'; break;
    case '3': pagina = '/ventana_encargado3.html'; break;
    case '4': pagina = '/ventana_encargado4.html'; break;
    case '5': pagina = '/ventana_encargado5.html'; break;
    case '6': pagina = '/carga_manual.html'; break;           // ✅ CORREGIDO
    case '7': pagina = '/consola_operativa.html'; break;        // ✅ CORREGIDO
    case '8': pagina = '/ventana_tabla.html'; break;            // ✅ CORREGIDO
    case '9': pagina = '/menu_anarober.html'; break;
    case '0':
      console.log('\n🛑 Cerrando todo...');
      servidor.kill();
      process.exit(0);
      break;
    default:
      console.log('❌ Opción no válida — elegí del 1 al 9 o 0 para salir');
      return;
  }

  const enlaceCompleto = ENLACE_ACTIVO + pagina;
  console.log('✅ Abriendo: ' + enlaceCompleto);
  
  // Abrir en el navegador automáticamente
  const abrir = process.platform === 'win32' ? 'start' : 'xdg-open';
  exec(`${abrir} ${enlaceCompleto}`, (err) => {
    if (err) console.log('📋 Copiá y pegá en el navegador: ' + enlaceCompleto);
  });
});

// Cerrar todo al salir
process.on('SIGINT', () => {
  console.log('\n🛑 Apagando sistema...');
  servidor.kill();
  process.exit(0);
});