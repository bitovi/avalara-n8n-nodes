#!/bin/sh

# =============================================================================
# n8n Custom Node Startup Script
# =============================================================================
#
# SUMMARY:
# This script prepares and starts n8n with custom nodes in a development environment.
# It handles the complete setup process including n8n installation, dependency installation,
# building custom nodes from TypeScript source, and registering them with n8n before starting the service.
#
# PROCESS OVERVIEW:
# 1. Environment Setup - Sets development environment and safety flags
# 2. n8n Installation - Installs n8n globally if not already present
# 3. Dependency Management - Installs npm packages if needed
# 4. Build Process - Compiles TypeScript custom nodes to JavaScript
# 5. Custom Node Preparation - Built nodes loaded via volume mount
# 6. Service Startup - Launches n8n directly
#
# PREREQUISITES:
# - Docker container based on node:20 image
# - Project mounted at /app with package.json and TypeScript source files
# - Build tools (npm, tsc, gulp) available in the container
#
# USAGE:
# This script is designed to be used as a Docker container startup command
# =============================================================================

# Exit immediately if any command fails (safety measure)
set -e

echo "Running n8n-startup.sh"
echo "Setting up custom n8n nodes for development environment"

# =============================================================================
# SECTION 1: ENVIRONMENT AND VARIABLE SETUP
# =============================================================================

# Set Node.js environment to development mode
# This enables development-specific features and more verbose logging
export NODE_ENV=dev

# Define the project directory where our custom node source code lives
# This should match the Docker container's working directory
project_dir="/app"

# Flag to track if we need to rebuild the project
# Will be set to true if dependencies are installed or missing
rebuild_required=false

echo "Working in project directory: $project_dir"
cd $project_dir

# =============================================================================
# SECTION 1A: N8N INSTALLATION
# =============================================================================

echo "Checking if n8n is installed globally"
if ! command -v n8n >/dev/null 2>&1; then
    echo "n8n not found, installing globally..."
    npm install -g n8n
    echo "n8n installed successfully"
else
    echo "n8n is already installed"
fi

# =============================================================================
# SECTION 2: PROJECT VALIDATION AND DEPENDENCY MANAGEMENT
# =============================================================================

echo "Checking if package.json exists"
if [ -f "$project_dir/package.json" ]; then
    echo "Found package.json in $project_dir"
    
    # =============================================================================
    # SECTION 2A: DEPENDENCY INSTALLATION
    # =============================================================================
    
    # Install dependencies if node_modules doesn't exist or is incomplete
    # The .install-complete file acts as a marker to avoid redundant installations
    if [ ! -d "$project_dir/node_modules" ] || [ ! -f "$project_dir/node_modules/.install-complete" ]; then
        echo "Installing dependencies..."
        npm install
        
        # Create marker file to indicate successful installation
        touch "$project_dir/node_modules/.install-complete"
        
        # Set rebuild flag since we just installed dependencies
        rebuild_required=true
    else
        echo "Dependencies already installed"
    fi

    # =============================================================================
    # SECTION 2B: BUILD PROCESS
    # =============================================================================
    
    # Build if no dist directory or if rebuild is required
    # The dist directory contains the compiled JavaScript files that n8n will use
    echo "Checking if dist directory exists"
    if [ ! -d "$project_dir/dist" ] || [ $rebuild_required = true ]; then
        echo "Building custom nodes..."
        
        # Remove existing dist directory to ensure clean build
        # This prevents stale files from previous builds
        if [ -d "$project_dir/dist" ]; then
            echo "Removing existing dist directory"
            rm -rf "$project_dir/dist"
        fi

        # Run the build script defined in package.json
        # This typically runs TypeScript compiler and copies assets
        npm run build
        echo "Build completed successfully"
    else
        echo "Dist directory exists, skipping build"
    fi

    # =============================================================================
    # SECTION 2C: CUSTOM NODE PREPARATION
    # =============================================================================
    
    # Prepare custom nodes directory for n8n to load
    custom_nodes_dir="/app/.n8n/custom"
    echo "Preparing custom nodes directory: $custom_nodes_dir"
    
    # Create the custom nodes directory if it doesn't exist
    mkdir -p "$custom_nodes_dir"
    
    # Check if the custom directory is already pointing to dist (via volume mount)
    if [ -f "$custom_nodes_dir/package.json" ] && [ -f "$project_dir/dist/package.json" ]; then
        # Check if they're the same file (via inode comparison or content)
        if [ "$custom_nodes_dir/package.json" -ef "$project_dir/dist/package.json" ]; then
            echo "Custom nodes directory is already mounted to dist directory"
        else
            echo "Copying files to custom nodes directory"
            cp -r "$project_dir/dist"/* "$custom_nodes_dir/"
            echo "Copied built nodes to custom directory"
        fi
    else
        # Directory is empty or no package.json, copy everything
        echo "Copying files to custom nodes directory"
        if [ -f "$project_dir/dist/package.json" ]; then
            cp -r "$project_dir/dist"/* "$custom_nodes_dir/"
            echo "Copied built nodes to custom directory"
        else
            echo "Warning: No dist/package.json found"
            echo "Custom nodes may not load properly"
        fi
    fi
    
    # List contents for debugging
    echo "Custom nodes directory contents:"
    ls -la "$custom_nodes_dir"
    
else
    # If no package.json exists, we cannot proceed with the setup
    echo "No package.json found in $project_dir"
    echo "Cannot continue without a valid Node.js project configuration"
    exit 1
fi

# =============================================================================
# SECTION 3: N8N SERVICE STARTUP
# =============================================================================

echo "Starting n8n"
echo "Custom nodes have been built and registered, launching n8n service..."

# Debug information
echo "Environment variables:"
echo "N8N_CUSTOM_EXTENSIONS=$N8N_CUSTOM_EXTENSIONS"
echo "N8N_USER_FOLDER=$N8N_USER_FOLDER"

# Start n8n directly
# n8n will automatically discover and load the custom nodes from N8N_CUSTOM_EXTENSIONS
exec n8n start