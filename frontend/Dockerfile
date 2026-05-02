FROM ubuntu:latest

# Install necessary packages
RUN apt-get update && apt-get install -y \
    python3 python3-pip python3-venv libpq-dev gunicorn nginx \
    curl unzip libdbus-1-dev pkg-config libglib2.0-dev libcairo2-dev \
    libgirepository1.0-dev gir1.2-glib-2.0

WORKDIR /backend

COPY . /backend

# Upgrade pip and install requirements (excluding systemd-python)
RUN python3 -m venv venv && \
    . venv/bin/activate && \
    pip3 install --upgrade pip && \
    pip3 install -r requirements.txt

# Install AWS CLI in the virtual environment
RUN . venv/bin/activate && \
    curl "https://d1vvhvl2y92vvt.cloudfront.net/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip -o awscliv2.zip && \
    ./aws/install && \
    rm -rf awscliv2.zip aws

EXPOSE 5000

ENV FLASK_APP=app.py

# Start Gunicorn and configure AWS CLI
CMD ["/bin/bash", "-c", "source venv/bin/activate && aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID && aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY && aws configure set default.region $AWS_DEFAULT_REGION && aws configure set default.output $AWS_DEFAULT_OUTPUT && gunicorn -w 5 -b 0.0.0.0:5000 app:app"]
