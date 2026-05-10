#!/bin/sh

# Start main app on port 4000
PORT=4000 node dist/ngstarter/server/server.mjs &

# Start docs app on port 4001
PORT=4001 node dist/docs/server/server.mjs &

# Start admin app on port 4002
PORT=4002 node dist/admin/server/server.mjs &

# Start admin-corporate app on port 4003
PORT=4003 node dist/admin-corporate/server/server.mjs &

# Wait for all background processes
wait
