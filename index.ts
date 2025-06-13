import { z } from 'zod'
import { exec } from 'child_process';

// #region get conf
const confJson = await import('./conf.json')
const confSchema = z.object({
    "POSTGRES_PASSWORD": z.string(),
    "POSTGRES_HOST": z.string(),
    "POSTGRES_PORT": z.string(),
    "POSTGRES_USER": z.string(),
    "INTERVAL_MS": z.string(),
    "BACKUP_DIR": z.string()
})
confSchema.parse(confJson.default);
// #endregion

const createCommand = (): string => `sudo docker run --net host \
  -v $(pwd):/backups \
  -e PGPASSWORD=${confJson.POSTGRES_PASSWORD} \
  postgres:latest \
  pg_dump -h ${confJson.POSTGRES_HOST} -p ${confJson.POSTGRES_PORT} -U ${confJson.POSTGRES_USER} -F p -f /backups/backups/${new Date().toISOString()}-${Date.now()}.sql`;


// Function to execute the command
function runBackup() {
    exec(createCommand(), (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
        }
        console.log(`Backup completed at ${new Date().toISOString()}`);
        if (stdout) {
            console.log(`stdout: ${stdout}`);
        }
    })
}

runBackup()
setInterval(runBackup, parseInt(confJson.INTERVAL_MS))

console.log('Backup scheduler started')