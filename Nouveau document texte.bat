@echo off
cd /d "%~dp0"

echo Starting XAMPP Apache and MySQL...
cd /d "C:\xampp"
start "" xampp_start.exe

cd /d "%~dp0"
echo Starting frontend...
start cmd /k "cd client-planifio && npm start"

echo Starting backend...
start cmd /k "cd server-planifio && dotnet watch"

echo Opening VS Code...
cd /d "%~dp0"
code .