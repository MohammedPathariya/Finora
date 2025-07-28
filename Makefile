# Makefile to run Finora backend and frontend together

# Variables
BACKEND_DIR=backend
FRONTEND_DIR=frontend
CONDA_ENV=finora
BACKEND_PORT=5000
FRONTEND_PORT=3000

# Start backend only
start-backend:
	@echo "Starting Flask backend on port $(BACKEND_PORT)..."
	cd $(BACKEND_DIR) && conda run -n $(CONDA_ENV) flask run --port=$(BACKEND_PORT)

# Start frontend only
start-frontend:
	@echo "Starting React frontend on port $(FRONTEND_PORT)..."
	cd $(FRONTEND_DIR) && npm start

# Start both backend and frontend together
start-all:
	@echo "Starting both backend and frontend..."
	( cd $(BACKEND_DIR) && conda run -n $(CONDA_ENV) flask run --port=$(BACKEND_PORT) ) & \
	( cd $(FRONTEND_DIR) && npm start )