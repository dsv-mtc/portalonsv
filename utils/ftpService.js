const ftp = require("basic-ftp");
const path = require("path");

async function subirArchivoAFtp(localFilePath, remoteFileName) {
    const client = new ftp.Client();
    // client.ftp.verbose = true; // Activa esto si hay errores y quieres ver los logs en la consola

    try {
        await client.access({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            password: process.env.FTP_PASSWORD,
            port: parseInt(process.env.FTP_PORT) || 21,
            secure: process.env.FTP_SECURE === 'true'
        });

        console.log("Conexión FTP exitosa.");

        // Si el Inge te dice que los archivos van dentro de una carpeta específica en el FTP
        if (process.env.FTP_REMOTE_DIR) {
            await client.ensureDir(process.env.FTP_REMOTE_DIR);
        }

        // Sube el archivo
        await client.uploadFrom(localFilePath, remoteFileName);
        console.log(`Archivo ${remoteFileName} subido al FTP del MTC.`);

    } finally {
        client.close();
    }
}

module.exports = { subirArchivoAFtp };