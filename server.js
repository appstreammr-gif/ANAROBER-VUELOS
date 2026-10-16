const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

// Servir archivos estáticos de la carpeta principal
app.use(express.static(__dirname));

// Cuando entren al inicio, mostrar el menú
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'menu_anarober.html'));
});

app.listen(PORT, () => {
  console.log('✅ SERVIDOR CORREGIDO — ESCUCHANDO EN PUERTO:', PORT);
});
