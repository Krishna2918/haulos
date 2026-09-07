#!/bin/sh
# Revive contract: preview on 0.0.0.0:8080 via npm run dev.
if curl -sf -o /dev/null http://127.0.0.1:8080/; then
  exit 0
fi
cd /workspace || exit 1
npm run dev &
exit 0
