@echo off
echo ========================================================
echo STARTING HOLOMEDX AI - BACKEND API SERVER
echo ========================================================

cd /d "c:\Users\HOUSE OF COMPUTERS\OneDrive\Desktop\N.K.Orchid-1\backend"

echo Installing Backend Dependencies...
python -m pip install fastapi==0.109.2 uvicorn[standard]==0.27.1 motor==3.3.2 pydantic-settings==2.1.0 python-multipart==0.0.9 requests==2.31.0 python-dotenv
python -m pip install "pymongo<4.6,>=4.5" --force-reinstall

echo Starting Backend Server...
start http://localhost:8000/api/v1/health
python -m uvicorn main:app --host 127.0.0.1 --port 8000
