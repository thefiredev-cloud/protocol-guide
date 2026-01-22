#!/bin/bash
# Protocol Guide Rust Server Startup Script

# Load environment variables from parent .env file
if [ -f "../.env" ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
fi

# Set default port if not specified
export PORT=${PORT:-3000}
export HOST=${HOST:-0.0.0.0}

echo "Starting Protocol Guide Rust Server on ${HOST}:${PORT}"

# Run the release binary
./target/release/protocol_guide_server
