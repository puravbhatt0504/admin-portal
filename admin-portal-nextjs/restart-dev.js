const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

let devProcess = null;
let restartCount = 0;
const maxRestarts = 10;

function startDevServer() {
  console.log(`Starting Next.js dev server (attempt ${restartCount + 1})...`);
  
  devProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname
  });

  devProcess.on('error', (err) => {
    console.error('Failed to start dev server:', err);
    if (restartCount < maxRestarts) {
      restartCount++;
      console.log(`Restarting in 3 seconds... (${restartCount}/${maxRestarts})`);
      setTimeout(startDevServer, 3000);
    } else {
      console.error('Max restart attempts reached. Exiting.');
      process.exit(1);
    }
  });

  devProcess.on('exit', (code) => {
    console.log(`Dev server exited with code ${code}`);
    if (code !== 0 && restartCount < maxRestarts) {
      restartCount++;
      console.log(`Restarting in 3 seconds... (${restartCount}/${maxRestarts})`);
      setTimeout(startDevServer, 3000);
    }
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\nShutting down dev server...');
    if (devProcess) {
      devProcess.kill('SIGINT');
    }
    process.exit(0);
  });
}

// Start the dev server
startDevServer();
