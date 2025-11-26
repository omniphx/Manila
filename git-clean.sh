#!/bin/bash

# Git clean function that preserves specific files and folders
git_clean() {
    echo "Running git clean with exclusions..."
    
git clean -fdx \
    -e "apps/frontend/.vercel" \
    -e "apps/frontend/.clerk" \
    -e "apps/frontend/next-env.d.ts" \
    -e "apps/frontend/.env.development.local" \
    -e "apps/backend/.env.development" \
    -e "apps/backend/.env.production" \
    -e "apps/backend/.env" \
    -e "apps/backend/.env" \
    -e "apps/mobile/.env" \
    -e "apps/mobile/expo-env.d.ts" \
    -e ".claude"
    
    echo "Done!"
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    git_clean
fi