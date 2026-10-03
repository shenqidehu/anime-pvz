@echo off
chcp 65001 >nul
rem 一键启动：二次元植物大战僵尸
cd /d "%~dp0"
echo 正在打开《二次元植物大战僵尸》...
start "" "index.html"
exit
