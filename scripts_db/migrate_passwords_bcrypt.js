/**
 * Migración de contraseñas: AES legacy (crypto-js) -> bcrypt
 *
 * Uso (una sola vez, opcional):
 *   node scripts_db/migrate_passwords_bcrypt.js
 *
 * Alternativa: si no se corre este script, la app migra automáticamente
 * cada password al primer login exitoso (rehash-on-login).
 *
 * Requiere las variables DATABASE_* en el .env.
 */
require('dotenv').config();
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const crypto = require('crypto-js');

const BCRYPT_ROUNDS = 10;
const isBcryptHash = (hash) => typeof hash === 'string' && /^\$2[ayb]\$\d{2}\$/.test(hash);

const conn = mysql.createConnection({
	host: process.env.DATABASE_HOST,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASSWORD,
	database: process.env.DATABASE_NAME
});

const table = process.env.USER_TABLE || 'users';

async function main() {
	const [rows] = await conn.promise().query(`SELECT id, user, password FROM ${table}`);
	let migrated = 0;
	let skipped = 0;
	let failed = 0;

	for (const row of rows) {
		try {
			if (isBcryptHash(row.password)) {
				skipped++;
				continue;
			}
			const plain = crypto.AES.decrypt(row.password, process.env.CRYPTO_SECRET_KEY).toString(crypto.enc.Utf8);
			if (!plain) {
				failed++;
				console.log(`SALTADO (no se pudo descifrar): ${row.user}`);
				continue;
			}
			const hash = await bcrypt.hash(plain, BCRYPT_ROUNDS);
			await conn.promise().query(`UPDATE ${table} SET password=? WHERE id=?`, [hash, row.id]);
			migrated++;
			console.log(`Migrado: ${row.user}`);
		} catch (error) {
			failed++;
			console.error(`ERROR migrando ${row.user}:`, error.message);
		}
	}

	console.log(`\nResumen: ${migrated} migrados, ${skipped} ya eran bcrypt, ${failed} con error`);
	conn.end();
}

main().catch((error) => {
	console.error(error);
	conn.end();
	process.exit(1);
});
