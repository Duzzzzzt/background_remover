#!/usr/bin/env node

// start.js - Auto-detects Python or Node.js to serve the project
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

// Check if we're in the correct directory
if (!fs.existsSync('index.html')) {
  console.error('❌ ERROR: index.html not found!');
  console.error('Please run this script from the project root directory.');
  process.exit(1);
}

// Try to find available tools
let hasPython = false;
let hasNode = true; // We're running in Node.js right now!

try {
  const pyVersion = execSync('python --version 2>&1 || python3 --version 2>&1', { encoding: 'utf8' });
  if (pyVersion.includes('Python 3')) hasPython = true;
} catch (e) {
  // Python not available
}

// Simple static file server (Node.js fallback)
function createNodeServer() {
  const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml',
    '.wasm': 'application/wasm'
  };

  const server = http.createServer((req, res) => {
    let filePath = '.' + req.url;
    if (filePath === './') filePath = './index.html';

    const extname = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          res.writeHead(404);
          res.end('404 Not Found');
        } else {
          res.writeHead(500);
          res.end('500 Internal Server Error');
        }
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });

  const PORT = 8080;
  server.listen(PORT, () => {
    console.log(`\n✅ Project running at: http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop\n');
  });
}

// Start appropriate server
if (hasPython) {
  console.log('🐍 Using Python HTTP server...');
  const cmd = process.platform === 'win32' ? 'python' : 'python3';
  const server = spawn(cmd, ['-m', 'http.server', '8000'], {
    stdio: 'inherit',
    shell: true
  });
  
  process.on('SIGINT', () => {
    server.kill();
    process.exit(0);
  });
} else {
  console.log('🟢 Using built-in Node.js server...');
  console.log('Serving files from current directory...\n');
  createNodeServer();
}