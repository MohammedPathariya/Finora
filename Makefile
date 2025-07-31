SHELL := /usr/bin/env bash

# Makefile to run Finora backend and frontend together

# Variables
BACKEND_DIR := backend
FRONTEND_DIR := frontend
CONDA_ENV := finora
BACKEND_PORT := 5000
FRONTEND_PORT := 3000

# Kill any process using the backend port
.PHONY: kill-backend
kill-backend:
	@echo "Stopping any service on port $(BACKEND_PORT)..."
	-@lsof -ti tcp:$(BACKEND_PORT) | xargs -r kill -9

# Start backend only
.PHONY: start-backend
start-backend: kill-backend
	@echo "Starting Flask backend on port $(BACKEND_PORT)..."
	cd $(BACKEND_DIR) && \
	bash -lc "conda activate $(CONDA_ENV) && \
	export FLASK_APP=app.py FLASK_ENV=development && \
	flask run --port=$(BACKEND_PORT)"

# Start frontend only
.PHONY: start-frontend
start-frontend:
	@echo "Starting React frontend on port $(FRONTEND_PORT)..."
	cd $(FRONTEND_DIR) && \
	HOST=localhost PORT=$(FRONTEND_PORT) DANGEROUSLY_DISABLE_HOST_CHECK=true npm start

# Start both backend and frontend together
.PHONY: start-all
start-all: kill-backend
	@echo "Starting both backend and frontend..."
	( cd $(BACKEND_DIR) && \
	  bash -lc "conda activate $(CONDA_ENV) && \
	  export FLASK_APP=app.py FLASK_ENV=development && \
	  flask run --port=$(BACKEND_PORT)" ) & \
	( cd $(FRONTEND_DIR) && \
	  HOST=localhost PORT=$(FRONTEND_PORT) DANGEROUSLY_DISABLE_HOST_CHECK=true npm start )