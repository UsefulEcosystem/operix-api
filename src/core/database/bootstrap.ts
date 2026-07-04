import { spawn } from 'node:child_process';
import path from 'node:path';

function runMigrations() {
  return new Promise<void>((resolve, reject) => {
    const cliPath = path.resolve(process.cwd(), 'node_modules', 'sequelize-cli', 'lib', 'sequelize');
    const child = spawn('node', [cliPath, 'db:migrate'], {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'inherit',
      shell: true
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Falha ao executar migrations (exit code ${code ?? 'desconhecido'}).`));
    });
  });
}

class DatabaseBootstrap {
  static async init() {
    await runMigrations();
  }
}

export default DatabaseBootstrap;
