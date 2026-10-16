const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

// Servir todos los archivos
app.use(express.static(__dirname));

// Página de inicio
app.get('/', (req, res) => {
  res.sendFile(path.join(res.sendFile(path.join(__dirname, 'entrada.html'));
});

app.listen(PORT, () => {
  console.log('✅ SERVIDOR FUNCIONANDO');
});
