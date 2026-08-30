#!/bin/bash
cd "$(dirname "$0")"

# Ensure PATH includes Homebrew, user binaries, and standard locations
export PATH="/Users/colorlab/homebrew/bin:/opt/homebrew/bin:/usr/local/bin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node 2>/dev/null | tail -n 1)/bin:$PATH"

echo "========================================================"
echo "       COLORLAB WORKS - NATIVE DESKTOP SOFTWARE"
echo "========================================================"
echo ""
echo "Project Path: $(pwd)"
echo "Node Path:    $(which node 2>/dev/null || echo 'Node not found')"
echo "Launching ColorLab Works Desktop Application..."
echo ""

npm run electron:dev

