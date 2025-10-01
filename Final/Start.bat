@echo off
title CRM App Runner
echo Starting Frontend and Backend...

REM Start frontend in background
start "" cmd /k "npm run dev -- --host"

REM Move into backend folder and start server
cd backend
npx nodemon server.js
