# n8n Custom Node Development Environment

A Docker-based development environment for building and testing custom n8n nodes with automatic building and hot-reloading.

## Quick Start

**Prerequisites:** Docker and Docker Compose

1. **Start the environment:**
   ```bash
   docker-compose up
   ```
   n8n will be available at http://localhost:5678

2. **Create your custom nodes:**
   - Add node files to `/nodes/YourNodeName/`
   - Add credentials to `/credentials/` if needed
   - Update `package.json` to register your nodes

3. **Refresh after changes:**
   - **TypeScript changes:** Restart the container: `docker-compose restart`
   - **Package changes:** Rebuild: `docker-compose down && docker-compose up`

## Project Structure

```
├── nodes/                    # Your custom nodes go here
│   ├── ExampleNode/         # Example node implementation
│   └── HttpBin/             # Another example node
├── credentials/             # Custom credential types
├── scripts/n8n-startup.sh  # Automatic build and startup script
├── docker-compose.yml      # Development environment config
└── package.json            # Node registration and dependencies
```

## Adding New Nodes

1. **Create node directory:** `/nodes/YourNodeName/`
2. **Add TypeScript files:** `YourNodeName.node.ts`
3. **Register in package.json:**
   ```json
   "n8n": {
     "nodes": [
       "dist/nodes/YourNodeName/YourNodeName.node.js"
     ]
   }
   ```
4. **Restart container:** `docker-compose restart`

## Development Commands

```bash
# Start development environment
docker-compose up

# Restart after code changes
docker-compose restart

# Rebuild everything
docker-compose down && docker-compose up

# Run inside container for debugging
docker-compose exec n8n-dev bash

# Check logs
docker-compose logs n8n-dev
```

## How It Works

- Container automatically installs dependencies and builds TypeScript
- Built nodes are mounted to n8n's custom extensions directory
- Changes to TypeScript require container restart for compilation
- n8n automatically loads custom nodes on startup

## License

[MIT](LICENSE.md)
