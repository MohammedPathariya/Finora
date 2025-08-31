# 1. Use an official, lightweight Python image as the base.
# python:3.11-slim is a good choice as it's smaller than the full Debian image.
FROM python:3.11-slim

# 2. Set the working directory inside the container.
# This is where our application code will live.
WORKDIR /app

# 3. Copy the dependency file first.
# This is a key Docker optimization. If requirements.txt doesn't change,
# Docker will use a cached layer, speeding up subsequent builds.
COPY requirements.txt .

# 4. Install the Python dependencies.
# --no-cache-dir reduces the image size.
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy the rest of the backend application code into the container.
COPY . .

# 6. Expose the port that the Flask application runs on.
# This informs Docker that the container listens on port 5000.
EXPOSE 5000

# 7. Define the command to run the application.
# For production, it is highly recommended to use a WSGI server like Gunicorn
# instead of Flask's built-in development server.
#
# You will need to add `gunicorn` to your requirements.txt file.
# The command starts 4 worker processes and binds to all network interfaces
# on port 5000, making it accessible from outside the container.
CMD ["gunicorn", "--workers=4", "--bind=0.0.0.0:5000", "app:app"]