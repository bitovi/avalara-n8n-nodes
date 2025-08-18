# n8n Custom Node Startup Script

This directory contains the startup script for building and running n8n with custom nodes in a Docker environment.

## Files

- `n8n-startup.sh` - Main startup script that prepares the environment and starts n8n

## Script Behavior

The startup script handles different scenarios automatically:

### Scenario 1: Fresh Container Start (No Dependencies)
**When:** First time running or no `node_modules` directory exists
**Actions:**
1. Runs `npm install` to install all dependencies
2. Creates `.install-complete` marker file
3. Builds the project (`npm run build`)
4. Installs custom nodes globally
5. Starts n8n

**Output:** Full setup with dependency installation and build

### Scenario 2: Dependencies Exist, No Build Output
**When:** `node_modules` exists but no `dist` directory
**Actions:**
1. Skips dependency installation
2. Builds the project (`npm run build`)
3. Installs custom nodes globally
4. Starts n8n

**Output:** Build only, no dependency installation

### Scenario 3: Everything Already Built
**When:** Both `node_modules` and `dist` directories exist
**Actions:**
1. Skips dependency installation
2. Skips build process
3. Installs custom nodes globally
4. Starts n8n

**Output:** Fastest startup, only registration and launch

### Scenario 4: Dependencies Changed (Force Rebuild)
**When:** `node_modules` exists but `.install-complete` marker is missing
**Actions:**
1. Runs `npm install` (dependencies may have changed)
2. Creates `.install-complete` marker file
3. Forces a rebuild (removes old `dist`, runs `npm run build`)
4. Installs custom nodes globally
5. Starts n8n

**Output:** Full rebuild to ensure consistency

### Scenario 5: No package.json
**When:** Project directory doesn't contain a `package.json` file
**Actions:**
1. Displays error message
2. Exits with status code 1

**Output:** Script fails gracefully with clear error message

## Environment Variables

The script sets the following environment:
- `NODE_ENV=dev` - Enables development mode for verbose logging

## Key Features

- **Idempotent**: Safe to run multiple times
- **Efficient**: Skips unnecessary steps when possible
- **Robust**: Handles missing files and directories gracefully
- **Clean Builds**: Removes old build artifacts before rebuilding
- **Development-Focused**: Optimized for rapid development cycles

## Usage with Docker Compose

The script is designed to work with the provided `docker-compose.yml`:

```bash
docker compose up
```

The container will automatically execute this startup script and make custom nodes available in n8n at `http://localhost:5678`.
