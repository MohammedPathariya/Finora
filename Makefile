SHELL := /usr/bin/env bash

# Makefile to run Finora backend and frontend together

# --- Variables ---
BACKEND_DIR := backend
FRONTEND_DIR := frontend
CONDA_ENV := finora
BACKEND_PORT := 5000
FRONTEND_PORT := 3000

# --- Docker Commands ---
.PHONY: docker-build
docker-build:
# IMPORTANT: The line below must start with a TAB, not spaces.
	@echo "Building backend Docker image..."
	docker compose build

.PHONY: docker-start
docker-start:
# IMPORTANT: The line below must start with a TAB, not spaces.
	@echo "Starting backend service in Docker..."
	docker compose up -d

.PHONY: docker-stop
docker-stop:
# IMPORTANT: The line below must start with a TAB, not spaces.
	@echo "Stopping backend Docker service..."
	docker compose down

.PHONY: docker-logs
docker-logs:
# IMPORTANT: The line below must start with a TAB, not spaces.
	@echo "Showing backend Docker logs..."
	docker compose logs -f

# --- Legacy Local Commands (Kept for reference) ---
.PHONY: kill-backend
kill-backend:
# IMPORTANT: The line below must start with a TAB, not spaces.
	@echo "Stopping any service on port $(BACKEND_PORT)..."
	-@lsof -ti tcp:$(BACKEND_PORT) | xargs -r kill -9

.PHONY: start-backend-local
start-backend-local: kill-backend
# IMPORTANT: The line below must start with a TAB, not spaces.
	@echo "Starting Flask backend locally on port $(BACKEND_PORT)..."
	cd $(BACKEND_DIR) && \
	bash -lc "conda activate $(CONDA_ENV) && \
	export FLASK_APP=app.py FLASK_ENV=development && \
	flask run --port=$(BACKEND_PORT)"

# --- Combined Workflow ---
.PHONY: start-frontend
start-frontend:
# IMPORTANT: The line below must start with a TAB, not spaces.
	@echo "Starting React frontend on port $(FRONTEND_PORT)..."
	cd $(FRONTEND_DIR) && \
	HOST=localhost PORT=$(FRONTEND_PORT) DANGEROUSLY_DISABLE_HOST_CHECK=true npm start

.PHONY: start-all
start-all: docker-start
# IMPORTANT: The line below must start with a TAB, not spaces.
	@echo "Starting React frontend..."
	make start-frontend