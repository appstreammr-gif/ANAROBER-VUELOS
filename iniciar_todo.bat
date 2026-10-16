@echo off
chcp 65001 >nul
title 🚀 SISTEMA DE VUELOS - DOLI AEROPARQUE
color 0A

cls
echo.
echo =====================================================
echo    🚀  SISTEMA DE VUELOS - INICIANDO...
echo =====================================================
echo.
echo 📂 Ubicacion: Unidad Z: (PC Servidor)
echo 🚀 Puerto Servidor: 8080
echo 🌐 Ngrok: Desbloqueado y listo
echo.
echo =====================================================
echo.

:: Ir a la unidad Z
cd /d Z:\

:: Verificar que ngrok.exe exista y esté desbloqueado
if not exist "Z:\ngrok.exe" (
    echo ❌ ERROR: No se encontro ngrok.exe en Z:\
    echo Por favor copia ngrok.exe a la unidad Z: y desbloquealo
    pause
    exit /b 1
)

:: Iniciar el SERVIDOR en ventana nueva 🚀
echo 🚀 Iniciando Servidor...
start "🟢 SERVIDOR - NO CERRAR" cmd /k "node server.js"

:: Esperar 3 segundos ⏳
echo ⏳ Esperando que el servidor arranque...
timeout /t 3 /nobreak >nul

:: Iniciar NGROK con ruta completa y desbloqueado 🌐
echo 🌐 Iniciando Ngrok...
start "🌐 NGROK - NO CERRAR" cmd /k ""Z:\ngrok.exe" http 8080"

echo.
echo ✅ ¡TODO INICIADO CORRECTAMENTE!
echo.
echo 📋 Instrucciones:
echo    🚀 La ventana del servidor ya esta corriendo
echo    🌐 En la ventana de Ngrok busca el enlace que empieza por:
echo       https://xxxx-xx-xx.ngrok.io
echo    🖥️ Copia ese enlace y abrilo en el navegador
echo.
echo ⚠️ NO cerrar las ventanas negras mientras trabajes
echo.
pause
exit