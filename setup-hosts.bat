@echo off
:: Batch script to add SiDaya local domains to Windows hosts file & trust local SSL cert
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [SiDaya] Requesting Administrator privileges to configure local HTTPS and hosts...
    powershell -Command "Start-Process cmd -ArgumentList '/c cd /d \"%~dp0\" && setup-hosts.bat' -Verb RunAs"
    exit /b
)

set HOSTS_FILE=%WINDIR%\System32\drivers\etc\hosts
set CERT_FILE=%~dp0preview\certs\cert.pem

:: 1. Add hosts entry if missing
findstr /I "sidaya.test" "%HOSTS_FILE%" >nul 2>&1
if %errorLevel% equ 0 (
    echo [SiDaya] sidaya.test is already present in %HOSTS_FILE%
) else (
    echo. >> "%HOSTS_FILE%"
    echo # SiDaya Local HTTPS Environment >> "%HOSTS_FILE%"
    echo 127.0.0.1 sidaya.test ops.sidaya.test pay.sidaya.test api.sidaya.test berasjaya.sidaya.test >> "%HOSTS_FILE%"
    echo [SiDaya] Successfully added sidaya.test domains to %HOSTS_FILE%!
)

:: 2. Install Local SSL Certificate to Windows Trusted Root Store
if exist "%CERT_FILE%" (
    echo [SiDaya] Registering local SSL certificate to Windows Trusted Root Store...
    certutil -addstore -f "Root" "%CERT_FILE%" >nul 2>&1
    echo [SiDaya] Local SSL certificate trusted successfully!
)

:: 3. Flush DNS
echo [SiDaya] Flushing DNS cache...
ipconfig /flushdns >nul 2>&1

echo.
echo ================================================================
echo [SUCCESS] SiDaya Local HTTPS Environment is Ready!
echo ================================================================
echo   - Merchant App ^& Landing Page:  https://sidaya.test
echo   - Operator Control Plane:       https://ops.sidaya.test
echo   - PayLink Checkout:             https://pay.sidaya.test
echo   - Core API Backend:             https://api.sidaya.test
echo   - Tenant Workspace:             https://berasjaya.sidaya.test
echo ================================================================
echo.
pause
