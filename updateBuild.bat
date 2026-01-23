@echo off
SETLOCAL

echo ===============================
echo GIT local degisiklikler stashleniyor...
echo ===============================
git stash push -m "auto-stash-before-pull"

IF %ERRORLEVEL% NEQ 0 (
  echo Git stash basarisiz!
  pause
  exit /b 1
)

echo ===============================
echo GIT pull yapiliyor...
echo ===============================
git pull

IF %ERRORLEVEL% NEQ 0 (
  echo Git pull basarisiz!
  pause
  exit /b 1
)

echo ===============================
echo npm install calisiyor...
echo ===============================
call npm install



echo ===============================
echo npm run install:all calisiyor...
echo ===============================
call npm run install:all

IF %ERRORLEVEL% NEQ 0 (
  echo install:all basarisiz!
  pause
  exit /b 1
)

echo ===============================
echo npm run build calisiyor...
echo ===============================
call npm run build

IF %ERRORLEVEL% NEQ 0 (
  echo build basarisiz!
  pause
  exit /b 1
)

echo ===============================
echo Her sey basarili 🎉
echo ===============================

pause
ENDLOCAL
