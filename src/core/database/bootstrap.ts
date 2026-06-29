import { spawn } from 'node:child_process';

function runMigrations() {
  return new Promise<void>((resolve, reject) => {
    const child = spawn('bun', [
      'run',
      './node_modules/.bin/sequelize-cli',
      'db:migrate'
    ], {
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
