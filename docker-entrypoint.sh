#!/bin/sh

# Wait for PostgreSQL to become ready (adjust the sleep time as needed)
echo "Waiting for PostgreSQL to be ready..."
sleep 5

# Run database migrations
echo "Running database migrations..."
npm run db:migrate

# Start the application
echo "Starting the application..."
npm run start:prod
