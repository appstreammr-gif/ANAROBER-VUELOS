const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

// Servir todos los archivos de la carpeta
app.use(express.static(__dirname));

// Página de inicio
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'entrada.html'));
});

// Pantallas de cada encargado
app.get('/ventana_encargado1.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'ventana_encargado1.html'));
});

app.get('/ventana_encargado2.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'ventana_encargado2.html'));
});

app.get('/ventana_encargado3.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'ventana_encargado3.html'));
});

app.get('/ventana_encargado4.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'ventana_encargado4.html'));
});

app.get('/ventana_encargado5.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'ventana_encargado5.html'));
});

// Otras pantallas
app.get('/consola_operativa.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'consola_operativa.html'));
});

app.get('/carga_manual.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'carga_manual.html'));
});

app.get('/ventana_tabla.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'ventana_tabla.html'));
});

app.get('/menu_anarober.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'menu_anarober.html'));
});

app.listen(PORT, () => {
  console.log(`✅ SERVIDOR FUNCIONANDO en el puerto ${PORT}`);
});
