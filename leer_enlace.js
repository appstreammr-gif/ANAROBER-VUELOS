const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');

const ARCHIVO_ENLACE = path.join(__dirname, 'enlace_actual.txt');
const ARCHIVO_CONFIG = path.join(__dirname, 'config.js');

console.log('🚀 ANAROBER — Iniciando todo automáticamente...\n');

// 1° Iniciar el servidor
const servidor = spawn('node', ['server.js'], { cwd: __dirname });

servidor.stdout.on('data', (datos) => {
  console.log('[SERVIDOR] ' + datos);
});
servidor.stderr.on('data', (err) => {
  console.error('[ERROR SERVIDOR] ' + err);
});

// Esperar un momento y levantar Serveo
setTimeout(() => {
  console.log('\n🌐 Conectando con Serveo...');
  
  const serveo = exec('ssh -R 80:localhost:8080 serveo.net', {
    cwd: __dirname
  });

  serveo.stdout.on('data', (datos) => {
    const texto = datos.toString();
    console.log(texto);
    
    // Buscar el enlace que nos da
    const coincidencia = texto.match(/https:\/\/[a-zA-Z0-9\-]+\.serveousercontent\.com/i) ||
                         texto.match(/https:\/\/[a-zA-Z0-9\-]+\.serveo\.net/i);
    
    if (coincidencia) {
      const enlace = coincidencia[0];
      console.log('\n✅ ENLACE OBTENIDO: ' + enlace);
      
      // Guardar en archivo de texto
      fs.writeFileSync(ARCHIVO_ENLACE, enlace + '\n' + new Date().toLocaleString('es-AR'));
      
      // Actualizar config.js automáticamente
      const nuevoConfig = `const DIRECCION_BASE = "${enlace}";
const DIRECCION_SERVIDOR = "${enlace}";
`;
      fs.writeFileSync(ARCHIVO_CONFIG, nuevoConfig);
      
      console.log('✅ config.js actualizado automáticamente');
      console.log('✅ Listo para usar desde cualquier lado 💚\n');
      console.log('📋 ENLACE PARA ENTRAR:');
      console.log(enlace + '/ventana_encargado1.html');
    }
  });

  serveo.stderr.on('data', (datos) => {
    console.error('[SERVEOS] ' + datos);
  });

}, 2000);

// Cerrar todo al terminar
process.on('SIGINT', () => {
  console.log('\n🛑 Apagando todo...');
  servidor.kill();
  process.exit();
});