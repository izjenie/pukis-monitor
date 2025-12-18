#!/bin/bash

cleanup() {
    echo "Shutting down services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

echo "Starting FastAPI backend on port 8000..."
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

sleep 3

if curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
    echo "FastAPI backend is running!"
else
    echo "Warning: FastAPI backend may not be ready yet, waiting..."
    sleep 2
fi

echo "Starting Next.js frontend on port 5000..."
npx next dev --port 5000 &
FRONTEND_PID=$!

echo ""
echo "==================================="
echo "Services started:"
echo "  - FastAPI Backend: http://localhost:8000"
echo "  - Next.js Frontend: http://localhost:5000"
echo "==================================="
echo ""

wait $BACKEND_PID $FRONTEND_PID
