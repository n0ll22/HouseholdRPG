#!/bin/bash

# Start the server in a new terminal tab
echo "Starting server..."
wt new-tab -d ./server bash -c "npm i && npm run dev" &

# Start the client in another new terminal tab
echo "Starting client..."
wt new-tab -d ./client bash -c "npm i && npm run dev" &

# Wait for processes to complete
wait