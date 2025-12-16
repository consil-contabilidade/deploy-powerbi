import { exec } from 'child_process';
  
export default async function gitPush() {
  const commands = [
      'git pull'
  ];
  
  for (const cmd of commands) {
      try {
          await new Promise((resolve, reject) => {
              exec(cmd, (error, stdout, stderr) => {
                  if (error) reject(error);
                  else resolve(stdout);
              });
          });
          console.log(`✅ ${cmd} executado com sucesso`);
      } catch (error) {
          console.error(`❌ Erro em ${cmd}:`, error.message);
          break;
      }
  }
}
