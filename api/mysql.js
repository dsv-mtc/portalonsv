const mysql = require("mysql2");
const dotenv = require("dotenv");
const crypto = require("crypto-js");
const bcrypt = require("bcryptjs");
const moment = require('moment');
dotenv.config();
const util = require("util");
const logger = require('../controllers/logger');
const BCRYPT_ROUNDS = 10;
const isBcryptHash = (hash) => typeof hash === 'string' && /^\$2[ayb]\$\d{2}\$/.test(hash);
const dataConnection = {
	host: process.env.DATABASE_HOST,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASSWORD,
	database: process.env.DATABASE_NAME,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
	enableKeepAlive: true,
	keepAliveInitialDelay: 10000
}

const pool = mysql.createPool(dataConnection)

// Compat: código legacy usa `client`; apuntamos al pool
const client = pool

// Pool maneja reconexión automática; logueamos errores del pool
pool.on('connection', (conn) => {
	logger.debug(`Nueva conexión MySQL establecida: ${conn.threadId}`);
});
pool.on('error', (err) => {
	logger.error('Error en pool MySQL: ' + err.message);
});


class DataBase {
	constructor() {
		this.query = null;
		this.pool = pool;
	}
	getConnection = () => {
		// Pool no requiere connect explícito; verificamos con ping
		pool.getConnection((err, conn) => {
			if (err) {
				logger.error('Error al obtener conexión del pool: ' + err.message);
				return;
			}
			logger.info('Pool MySQL listo (conexión ' + conn.threadId + ' verificada)');
			conn.release();
		});
	}
	setQuery() {
		//Habilitamos el uso de async/await con pool
		this.query = util.promisify(pool.query).bind(pool);
		this.getConnection_fromPool = util.promisify(pool.getConnection).bind(pool);
		// beginTransaction requiere conexión dedicada; se obtiene por demanda
		this.beginTransaction = async () => {
			const conn = await this.getConnection_fromPool();
			const beginTx = util.promisify(conn.beginTransaction).bind(conn);
			await beginTx();
			return conn;
		};
	}

	async getRoles() {
		const queryString = `
			SELECT
				ur.id,
				ur.value
			FROM user_role ur
		`;
		try {
			const results = await this.query(queryString);
			return {
				success: true,
				data: results,
				message: "Se obtuvieron los roles"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo recuperar los datos, recargue la página"
			}
		}
	}

	async getPermisos() {
		const queryString = `
			SELECT
				p.id,
				p.value
			FROM permission p
		`;
		try {
			const results = await this.query(queryString);
			return {
				success: true,
				data: results,
				message: "Se obtuvieron los permisos"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo recuperar los datos, recargue la página"
			}
		}
	}

	async getRolesWithPermissions() {
		let query = `
			SELECT
				ur.id roleId,
				ur.value role,
				p.id permissionId,
				p.value permission
			FROM user_role ur
			JOIN rel_user_role_permission rurp ON ur.id = rurp.roleId
			JOIN permission p ON p.id = rurp.permissionId
		 `

		query = query.replace(/\s+/g, ' ').trim()

		try {
			const results = await this.query(query);

			const roles = results
				.reduce((acc, r) => {
					if (!acc[r.roleId]) {
						acc[r.roleId] = {
							id: r.roleId,
							value: r.role,
							permissions: []
						}
					}
					acc[r.roleId].permissions.push({
						id: r.permissionId,
						value: r.permission
					})
					return acc
				}, [])
				.filter(Boolean)

			return {
				success: true,
				data: roles
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudieron obtener los planes regionales"
			}
		}
	}

	/**
	 * 
	 * @param {{
	 * 	conditions: {
	 * 		id?: number,
	 * 		userId?: number,
	 *  }
	 * }} data
	 * @returns 
	 */
	async getUsersWithPermissions({
		conditions
	}) {
		let whereConditions = ''
		const params = []
		if (conditions) {
			const unionCondition = ' AND '
			let isFirstCondition = true
			if (conditions.id) {
				const prefix = isFirstCondition ? '' : unionCondition
				whereConditions += `${prefix} rurp.id = ? `
				params.push(Number(conditions.id))
				isFirstCondition = false
			}
			if (conditions.userId) {
				const prefix = isFirstCondition ? '' : unionCondition
				whereConditions += `${prefix} u.id = ?`
				params.push(Number(conditions.userId))
				isFirstCondition = false
			}
		}

		let query = `
			SELECT
				rurp.id,
				rurp.permissionId,
				p.value permission,
				rurp.roleId,
				ur.value role,
				u.id userId,
				u.user user
			FROM rel_user_role_permission rurp
			JOIN permission p ON p.id = rurp.permissionId
			JOIN user_role ur ON ur.id = rurp.roleId
			JOIN users u ON u.idUserRole = ur.id
			${whereConditions
				? `WHERE ${whereConditions}`
				: ''
			}
		 `

		query = query.replace(/\s+/g, ' ').trim()

		try {
			const results = await this.query(query, params);

			const users = results
				.reduce((acc, r) => {
					if (!acc[r.userId]) {
						acc[r.userId] = {
							id: r.userId,
							user: r.user,
							roleId: r.roleId,
							role: r.role,
							permissions: []
						}
					}
					acc[r.userId].permissions.push({
						id: r.permissionId,
						value: r.permission
					})
					return acc
				}, [])
				.filter(Boolean)

			return {
				success: true,
				data: users
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudieron obtener los planes regionales"
			}
		}
	}

	async createRole({
		value,
		permissionIds
	}) {
		const roleQuery = `
			INSERT INTO user_role (value)
			VALUES (?);
		`
		try {
			const {insertId} = await this.query(roleQuery, [value]);

			const placeholders = permissionIds.map(() => '(?, ?)').join(',');
			const values = [];
			permissionIds.forEach(p => { values.push(Number(p), insertId); });
			const permissionsQuery = `
				INSERT INTO rel_user_role_permission (permissionId, roleId)
				VALUES ${placeholders}
			`;
			
			await this.query(permissionsQuery, values);
			return {
				success: true,
				message: "Se creó el rol"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo crear el rol"
			}
		}

	}

	async updateRole({
		id,
		value,
		permissionIds
	}) {
		const removeRolPermissionsQuery = `
			DELETE FROM rel_user_role_permission WHERE roleId=?
		`

		const placeholders = permissionIds.map(() => '(?, ?)').join(',');
		const values = [];
		permissionIds.forEach(p => { values.push(Number(p), Number(id)); });
		const createRolPermissionQuery = `
			INSERT INTO rel_user_role_permission (permissionId, roleId)
			VALUES ${placeholders}
		`

		const updateRoleQuery = `
			UPDATE user_role SET value=? WHERE id=?
		`

		try {
			await this.query(removeRolPermissionsQuery, [Number(id)])
			await Promise.all([
				this.query(createRolPermissionQuery, values),
				this.query(updateRoleQuery, [value, Number(id)]),
			]);

			return {
				success: true,
				message: "Se actualizó el rol"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo actualizar el rol"
			}
		}
	}

	async deleteRole(id) {
		const queryString = `DELETE FROM user_role WHERE id=?`;
		try {
			const result = await this.query(queryString, [Number(id)]);
			return {
				success: true,
				data: result,
				message: "Se eliminó el usuario"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo eliminar el usuario"
			}
		}
	}

	async getUserByEmail(user) {
		try {
			const queryString = `SELECT * FROM ${process.env.USER_TABLE} WHERE user= ? `;
			let result = await this.query(queryString, [user])
			if (result.length > 0) {
				return { success: true, data: result[0] }
			} else {
				return { success: false, message: "User not found" }
			}

		} catch (error) {
			console.error(error)
			return { success: false, message: "Cannot get user" }
		}


	}

	async getUserById(id) {
		try {
			const queryString = `
				SELECT 
					u.id,
					u.user,
					u.password,
					u.idUserRole,
					ur.value role
				FROM ${process.env.USER_TABLE} u
				JOIN user_role ur ON ur.id = u.idUserRole
				WHERE u.id = ?
			`;
			let result = await this.query(queryString, [Number(id)])
			if (result.length > 0) {
				return { success: true, data: result[0] }
			} else {
				return { success: false, message: "User not found" }
			}

		} catch (error) {
			console.error(error)
			return { success: false, message: "Cannot get user" }
		}
	}

	async getUsers() {
		const queryString = `
			SELECT 
				u.id,
				u.user,
				u.idUserRole,
				u.estaActivo,
				ur.value role
			FROM ${process.env.USER_TABLE} u
			JOIN user_role ur ON ur.id = u.idUserRole
		`;
		try {
			const results = await this.query(queryString);
			return {
				success: true,
				data: results.map(u => ({ ...u, esta_activo: u.estaActivo === 1 })),
				message: "Se obtuvieron los usuarios"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo recuperar los datos, recargue la página"
			}
		}

	}

	async createUser({
		email,
		password,
		roleId,
		estaActivo
	}) {
		try {
			const passwordHash = await bcrypt.hash(password || '', BCRYPT_ROUNDS);
			const queryString = `
				INSERT INTO ${process.env.USER_TABLE} 
					(user, password, idUserRole, estaActivo) 
				VALUES 
					(?, ?, ?, ?)
			`
			const result = await this.query(queryString, [email, passwordHash, Number(roleId), estaActivo ? 1 : 0])
			return {
				success: true,
				data: result,
				message: "Se creó el usuario"
			};
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo crear el usuario"
			}
		}

	}

	async updateUser({
		id,
		email,
		password,
		roleId,
		estaActivo
	}) {
		let passwordHash;
		try {
			passwordHash = password
				? await bcrypt.hash(password, BCRYPT_ROUNDS)
				: undefined;
		} catch (error) {
			return {
				success: false,
				message: "No se pudo actualizar el usuario"
			}
		}
		try {
			let result;
			if (passwordHash) {
				const queryString = `
					UPDATE ${process.env.USER_TABLE} 
						SET
							user=?,
							password=?,
							idUserRole=?,
							estaActivo=?
						WHERE id=?`;
				result = await this.query(queryString, [email, passwordHash, Number(roleId), estaActivo ? 1 : 0, Number(id)]);
			} else {
				const queryString = `
					UPDATE ${process.env.USER_TABLE} 
						SET
							user=?,
							idUserRole=?,
							estaActivo=?
						WHERE id=?`;
				result = await this.query(queryString, [email, Number(roleId), estaActivo ? 1 : 0, Number(id)]);
			}
			return {
				success: true,
				data: result,
				message: "Se actualizó el usuario"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo actualizar el usuario"
			}
		}

	}

	async deleteUser(id) {
		const queryString = `DELETE FROM ${process.env.USER_TABLE} WHERE id=?`;
		try {
			const result = await this.query(queryString, [Number(id)]);
			return {
				success: true,
				data: result,
				message: "Se eliminó el usuario"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo eliminar el usuario"
			}
		}
	}

	/**
	 * @description: Compara el password ingresado con el password guardado en tabla.
	 * Soporta hashes bcrypt (nuevos) y cifrados AES legacy (migración transparente).
	 * @param {string} passIn: Password ingresado 
	 * @param {string} passSaved: Password guardado en tabla
	 * @returns {Promise<{ok: boolean, rehash: boolean}>} ok: credencial válida; rehash: hay que migrar a bcrypt
	 */
	comparePassword = async (passIn, passSaved) => {
		try {
			if (isBcryptHash(passSaved)) {
				const ok = await bcrypt.compare(passIn || '', passSaved);
				return { ok, rehash: false };
			}
			// Hash legacy AES: comparar en claro y marcar para rehasheo
			const passwordDecrypted = crypto.AES.decrypt(passSaved, process.env.CRYPTO_SECRET_KEY).toString(crypto.enc.Utf8);
			const ok = passIn == passwordDecrypted;
			return { ok, rehash: ok };
		} catch (error) {
			console.error(error);
			return { ok: false, rehash: false };
		}
	}

	/**
	 * @description: Migra el password de un usuario a bcrypt (rehash-on-login).
	 */
	rehashPassword = async (id, password) => {
		try {
			const passwordHash = await bcrypt.hash(password || '', BCRYPT_ROUNDS);
			await this.query(`UPDATE ${process.env.USER_TABLE} SET password=? WHERE id=?`, [passwordHash, Number(id)]);
			return { success: true };
		} catch (error) {
			console.error(error);
			return { success: false };
		}
	}

	getDocumentsByTitle = async (title) => {
		const queryString = `SELECT * FROM ${process.env.DOCUMENTS_TABLE} WHERE category1=? OR category2=? OR category3=?`;
		try {
			const results = await this.query(queryString, [title, title, title]);
			return { success: true, data: results }
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo recuperar los datos, recargue la página" }
		}
	}

	saveDocument = async (data) => {
		try {
			const date = moment().format('DD/MM/YYYY');
			const { title, author, description, category1, type, excelfile, pdffile, csvfile } = data;
			const queryString = `INSERT INTO ${process.env.DOCUMENTS_TABLE} 
                (title,author,description,category1,category2,category3,type,excelfile,pdffile,csvfile,fecha) 
                VALUES (?, ?, ?, ?, "0", "0", ?, ?, ?, ?, ?)`
			await this.query(queryString, [title, author, description, category1, type, excelfile, pdffile, csvfile, date]);
			return { success: true, message: "El documento ha sido guardado" }
		} catch (error) {
			console.error(error);
			return { success: false, message: "Al parecer algo salió mal, comuníquese con el administrador de la plataforma" }
		}
	}

	//MANEJO DE SESIONES
	//doc: https://www.cleverclouds.im/es/blog/2018/06/guardar-la-sesi%C3%B3n-en-mysql-para-el-framework-express-en-node

	sessionStore(session) {
		const MySQLStore = require('express-mysql-session')(session);
		// express-mysql-session puede recibir el pool directamente o crear su propio pool a partir de options.
		// Para evitar doble pool, le pasamos las mismas credenciales pero con createDatabaseTable habilitado.
		const options = {
			host: process.env.DATABASE_HOST,
			user: process.env.DATABASE_USER,
			password: process.env.DATABASE_PASSWORD,
			database: process.env.DATABASE_NAME,
			clearExpired: true,
			checkExpirationInterval: 900000,
			expiration: 86400000,
			createDatabaseTable: true,
			schema: {
				tableName: 'sessions'
			}
		};
		let sessionStoreVar = new MySQLStore(options);
		return sessionStoreVar;
	}

	async getlesionado() {
		const queryString = `SELECT lesionado FROM parametro where id=1`;
		try {
			const results = await this.query(queryString);
			return { success: true, data: results[0].lesionado }
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo recuperar los datos, recargue la página" }
		}
	}

	async getAccidentado() {
		const queryString = `SELECT accidente FROM parametro`;
		try {
			const results = await this.query(queryString);
			return {
				success: true,
				data: results[0].accidente
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo recuperar los datos, recargue la página"
			}
		}
	}


	async getFallecido() {
		const queryString = `SELECT fallecido FROM parametro`;
		try {
			const results = await this.query(queryString);
			return {
				success: true,
				data: results[0].fallecido
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo recuperar los datos, recargue la página"
			}
		}
	}

	async getCifras() {
		const queryString = `
			SELECT 
				lesionado, 
				accidente, 
				fallecido, 
				mensaje1,
				mensaje2,
				fuente_siniestro,
				porcentaje_siniestro,
				fuente_lesiones,
				porcentaje_lesiones,
				fuente_muertes,
				porcentaje_muertes
			FROM parametro
		`;
		try {
			const results = await this.query(queryString);
			return {
				success: true,
				data: {
					lesionados: results[0].lesionado,
					accidentados: results[0].accidente,
					fallecidos: results[0].fallecido,
					mensaje1: results[0].mensaje1,
					mensaje2: results[0].mensaje2,
					fuente_siniestro: results[0].fuente_siniestro,
					porcentaje_siniestro: results[0].porcentaje_siniestro,
					fuente_lesiones: results[0].fuente_lesiones,
					porcentaje_lesiones: results[0].porcentaje_lesiones,
					fuente_muertes: results[0].fuente_muertes,
					porcentaje_muertes: results[0].porcentaje_muertes,
				}
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo actualizar las cifras"
			}
		}
	}

	async updateCifras({
		lesionados,
		accidentados,
		fallecidos,
		mensaje1,
		mensaje2,
		fuente_siniestro,
		porcentaje_siniestro,
		fuente_lesiones,
		porcentaje_lesiones,
		fuente_muertes,
		porcentaje_muertes
	}) {
		const queryString = `
			UPDATE parametro 
				SET 
					lesionado=?, 
					accidente=?, 
					fallecido=?,
					mensaje1=?,
					mensaje2=?,
					fuente_siniestro=?,
					porcentaje_siniestro=?,
					fuente_lesiones=?,
					porcentaje_lesiones=?,
					fuente_muertes=?,
					porcentaje_muertes=?
    `;
		const params = [Number(lesionados), Number(accidentados), Number(fallecidos), mensaje1, mensaje2, fuente_siniestro, porcentaje_siniestro, fuente_lesiones, porcentaje_lesiones, fuente_muertes, porcentaje_muertes];
		try {
			const result = await this.query(queryString, params);
			return {
				success: true,
				data: result,
				message: "Se actualizaron las cifras"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo actualizar las cifras"
			}
		}
	}

	async getFooterData() {
		const queryString = `
			SELECT 
				telefono, 
				email, 
				direccion,
				descripcion,
				horario
			FROM footer
			ORDER BY (seccion IS NOT NULL AND seccion <> '') ASC
			LIMIT 1
		`;
		try {
			const results = await this.query(queryString);
			const sectionResults = await this.query(`
				SELECT seccion, enlace
				FROM footer
				WHERE seccion IS NOT NULL AND seccion <> ''
				ORDER BY seccion ASC
			`);
			return {
				success: true,
				data: {
					telefono: results[0]?.telefono || '',
					email: results[0]?.email || '',
					direccion: results[0]?.direccion || '',
					descripcion: results[0]?.descripcion || '',
					horario: results[0]?.horario || '',
					secciones: sectionResults.map(row => ({ titulo: row.seccion, enlace: row.enlace }))
				}
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo recuperar los datos, recargue la página"
			}
		}
	}
	async updateFooterData({
		telefono,
		email,
		direccion,
		descripcion,
		horario,
		secciones
	}) {
		try {
			const result = await this.query(`
				UPDATE footer
				SET telefono=?, email=?, direccion=?, descripcion=?, horario=?
				WHERE seccion IS NULL OR seccion = ''
				LIMIT 1
			`, [telefono, email, direccion, descripcion, horario]);
			await this.query(`DELETE FROM footer WHERE seccion IS NOT NULL AND seccion <> ''`);
			for (const section of (Array.isArray(secciones) ? secciones : [])) {
				if (!section.titulo?.trim() || !section.enlace?.trim()) continue;
				await this.query(
					`INSERT INTO footer (seccion, enlace) VALUES (?, ?)`,
					[section.titulo.trim(), section.enlace.trim()]
				);
			}
			return {
				success: true,
				data: result,
				message: "Se actualizaron los datos"

			}

		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo actualizar los datos"
			}

		}

	}
	async getContenidoQuienesSomos(secondary_navigation) {
		const idioma = secondary_navigation ? 'EN' : 'ES';
		const queryString = `SELECT seccion1, seccion2, seccion3, seccion4, seccion5, seccion6, seccion7, seccion8, seccion9, seccion10, seccion11, seccion12, seccion13, seccion14, seccion15, seccion16, seccion17, seccion18, seccion19, seccion20, seccion21, seccion22, seccion23, seccion24, seccion25, seccion26, seccion27, seccion28, seccion29, seccion30, seccion31, seccion32, seccion33, seccion34, seccion35, seccion36, seccion37, seccion38, seccion39, seccion40, seccion41, seccion42, seccion43, seccion44 FROM pagina WHERE idioma LIKE ?`;
		try {
			const results = await this.query(queryString, [idioma]);
			const r = results[0];
			return {
				success: true,
				data: [
					{ label: '¿Quiénes somos?',              contenido: r.seccion1 },
					{ label: 'Misión',                       contenido: r.seccion2 },
					{ label: 'Visión',                       contenido: r.seccion3 },
					{ label: 'Componentes tecnológicos',     contenido: r.seccion4 },
					{ label: 'Valores',                      contenido: r.seccion5 },
					{ label: 'Comp1 título',                 contenido: r.seccion6  },
					{ label: 'Comp1 desc',                   contenido: r.seccion7  },
					{ label: 'Comp2 título',                 contenido: r.seccion8  },
					{ label: 'Comp2 desc',                   contenido: r.seccion9  },
					{ label: 'Comp3 título',                 contenido: r.seccion10 },
					{ label: 'Comp3 desc',                   contenido: r.seccion11 },
					{ label: 'Comp4 título',                 contenido: r.seccion12 },
					{ label: 'Comp4 desc',                   contenido: r.seccion13 },
					{ label: 'Val1 título',                  contenido: r.seccion14 },
					{ label: 'Val1 desc',                    contenido: r.seccion15 },
					{ label: 'Val2 título',                  contenido: r.seccion16 },
					{ label: 'Val2 desc',                    contenido: r.seccion17 },
					{ label: 'Val3 título',                  contenido: r.seccion18 },
					{ label: 'Val3 desc',                    contenido: r.seccion19 },
					{ label: 'Val4 título',                  contenido: r.seccion20 },
					{ label: 'Val4 desc',                    contenido: r.seccion21 },
					{ label: 'Val5 título',                  contenido: r.seccion22 },
					{ label: 'Val5 desc',                    contenido: r.seccion23 },
					{ label: 'Val6 título',                  contenido: r.seccion24 },
					{ label: 'Val6 desc',                    contenido: r.seccion25 },
					{ label: 'Comp5 título',                 contenido: r.seccion26 },
					{ label: 'Comp5 desc',                   contenido: r.seccion27 },
					{ label: 'Comp6 título',                 contenido: r.seccion28 },
					{ label: 'Comp6 desc',                   contenido: r.seccion29 },
					{ label: 'Comp7 título',                 contenido: r.seccion30 },
					{ label: 'Comp7 desc',                   contenido: r.seccion31 },
					{ label: 'Comp8 título',                 contenido: r.seccion32 },
					{ label: 'Comp8 desc',                   contenido: r.seccion33 },
					{ label: 'Comp9 título',                 contenido: r.seccion34 },
					{ label: 'Comp9 desc',                   contenido: r.seccion35 },
					{ label: 'Comp1 link',                   contenido: r.seccion36 },
					{ label: 'Comp2 link',                   contenido: r.seccion37 },
					{ label: 'Comp3 link',                   contenido: r.seccion38 },
					{ label: 'Comp4 link',                   contenido: r.seccion39 },
					{ label: 'Comp5 link',                   contenido: r.seccion40 },
					{ label: 'Comp6 link',                   contenido: r.seccion41 },
					{ label: 'Comp7 link',                   contenido: r.seccion42 },
					{ label: 'Comp8 link',                   contenido: r.seccion43 },
					{ label: 'Comp9 link',                   contenido: r.seccion44 },
				]
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo recuperar los datos, recargue la página"
			}
		}
	}

	async updateMisionVision(secondary_navigation, data) {
		const idioma = secondary_navigation ? 'EN' : 'ES';
		const {
			descripcion, mision, vision,
			comp_titulo, val_intro,
			val1_titulo, val1_desc, val2_titulo, val2_desc,
			val3_titulo, val3_desc, val4_titulo, val4_desc,
			val5_titulo, val5_desc, val6_titulo, val6_desc
		} = data;
		const queryString = `
            UPDATE pagina
                SET
                    seccion1=?,
                    seccion2=?,
                    seccion3=?,
                    seccion4=?,
                    seccion5=?,
                    seccion14=?,
                    seccion15=?,
                    seccion16=?,
                    seccion17=?,
                    seccion18=?,
                    seccion19=?,
                    seccion20=?,
                    seccion21=?,
                    seccion22=?,
                    seccion23=?,
                    seccion24=?,
                    seccion25=?
            WHERE idioma LIKE ?`;
		const params = [descripcion, mision, vision, comp_titulo, val_intro,
			val1_titulo, val1_desc, val2_titulo, val2_desc,
			val3_titulo, val3_desc, val4_titulo, val4_desc,
			val5_titulo, val5_desc, val6_titulo, val6_desc, idioma];
		try {
			const result = await this.query(queryString, params);
			return {
				success: true,
				data: result,
				message: `Se actualizaron la misión y visión - ${idioma}`
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: `No se pudo actualizar la misión y visión - ${idioma}`
			}
		}
	}

	async getMenuItems() {

		const queryString = `SELECT
            menu.descripcion as menu,
            menu.id idmenu,
            submenu.descripcion as submenu,
            submenu.id as idsubmenu, 
            submenu.rutabi as rutabi,
            submenu.linkvideo as linkvideo,
            submenu.linkpdf as linkpdf
            FROM
            menu
            INNER JOIN submenu ON submenu.menu_id = menu.id`;
		try {
			const results = await this.query(queryString);
			return {
				success: true,
				data: results
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo recuperar los datos, recargue la página"
			}
		}
	}

	async getMenu() {
		const queryString = `
			SELECT
				m.id,
				m.descripcion,
				m.urlImagen,
				m.observacion,
				m.estaActivo
			FROM menu m
		`;
		try {
			const results = await this.query(queryString);
			return {
				success: true,
				data: results.map(data => ({
					...data,
					estaActivo: data.estaActivo === 1
				}))
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo recuperar los datos, recargue la página"
			}
		}
	}

	async getMenuActivos() {
		const queryString = `
			SELECT
				m.id,
				m.descripcion,
				m.urlImagen,
				m.observacion,
				m.estaActivo
			FROM menu m
			WHERE m.estaActivo
		`;
		try {
			const results = await this.query(queryString);
			return {
				success: true,
				data: results.map(data => ({
					...data,
					estaActivo: data.estaActivo === 1
				}))
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo recuperar los datos, recargue la página"
			}
		}
	}

	async createMenu({
		descripcion,
		urlImagen,
		observacion,
		estaActivo
	}) {
		const queryString = `
			INSERT INTO menu (
				descripcion,
				urlImagen,
				observacion,
				estaActivo,
				create_time,
				update_time
			)
			VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
		`;
		const values = [
			descripcion,
			urlImagen?.trim() === '' ? null : urlImagen?.trim(),
			observacion ? observacion.trim() : null,
			estaActivo ? 1 : 0
		];
		try {
			const result = await this.query(queryString, values);
			return {
				success: true,
				data: result,
				message: "Se creó el menu"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo crear el menu"
			}
		}
	}

	async updateMenu({
		id,
		descripcion,
		urlImagen,
		observacion,
		estaActivo
	}) {
		const queryString = `
			UPDATE menu
				SET 
					descripcion=?,
					urlImagen=?,
					observacion=?,
					estaActivo=?,
					update_time=CURRENT_TIMESTAMP
				WHERE id=?`;
		const values = [
			descripcion,
			urlImagen?.trim() === '' ? null : urlImagen?.trim(),
			observacion ? observacion.trim() : null,
			estaActivo ? 1 : 0,
			Number(id)
		];
		try {
			const result = await this.query(queryString, values);
			return {
				success: true,
				data: result,
				message: "Se actualizó el menu"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo actualizar el menu"
			}
		}
	}

	async deleteMenu(id) {
		const queryString = `DELETE FROM menu WHERE id=?`;
		try {
			const result = await this.query(queryString, [Number(id)]);
			return {
				success: true,
				data: result,
				message: "Se eliminó el menu"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo eliminar el menu"
			}
		}
	}

	async getSubmenu() {
		const queryString = `
			SELECT
				s.id,
				s.descripcion submenu,
				s.menu_id,
				m.descripcion menu,
				m.urlImagen menuImagen,
				m.estaActivo menuEstaActivo,
				s.rutabi,
				s.linkvideo,
				s.linkpdf,
				s.imagen,
				s.observacion,
				s.estado
			FROM submenu s
			JOIN menu m ON m.id = s.menu_id;
		`;
		try {
			const results = await this.query(queryString);
			return {
				success: true,
				data: results.map(s => ({
					...s,
					menuEstaActivo: s.menuEstaActivo === 1,
					imagen: s.imagen || null,
					estado: s.estado === 1
				}))
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo recuperar los datos, recargue la página"
			}
		}
	}

	async getSubmenuActivos() {
		const queryString = `
			SELECT
				s.id,
				s.descripcion submenu,
				s.menu_id,
				m.descripcion menu,
				m.urlImagen menuImagen,
				m.estaActivo menuEstaActivo,
				s.rutabi,
				s.linkvideo,
				s.linkpdf,
				s.imagen,
				s.observacion,
				s.estado
			FROM submenu s
			JOIN menu m ON m.id = s.menu_id
			WHERE m.estaActivo AND s.estado;
		`;
		try {
			const results = await this.query(queryString);
			return {
				success: true,
				data: results.map(s => ({
					...s,
					menuEstaActivo: s.menuEstaActivo === 1,
					imagen: s.imagen || null,
					estado: s.estado === 1
				}))
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo recuperar los datos, recargue la página"
			}
		}
	}

	async createSubmenu({
		descripcion,
		menu_id,
		rutabi,
		linkvideo,
		linkpdf,
		imagenpath,
		estado
	}) {
		const queryString = `
			INSERT INTO
				submenu (
					descripcion, 
					create_time, 
					update_time, 
					menu_id, 
					rutabi, 
					linkvideo, 
					linkpdf, 
					imagen,
					estado
				) 
			VALUES (
				?, 
				CURRENT_TIMESTAMP, 
				CURRENT_TIMESTAMP, 
				?, 
				?, 
				?, 
				?,
				?,
				?
			)
		`;
		const values = [
			descripcion,
			Number(menu_id),
			rutabi,
			linkvideo,
			linkpdf,
			imagenpath,
			estado ? 1 : 0
		];
		try {
			const result = await this.query(queryString, values);
			return {
				success: true,
				data: result,
				message: "Se creó el submenu"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo crear el submenu"
			}
		}
	}

	async updateSubmenu({
		id,
		descripcion,
		menu_id,
		rutabi,
		linkvideo,
		linkpdf,
		imagenpath,
		estado
	}) {
		const queryString = `
			UPDATE submenu
				SET 
					descripcion=?,
					update_time=CURRENT_TIMESTAMP,
					menu_id=?, 
					rutabi=?, 
					linkvideo=?, 
					linkpdf=?,
					imagen=?,
					estado=?
				WHERE id=?`;
		const values = [
			descripcion,
			Number(menu_id),
			rutabi,
			linkvideo,
			linkpdf,
			imagenpath,
			estado ? 1 : 0,
			Number(id)
		];
		try {
			const result = await this.query(queryString, values);
			return {
				success: true,
				data: result,
				message: "Se actualizó el submenu"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo actualizar el submenu"
			}
		}
	}

	async deleteSubmenu(id) {
		const queryString = `DELETE FROM submenu WHERE id=?`;
		try {
			const result = await this.query(queryString, [Number(id)]);
			return {
				success: true,
				data: result,
				message: "Se eliminó el submenu"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo eliminar el submenu"
			}
		}
	}

	async getPopup() {
		const queryString = `
        SELECT
            id,
            posicion,
            imagen,
            estado,
            enlace,
            create_time, 
            update_time 
        FROM popup
        ORDER BY posicion ASC, id ASC`;
		try {
			const result = await this.query(queryString);
			const slides = (result || []).map(r => ({
				id: r.id,
				posicion: r.posicion,
				imagen: r.imagen || '',
				enlace: r.enlace || ''
			}));
			const estadoRes = await this.query(`SELECT COALESCE(MAX(estado), 0) AS estado FROM popup`);
			const estadoVal = estadoRes && estadoRes[0] ? estadoRes[0].estado : 0;
			const estado = estadoVal === 1 || estadoVal === '1';
			return {
				success: true,
				data: { estado, slides },
				message: "Obtener el popup"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo obtener el popup"
			}
		}
	}

	async updatePopup({ estado }) {
		const queryString = `
       		UPDATE popup 
          	SET 
              estado=?,
              update_time=CURRENT_TIMESTAMP`;
		try {
			const result = await this.query(queryString, [estado ? 1 : 0]);
			return {
				success: true,
				data: result[0],
				message: "Se actualizó el popup"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo actualizar el popup"
			}
		}
	}

	async getPopupSlides() {
		const queryString = `SELECT id, posicion, imagen, enlace FROM popup ORDER BY posicion ASC, id ASC`;
		try {
			const result = await this.query(queryString);
			return {
				success: true,
				data: (result || []).map(r => ({ id: r.id, posicion: r.posicion, imagen: r.imagen || '', enlace: r.enlace || '' })),
				message: "Obtener slides del popup"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudieron obtener los slides del popup"
			}
		}
	}

	async createPopupSlide({ imagen, enlace }) {
		const queryString = `
			INSERT INTO popup (posicion, imagen, enlace)
			VALUES ((SELECT COALESCE(MAX(posicion), 0) + 1 FROM (SELECT posicion FROM popup) p), ?, ?)
		`;
		try {
			const result = await this.query(queryString, [imagen || '', enlace || '']);
			return { success: true, data: { insertId: result.insertId }, message: "Se creó el slide del popup" };
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo crear el slide del popup" };
		}
	}

	async updatePopupSlide(id, { imagen, enlace }) {
		const queryString = `UPDATE popup SET imagen = ?, enlace = ?, update_time = CURRENT_TIMESTAMP WHERE id = ?`;
		try {
			await this.query(queryString, [imagen || '', enlace || '', id]);
			return { success: true, message: "Se actualizó el slide del popup" };
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo actualizar el slide del popup" };
		}
	}

	async deletePopupSlide(id) {
		const queryString = `DELETE FROM popup WHERE id = ?`;
		try {
			await this.query(queryString, [id]);
			return { success: true, message: "Se eliminó el slide del popup" };
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo eliminar el slide del popup" };
		}
	}

	async updatePopupOrder(items) {
		const queryString = `UPDATE popup SET posicion = ? WHERE id = ?`;
		try {
			for (const { id, posicion } of items) {
				await this.query(queryString, [posicion, id]);
			}
			return { success: true, message: "Se actualizó el orden del popup" };
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo actualizar el orden del popup" };
		}
	}

	// --- YouTube Videos (administrables desde el panel) ---
	async getYoutubeVideos(seccion) {
		const queryString = `
			SELECT id, seccion, titulo, descripcion, video_url, create_time, update_time
			FROM youtube_videos
			WHERE seccion = ?
			ORDER BY id ASC`;
		try {
			const result = await this.query(queryString, [seccion]);
			return {
				success: true,
				data: result,
				message: "Obtener videos de YouTube"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo obtener los videos de YouTube",
				data: []
			}
		}
	}

	async getYoutubeVideoById(id) {
		const queryString = `
			SELECT id, seccion, titulo, descripcion, video_url, create_time, update_time
			FROM youtube_videos
			WHERE id = ?`;
		try {
			const result = await this.query(queryString, [id]);
			return {
				success: true,
				data: result[0],
				message: "Obtener video de YouTube"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo obtener el video de YouTube"
			}
		}
	}

	async createYoutubeVideo({ seccion, titulo, descripcion, video_url }) {
		const queryString = `
			INSERT INTO youtube_videos (seccion, titulo, descripcion, video_url)
			VALUES (?, ?, ?, ?)`;
		try {
			const result = await this.query(queryString, [seccion, titulo, descripcion || '', video_url]);
			return {
				success: true,
				data: { insertId: result.insertId },
				message: "Se creó el video de YouTube"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo crear el video de YouTube"
			}
		}
	}

	async updateYoutubeVideo({ id, titulo, descripcion, video_url }) {
		const queryString = `
			UPDATE youtube_videos
			SET titulo = ?,
				descripcion = ?,
				video_url = ?,
				update_time = CURRENT_TIMESTAMP
			WHERE id = ?`;
		try {
			const result = await this.query(queryString, [titulo, descripcion || '', video_url, Number(id)]);
			return {
				success: true,
				data: result,
				message: "Se actualizó el video de YouTube"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo actualizar el video de YouTube"
			}
		}
	}

	async deleteYoutubeVideo(id) {
		const queryString = `DELETE FROM youtube_videos WHERE id = ?`;
		try {
			const result = await this.query(queryString, [Number(id)]);
			return {
				success: true,
				data: result,
				message: "Se eliminó el video de YouTube"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo eliminar el video de YouTube"
			}
		}
	}

	async getDatosAbiertosPages({ pageLength, conditions }) {
		let whereConditions = ''
		const params = []
		if (conditions) {
			const unionCondition = ' AND '
			let isFirstCondition = true
			if (conditions.id) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} f.id = ? `
				params.push(Number(conditions.id))
				isFirstCondition = false
			}
			if (conditions.idCategoria) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} f.idCategoria = ?`
				params.push(Number(conditions.idCategoria))
				isFirstCondition = false
			}
			if (conditions.idTipo) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} f.idTipo = ?`
				params.push(Number(conditions.idTipo))
				isFirstCondition = false
			}
			if (conditions.title) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} f.title LIKE ?`
				params.push(`%${conditions.title}%`)
				isFirstCondition = false
			}
			if (conditions.description) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} f.description LIKE ?`
				params.push(`%${conditions.description}%`)
				isFirstCondition = false
			}
		if (conditions.fecha) {
			whereConditions += `${isFirstCondition ? '' : unionCondition} f.fecha LIKE ?`
			params.push(`${conditions.fecha}%`)
			isFirstCondition = false
		}
		if (conditions.estaActivo !== undefined) {
			whereConditions += `${isFirstCondition ? '' : unionCondition} f.estaActivo = ?`
			params.push(conditions.estaActivo ? 1 : 0)
			isFirstCondition = false
		}
	}

	const queryString = `
		SELECT
			count(f.id) pages
			FROM files f
			LEFT JOIN categoria c ON c.id = f.idCategoria
			LEFT JOIN tipo t ON t.id = f.idTipo
			${whereConditions
				? `WHERE ${whereConditions}`
				: ''
			}
		`;

		const query = queryString.replace(/\s+/g, ' ')
		//console.log(query)
		try {
			const results = await this.query(query, params);
			return {
				success: true,
				dataLength: results[0].pages,
				data: Math.ceil(Number(results[0].pages) / pageLength)
			}
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo recuperar los datos, recargue la página" }
		}
	}

	async getDatosAbiertos({
		paginate,
		page,
		pageLength,
		conditions
	} = {
			page: 1,
			pageLength: 5
		}) {
		let whereConditions = ''
		const params = []
		if (conditions) {
			const unionCondition = ' AND '
			let isFirstCondition = true
			if (conditions.id) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} f.id = ? `
				params.push(Number(conditions.id))
				isFirstCondition = false
			}
			if (conditions.idCategoria) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} f.idCategoria = ?`
				params.push(Number(conditions.idCategoria))
				isFirstCondition = false
			}
			if (conditions.idTipo) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} f.idTipo = ?`
				params.push(Number(conditions.idTipo))
				isFirstCondition = false
			}
			if (conditions.title) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} f.title LIKE ?`
				params.push(`%${conditions.title}%`)
				isFirstCondition = false
			}
			if (conditions.description) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} f.description LIKE ?`
				params.push(`%${conditions.description}%`)
				isFirstCondition = false
			}
		if (conditions.fecha) {
			whereConditions += `${isFirstCondition ? '' : unionCondition} f.fecha LIKE ?`
			params.push(`${conditions.fecha}%`)
			isFirstCondition = false
		}
		if (conditions.estaActivo !== undefined) {
			whereConditions += `${isFirstCondition ? '' : unionCondition} f.estaActivo = ?`
			params.push(conditions.estaActivo ? 1 : 0)
			isFirstCondition = false
		}
	}

	let query = `
		SELECT
			f.id,
			f.title titulo,
			f.author autor,
			f.description descripcion,
			f.idCategoria,
			c.value categoria,
			c.icon iconCategoria,
			f.idTipo,
			t.value tipo,
		f.excelfile,
		f.pdffile,
		f.csvfile,
		f.shapefile,
		f.estaActivo,
		f.fecha
			FROM files f
			LEFT JOIN categoria c ON c.id = f.idCategoria
			LEFT JOIN tipo t ON t.id = f.idTipo
			${whereConditions
				? `WHERE ${whereConditions}`
				: ''
			}
			ORDER BY f.id DESC
		`

		page = page < 0 ? 1 : page
		const offsetData = (page - 1) * pageLength

		if (paginate) {
			query += `LIMIT ? OFFSET ?`
			params.push(Number(pageLength), Number(offsetData))
		}

		query = query.replace(/\s+/g, ' ').trim()

		try {
			const results = await this.query(query, params);
			return {
				success: true,
				data: results.map(res => ({
					...res,
					esta_activo: res.estaActivo === 1,
					categoria: res.categoria ?? 'No existe',
					tipo: res.tipo ?? 'No existe',
					excelfile: res.excelfile === 'null' ? 'No existe' : res.excelfile,
					hasExcel: res.excelfile === 'null' ? false : true,
					pdffile: res.pdffile === 'null' ? 'No existe' : res.pdffile,
					hasPdf: res.pdffile === 'null' ? false : true,
				csvfile: res.csvfile === 'null' ? 'No existe' : res.csvfile,
				hasCsv: res.csvfile === 'null' ? false : true,
				shapefile: res.shapefile === 'null' ? 'No existe' : res.shapefile,
				hasShapefile: res.shapefile === 'null' ? false : true,
					fecha: res.fecha.split('/').reverse().join('-')
				}))
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo recuperar los datos, recargue la página"
			}
		}
	}

	async createDatosAbiertos({
		titulo,
		autor,
		descripcion,
		idCategoria,
		idTipo,
		excelfilepath,
		pdffilepath,
		csvfilepath,
		shapefilepath,
		estaActivo,
		fecha
	}) {
		const queryString = `
			INSERT INTO
				files (
					title,
					author,
					description,
					idCategoria,
					idTipo,
					excelfile,
					pdffile,
					csvfile,
					shapefile,
					estaActivo,
					fecha
				)
			VALUES (
				?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
			)
		`;
		const params = [
			titulo,
			autor,
			descripcion,
			Number(idCategoria),
			Number(idTipo),
			excelfilepath,
			pdffilepath,
			csvfilepath,
			shapefilepath,
			estaActivo ? 1 : 0,
			fecha
		];
		try {
			const result = await this.query(queryString, params);
			return {
				success: true,
				data: result,
				message: "Se crearon los datos"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo crear el submenu"
			}
		}
	}

	async updateDatosAbiertos({
		id,
		titulo,
		autor,
		descripcion,
		idCategoria,
		idTipo,
		excelfilepath,
		pdffilepath,
		csvfilepath,
		shapefilepath,
		estaActivo,
		fecha
	}) {
		const queryString = `
			UPDATE files 
				SET
					title=?,
					author=?,
					description=?,
					idCategoria=?,
					idTipo=?,
					excelfile=?,
					pdffile=?,
					csvfile=?,
					shapefile=?,
					estaActivo=?,
					fecha=?
				WHERE id=?
		`;
		const params = [
			titulo,
			autor,
			descripcion,
			Number(idCategoria),
			Number(idTipo),
			excelfilepath,
			pdffilepath,
			csvfilepath,
			shapefilepath,
			estaActivo ? 1 : 0,
			fecha,
			Number(id)
		];
		try {
			const result = await this.query(queryString, params);
			return {
				success: true,
				data: result,
				message: "Se actualizaron los datos"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudieron actualizar los datos"
			}
		}
	}

	async deleteDatosAbiertos(id) {
		const queryString = `DELETE FROM files WHERE id=?`;
		try {
			const result = await this.query(queryString, [Number(id)]);
			return {
				success: true,
				data: result,
				message: "Se eliminó los datos"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudieron eliminar los datos"
			}
		}
	}

	async getCategorias() {
		const queryString = `
			SELECT
				c.id,
				c.value,
				c.icon,
				c.estaActivo
			FROM categoria c;
		`;
		try {
			const results = await this.query(queryString);
			return {
				success: true,
				data: results.map(categoria => ({
					...categoria,
					estaActivo: categoria.estaActivo === 1
				}))
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo recuperar los datos, recargue la página"
			}
		}
	}

	async getCategoriasActivas() {
		const queryString = `
			SELECT
				c.id,
				c.value,
				c.icon,
				c.estaActivo
			FROM categoria c
			WHERE c.estaActivo = true;
		`;
		try {
			const results = await this.query(queryString);
			return {
				success: true,
				data: results.map(categoria => ({
					...categoria,
					estaActivo: categoria.estaActivo === 1
				}))
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo recuperar los datos, recargue la página"
			}
		}
	}

	async createCategoria({
		value,
		icon,
		estaActivo
	}) {
		const queryString = `
			INSERT INTO categoria ( value, icon, estaActivo )
			VALUES ( ?, ?, ? )
		`;
		try {
			const result = await this.query(queryString, [value, icon, estaActivo ? 1 : 0]);
			return {
				success: true,
				data: result,
				message: "Se creó la categoría"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo crear la categoría"
			}
		}
	}

	async updateCategoria({
		id,
		value,
		icon,
		estaActivo
	}) {
		const queryString = `
			UPDATE categoria 
				SET
					value=?,
					icon=?,
					estaActivo=?
				WHERE id=?
		`;
		try {
			const result = await this.query(queryString, [value, icon, estaActivo ? 1 : 0, Number(id)]);
			return {
				success: true,
				data: result,
				message: "Se actualizó la categoría"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo actualizar la categoría"
			}
		}
	}

	async deleteCategoria(id) {
		const queryString = `DELETE FROM categoria WHERE id=?`;
		try {
			const result = await this.query(queryString, [Number(id)]);
			return {
				success: true,
				data: result,
				message: "Se eliminó la categoría"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo eliminar la categoría"
			}
		}
	}

	async getRegion(name) {
		const slug = (name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
		let query = `
			SELECT
				r.id,
				r.value,
				r.slug,
				r.nombreEncargado,
				r.celularEncargado,
				r.correoEncargado,
				r.imageUrl,
				r.pageLink
			FROM regiones r
			WHERE r.value LIKE ? OR r.slug = ?
			ORDER BY r.slug ASC
			LIMIT 1
		`

		query = query.replace(/\s+/g, ' ').trim()

		try {
			const results = await this.query(query, [name, slug]);
			return {
				success: true,
				data: results[0]
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo recuperar los datos, recargue la página"
			}
		}
	}

	async getRegionesMeta({ pageSize, conditions }) {
		let whereConditions = ''
		const params = []
		if (conditions) {
			const unionCondition = ' AND '
			let isFirstCondition = true
			if (conditions.id) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} r.id = ?`
				params.push(Number(conditions.id))
				isFirstCondition = false
			}
		}

		const queryString = `
			SELECT
				count(r.id) amount
			FROM regiones r
			${whereConditions
				? `WHERE ${whereConditions}`
				: ''
			}
		`;

		const query = queryString.replace(/\s+/g, ' ')

		try {
			const results = await this.query(query, params);
			return {
				success: true,
				amount: results[0].amount,
				pages: Math.ceil(Number(results[0].amount) / pageSize)
			}
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo recuperar los datos, recargue la página" }
		}
	}

	async getRegiones({
		paginate,
		page,
		pageSize,
		conditions
	} = {
			page: 1,
			pageSize: 5
		}) {
		let whereConditions = ''
		const params = []
		if (conditions) {
			const unionCondition = ' AND '
			let isFirstCondition = true
			if (conditions.id) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} r.id = ?`
				params.push(Number(conditions.id))
				isFirstCondition = false
			}
		}

		let query = `
			SELECT
				r.id,
				r.value,
				r.slug,
				r.nombreEncargado,
				r.celularEncargado,
				r.correoEncargado,
				r.imageUrl,
				r.pageLink
			FROM regiones r
			${whereConditions
				? `WHERE ${whereConditions}`
				: ''
			}
			ORDER BY r.slug ASC
		`

		page = page < 0 ? 1 : page
		const offsetData = (page - 1) * pageSize

		if (paginate) {
			query += `LIMIT ? OFFSET ?`
			params.push(Number(pageSize), Number(offsetData))
		}

		query = query.replace(/\s+/g, ' ').trim()

		try {
			const results = await this.query(query, params);
			return {
				success: true,
				data: results
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo recuperar los datos, recargue la página"
			}
		}
	}

	async updateRegiones({
		id,
		nombreEncargado,
		celularEncargado,
		correoEncargado,
		imageUrl,
		pageLink
	}) {
		const queryString = `
			UPDATE regiones 
				SET
					nombreEncargado=?,
					celularEncargado=?,
					correoEncargado=?,
					imageUrl=?,
					pageLink=?
				WHERE id=?`;
		try {
			const result = await this.query(queryString, [
				nombreEncargado ? String(nombreEncargado) : null,
				celularEncargado ? String(celularEncargado) : null,
				correoEncargado ? String(correoEncargado) : null,
				imageUrl ? String(imageUrl) : null,
				pageLink ? String(pageLink) : null,
				Number(id)
			]);
			return {
				success: true,
				data: result,
				message: "Se actualizó la región"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo actualizar la región"
			}
		}
	}

	async getTipos() {
		const queryString = `
			SELECT
				t.id,
				t.value,
				t.estaActivo
			FROM tipo t;
		`;
		try {
			const results = await this.query(queryString);
			return {
				success: true,
				data: results.map(tipo => ({
					...tipo,
					estaActivo: tipo.estaActivo === 1
				}))
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo recuperar los datos, recargue la página"
			}
		}
	}

	async getTiposActivos() {
		const queryString = `
			SELECT
				t.id,
				t.value,
				t.estaActivo
			FROM tipo t
			WHERE t.estaActivo = true;
		`;
		try {
			const results = await this.query(queryString);
			return {
				success: true,
				data: results.map(tipo => ({
					...tipo,
					estaActivo: tipo.estaActivo === 1
				}))
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo recuperar los datos, recargue la página"
			}
		}
	}

	async createTipo({
		value,
		estaActivo
	}) {
		const queryString = `
			INSERT INTO tipo ( value, estaActivo )
			VALUES ( ?, ? )
		`;
		try {
			const result = await this.query(queryString, [value, estaActivo ? 1 : 0]);
			return {
				success: true,
				data: result,
				message: "Se creó el tipo"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo crear el tipo"
			}
		}
	}

async updateTipo({
		id,
		value,
		estaActivo
	}) {
		const queryString = `
			UPDATE tipo 
				SET
					value = ?,
					estaActivo = ?
				WHERE id=?`;
		try {
			const result = await this.query(queryString, [value, estaActivo ? 1 : 0, Number(id)]);
			return {
				success: true,
				data: result,
				message: "Se actualizó el tipo"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo actualizar el tipo"
			}
		}
	}

	async deleteTipo(id) {
		const queryString = `DELETE FROM tipo WHERE id=?`;
		try {
			const result = await this.query(queryString, [Number(id)]);
			return {
				success: true,
				data: result,
				message: "Se eliminó el tipo"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo eliminar el tipo"
			}
		}
	}

	async getComunication(id) {
		const queryString = `
			SELECT 
				e.id,
				e.idTipoEvento,
				te.value 'tipoEvento',
				e.title,
				e.organizedBy,
				e.place,
				e.shortdescription,
				e.description,
				e.startTime,
				e.endTime,
				e.price,
				e.imageUrl,
				e.reunionLink,
				e.facebookLink,
				e.youtubeLink,
				e.twitterLink,
				e.anotherLink,
				e.isActive
			FROM evento e
			LEFT JOIN tipo_evento te ON te.id = e.idTipoEvento
			WHERE e.id = ?;
		`;
		try {
			const results = await this.query(queryString, [Number(id)]);
			return {
				success: true,
				data: results.map(evento => ({
					...evento,
					hasSocialLinks: evento.facebookLink || evento.youtubeLink || evento.twitterLink,
					fullYoutubeLink: evento.youtubeLink ? evento.youtubeLink.replace('embed/', 'watch?v=') : null,
					reunionIsInGoogleMeet: evento.reunionLink?.includes("google"),
					reunionIsInZoom: evento.reunionLink?.includes("zoom"),
					startDateString: moment(evento.startTime).format("DD/MM/YYYY"),
					startTimeString: moment(evento.startTime).format("HH:mm"),
					endDateString: evento.endTime ? moment(evento.endTime).format("DD/MM/YYYY") : null,
					endTimeString: evento.endTime ? moment(evento.endTime).format("HH:mm") : null,
					isActive: evento.isActive === 1
				}))
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo recuperar los datos, recargue la página"
			}
		}
	}

	async getComunicationsMeta({ pageSize, conditions }) {
		let whereConditions = ''
		const params = []
		if (conditions) {
			const unionCondition = ' AND '
			let isFirstCondition = true
			if (conditions.idTipoEvento) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} e.idTipoEvento = ?`
				params.push(Number(conditions.idTipoEvento))
				isFirstCondition = false
			}
			if (conditions.title) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} e.title LIKE ?`
				params.push(`%${conditions.title}%`)
				isFirstCondition = false
			}
			if (conditions.startDate) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} DATE(e.startTime) >= ?`
				params.push(conditions.startDate)
				isFirstCondition = false
			}
			if (conditions.endDate) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} DATE(e.endTime) <= ?`
				params.push(conditions.endDate)
				isFirstCondition = false
			}
			if (conditions.nearest) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} e.startTime >= CURDATE()`
				isFirstCondition = false
			}
			if (conditions.isActive) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} e.isActive`
				isFirstCondition = false
			}
		}

		const queryString = `
			SELECT
				count(e.id) amount
			FROM evento e
			${whereConditions
				? `WHERE ${whereConditions}`
				: ''
			}
		`;

		const query = queryString.replace(/\s+/g, ' ')

		try {
			const results = await this.query(query, params);
			return {
				success: true,
				amount: results[0].amount,
				pages: Math.ceil(Number(results[0].amount) / pageSize)
			}
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo recuperar los datos, recargue la página" }
		}
	}

	async getComunications({
		paginate,
		page,
		pageSize,
		conditions
	} = {
			page: 1,
			pageSize: 5
		}) {
		let whereConditions = ''
		const params = []
		if (conditions) {
			const unionCondition = ' AND '
			let isFirstCondition = true
			if (conditions.idTipoEvento) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} e.idTipoEvento = ?`
				params.push(Number(conditions.idTipoEvento))
				isFirstCondition = false
			}
			if (conditions.title) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} e.title LIKE ?`
				params.push(`%${conditions.title}%`)
				isFirstCondition = false
			}
			if (conditions.startDate) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} DATE(e.startTime) >= ?`
				params.push(conditions.startDate)
				isFirstCondition = false
			}
			if (conditions.endDate) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} DATE(e.endTime) <= ?`
				params.push(conditions.endDate)
				isFirstCondition = false
			}
			if (conditions.nearest) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} e.startTime >= CURDATE()`
				isFirstCondition = false
			}
			if (conditions.isActive) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} e.isActive`
				isFirstCondition = false
			}
		}

		let query = `
			SELECT 
				e.id,
				e.idTipoEvento,
				te.value 'tipoEvento',
				e.title,
				e.organizedBy,
				e.place,
				e.shortDescription,
				e.description,
				e.startTime,
				e.endTime,
				e.price,
				e.imageUrl,
				e.direccion,
				e.reunionLink,
				e.facebookLink,
				e.youtubeLink,
				e.twitterLink,
				e.anotherLink,
				e.isActive
			FROM evento e
			LEFT JOIN tipo_evento te ON te.id = e.idTipoEvento
			${whereConditions
				? `WHERE ${whereConditions}`
				: ''
			}
			ORDER BY e.id DESC
		`

		page = page < 0 ? 1 : page
		const offsetData = (page - 1) * pageSize

		if (paginate) {
			query += `LIMIT ? OFFSET ?`
			params.push(Number(pageSize), Number(offsetData))
		}

		query = query.replace(/\s+/g, ' ').trim()

		try {
			const results = await this.query(query, params);
			return {
				success: true,
				data: results.map(evento => ({
					...evento,
					reunionIsInGoogleMeet: evento.reunionLink?.includes("google"),
					reunionIsInZoom: evento.reunionLink?.includes("zoom"),
					startTimeString: moment(evento.startTime).format("DD/MM/YYYY HH:mm"),
					startDayISO: moment(evento.startTime).format("YYYY-MM-DD"),
					startTimeISO: moment(evento.startTime).format("HH:mm:ss"),

				endTimeString: evento.endTime ? moment(evento.endTime).format("DD/MM/YYYY HH:mm") : ' - ',
					endDayISO: evento.endTime ? moment(evento.endTime).format("YYYY-MM-DD") : null,
					endTimeISO: evento.endTime ? moment(evento.endTime).format("HH:mm:ss") : null,
					isActive: evento.isActive === 1
				}))
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo recuperar los datos, recargue la página"
			}
		}
	}

	async createComunication({
		title,
		idTipoEvento,
		organizedBy,
		place,
		shortDescription,
		description,
		startDay,
		startTime,
		endDay,
		endTime,
		price,
		imageUrl,
		direccion,
		reunionLink,
		facebookLink,
		youtubeLink,
		twitterLink,
		anotherLink,
		isActive
	}) {
		const queryString = `
			INSERT INTO evento (
				title,
				idTipoEvento,
				organizedBy,
				place,
				shortDescription,
				description,
				startTime,
				endTime,
				price,
				imageUrl,
				direccion,
				reunionLink,
				facebookLink,
				youtubeLink,
				twitterLink,
				anotherLink,
				isActive
			)
			VALUES ( 
				?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
			)
		`;
		const startTimeValue = startDay ? `${startDay} ${startTime ?? ''}`.trim() : null;
		const endTimeValue = endDay ? `${endDay}${endTime ? ` ${endTime}` : ''}` : null;
		const params = [
			title,
			Number(idTipoEvento),
			organizedBy,
			place || null,
			shortDescription || null,
			description || null,
			startTimeValue,
			endTimeValue,
			price || null,
			imageUrl || null,
			direccion || null,
			reunionLink || null,
			facebookLink || null,
			youtubeLink || null,
			twitterLink || null,
			anotherLink || null,
			isActive ? 1 : 0
		];
		try {
			const result = await this.query(queryString, params);
			return {
				success: true,
				data: result,
				message: "Se creó el evento"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo crear el evento"
			}
		}
	}

	async updateComunication({
		id,
		idTipoEvento,
		title,
		organizedBy,
		place,
		shortDescription,
		description,
		startDay,
		startTime,
		endDay,
		endTime,
		price,
		imageUrl,
		direccion,
		reunionLink,
		facebookLink,
		youtubeLink,
		twitterLink,
		anotherLink,
		isActive
	}) {
		const queryString = `
			UPDATE evento 
				SET
					title = ?,
					idTipoEvento = ?,
					organizedBy = ?,
					place = ?,
					shortDescription = ?,
					description = ?,
					startTime = ?,
					endTime = ?,
					price = ?,
					imageUrl = ?,
					direccion = ?,
					reunionLink = ?,
					facebookLink = ?,
					youtubeLink = ?,
					twitterLink = ?,
					anotherLink = ?,
					isActive = ?
				WHERE id=?
		`;
		const startTimeValue = startDay ? `${startDay} ${startTime ?? ''}`.trim() : null;
		const endTimeValue = (endDay && endDay !== 'Invalid date') ? `${endDay}${endTime ? ` ${endTime}` : ''}` : null;
		const params = [
			title,
			Number(idTipoEvento),
			organizedBy,
			place || null,
			shortDescription || null,
			description || null,
			startTimeValue,
			endTimeValue,
			price || null,
			imageUrl || null,
			direccion || null,
			reunionLink || null,
			facebookLink || null,
			youtubeLink || null,
			twitterLink || null,
			anotherLink || null,
			isActive ? 1 : 0,
			Number(id)
		];
		try {
			const result = await this.query(queryString, params);
			return {
				success: true,
				data: result,
				message: "Se actualizó el evento"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo actualizar el evento"
			}
		}
	}

	async deleteComunication(id) {
		const queryString = `DELETE FROM evento WHERE id=?`;
		try {
			const result = await this.query(queryString, [Number(id)]);
			return {
				success: true,
				data: result,
				message: "Se eliminó el evento"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo eliminar el evento"
			}
		}
	}

	async getTiposEvento() {
		const queryString = `
			SELECT
				te.id,
				te.value,
				te.isActive
			FROM tipo_evento te
		`;
		try {
			const results = await this.query(queryString);
			return {
				success: true,
				data: results.map(te => ({
					...te,
					isActive: te.isActive === 1
				}))
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo recuperar los datos, recargue la página"
			}
		}
	}

	async getTiposEventoActivos() {
		const queryString = `
			SELECT
				te.id,
				te.value,
				te.isActive
			FROM tipo_evento te
			WHERE te.isActive
		`;
		try {
			const results = await this.query(queryString);
			return {
				success: true,
				data: results.map(te => ({
					...te,
					isActive: te.isActive === 1
				}))
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo recuperar los datos, recargue la página"
			}
		}
	}

	async createTipoEvento({
		value,
		isActive
	}) {
		const queryString = `
			INSERT INTO
				tipo_evento (
					value,
					isActive
				) 
			VALUES (
				?,
				?
			)
		`;
		try {
			const result = await this.query(queryString, [value, isActive ? 1 : 0]);
			return {
				success: true,
				data: result,
				message: "Se creó el tipo de evento"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo crear el tipo de evento"
			}
		}
	}

	async updateTipoEvento({
		id,
		value,
		isActive
	}) {
		const queryString = `
			UPDATE tipo_evento
				SET
					value = ?,
					isActive = ?
				WHERE id=?`;
		try {
			const result = await this.query(queryString, [value, isActive ? 1 : 0, Number(id)]);
			return {
				success: true,
				data: result,
				message: "Se actualizó el tipo de evento"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo actualizar el tipo de evento"
			}
		}
	}

	async deleteTipoEvento(id) {
		const queryString = `DELETE FROM tipo_evento WHERE id=?`;
		try {
			const result = await this.query(queryString, [Number(id)]);
			return {
				success: true,
				data: result,
				message: "Se eliminó el tipo de evento"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo eliminar el tipo de evento"
			}
		}
	}

	/**
	 * 
	 * @param {{
	 * 	conditions: {
	 * 		id?: number,
	 * 		idAutor?: number,
	 * 		idRegion?: number
	 *  }
	 * }} data
	 * @returns 
	 */
	async getPlanesRegionales({
		conditions
	}) {
		let whereConditions = ''
		const params = []
		if (conditions) {
			const unionCondition = ' AND '
			let isFirstCondition = true
			if (conditions.id) {
				const prefix = isFirstCondition ? '' : unionCondition
				whereConditions += `${prefix} pr.id = ? `
				params.push(Number(conditions.id))
				isFirstCondition = false
			}
			if (conditions.idAutor) {
				const prefix = isFirstCondition ? '' : unionCondition
				whereConditions += `${prefix} pr.authorId = ?`
				params.push(Number(conditions.idAutor))
				isFirstCondition = false
			}
			if (conditions.idRegion) {
				const prefix = isFirstCondition ? '' : unionCondition
				whereConditions += `${prefix} pr.regionId = ?`
				params.push(Number(conditions.idRegion))
				isFirstCondition = false
			}
		}

		let query = `
			SELECT
				pr.id,
				pr.title titulo,
				pr.description descripcion,
				pr.regionId idRegion,
				r.value region,
				pr.authorId idAuthor,
				u.user usuario,
				pr.pdfFileUrl,
				pr.excelFileUrl,
				pr.csvFileUrl,
				pr.creationDate fechaCreacion,
				pr.isActive estaActivo
			FROM plan_regional pr
			JOIN regiones r ON r.id = pr.regionId
			JOIN users u ON u.id = pr.authorId
			${whereConditions
				? `WHERE ${whereConditions}`
				: ''
			}
			ORDER BY pr.id DESC
		`

		query = query.replace(/\s+/g, ' ').trim()

		try {
			const results = await this.query(query, params);
			return {
				success: true,
				data: results.map(pr => ({
					...pr,
					fechaCreacionISOString: moment(pr.fechaCreacion).format('YYYY-MM-DD'),
					fechaCreacionString: moment(pr.fechaCreacion).format('DD/MM/YYYY'),
					hasExcelFile: pr.excelFileUrl !== null,
					hasPdfFile: pr.pdfFileUrl !== null,
					hasCsvFile: pr.csvFileUrl !== null,
					estaActivo: pr.estaActivo === 1
				}))
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudieron obtener los planes regionales"
			}
		}
	}

	async createPlanRegional({
		titulo,
		idRegion,
		idAutor,
		descripcion,
		excelFileUrl,
		pdfFileUrl,
		csvFileUrl,
		fechaCreacion,
		estaActivo,
	}) {
		const queryString = `
			INSERT INTO plan_regional (
				title,
				description,
				regionId,
				authorId,
				pdfFileUrl,
				excelFileUrl,
				csvFileUrl,
				creationDate,
				isActive
			)
			VALUES (
				?, ?, ?, ?, ?, ?, ?, ?, ?
			)
		`;
		const params = [
			titulo?.trim() || '',
			descripcion?.trim() || '',
			Number(idRegion),
			Number(idAutor),
			pdfFileUrl ? String(pdfFileUrl).trim() : null,
			excelFileUrl ? String(excelFileUrl).trim() : null,
			csvFileUrl ? String(csvFileUrl).trim() : null,
			fechaCreacion,
			estaActivo ? 1 : 0
		];
		try {
			const result = await this.query(queryString, params);
			return {
				success: true,
				data: result,
				message: "Se creó el plan regional"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo crear el plan regional"
			}
		}
	}

	async updatePlanRegional({
		id,
		titulo,
		idRegion,
		idAutor,
		descripcion,
		excelFileUrl,
		pdfFileUrl,
		csvFileUrl,
		fechaCreacion,
		estaActivo,
	}) {
		const queryString = `
			UPDATE plan_regional 
				SET
					title=?,
					description=?,
					regionId=?,
					authorId=?,
					pdfFileUrl=?,
					excelFileUrl=?,
					csvFileUrl=?,
					creationDate=?,
					isActive=?
				WHERE id=?`;
		const params = [
			titulo?.trim() || '',
			descripcion?.trim() || '',
			Number(idRegion),
			Number(idAutor),
			pdfFileUrl ? String(pdfFileUrl).trim() : null,
			excelFileUrl ? String(excelFileUrl).trim() : null,
			csvFileUrl ? String(csvFileUrl).trim() : null,
			fechaCreacion,
			estaActivo ? 1 : 0,
			Number(id)
		];
		try {
			const result = await this.query(queryString, params);
			return {
				success: true,
				data: result,
				message: "Se actualizó el plan regional"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo actualizar el plan regional"
			}
		}
	}

	async deletePlanRegional(id) {
		const queryString = `DELETE FROM plan_regional WHERE id=?`;
		try {
			const result = await this.query(queryString, [Number(id)]);
			return {
				success: true,
				data: result,
				message: "Se eliminó el plan regional"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudo eliminar el plan regional"
			}
		}
	}

	async createLog({
		action,
		entity,
		entity_id,
		description,
		user_id,
		user_email
	}) {
		const queryString = `
			INSERT INTO logs (action, entity, entity_id, description, user_id, user_email)
			VALUES (?, ?, ?, ?, ?, ?)
		`;
		try {
			const result = await this.query(queryString, [
				action,
				entity,
				entity_id !== undefined && entity_id !== null ? entity_id : null,
				description,
				user_id,
				user_email || ''
			]);
			return {
				success: true,
				data: {
					id: result.insertId,
					action,
					entity,
					entity_id,
					description,
					user_id,
					user_email: user_email || '',
					created_at: new Date().toISOString()
				}
			};
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo registrar el log" };
		}
	}

	async getRecentLogs(limit = 10) {
		const queryString = `
			SELECT l.*,
				TIMESTAMPDIFF(MINUTE, l.created_at, NOW()) AS minutes_ago
			FROM logs l
			ORDER BY l.created_at DESC
			LIMIT ${limit}
		`;
		try {
			const results = await this.query(queryString);
			return {
				success: true,
				data: results.map(r => ({
					...r,
					created_at: this.formatTimeAgo(r.minutes_ago)
				}))
			};
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudieron obtener los logs" };
		}
	}

	formatTimeAgo(minutes) {
		if (minutes < 1) return "ahora";
		if (minutes < 60) return minutes === 1 ? "hace 1 min" : `hace ${minutes} min`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return hours === 1 ? "hace 1 h" : `hace ${hours} h`;
		const days = Math.floor(hours / 24);
		return days === 1 ? "ayer" : `hace ${days} d`;
	}

	async getRevistas() {
		const queryString = `
			SELECT r.id, r.titulo, r.slug, r.imagen_url, r.pdf_url, r.esta_activo, r.created_at,
			       r.idTemaRevista, t.value AS tema
			FROM revistas r
			LEFT JOIN tipos_revista t ON r.idTemaRevista = t.id
			ORDER BY r.created_at DESC
		`;
		try {
			const results = await this.query(queryString);
			return { success: true, data: results };
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudieron obtener las revistas" };
		}
	}

	async createRevista({ titulo, slug, idTemaRevista, imagen_url, pdf_url, esta_activo }) {
		const queryString = `
			INSERT INTO revistas (titulo, slug, idTemaRevista, imagen_url, pdf_url, esta_activo)
			VALUES (?, ?, ?, ?, ?, ?)
		`;
		try {
			const result = await this.query(queryString, [titulo, slug || '', idTemaRevista || null, imagen_url || '', pdf_url || '', esta_activo ? 1 : 0]);
			return { success: true, data: { insertId: result.insertId } };
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo crear la revista" };
		}
	}

	async updateRevista({ id, titulo, slug, idTemaRevista, imagen_url, pdf_url, esta_activo }) {
		const queryString = `
			UPDATE revistas
			SET titulo = ?, slug = ?, idTemaRevista = ?, imagen_url = ?, pdf_url = ?, esta_activo = ?
			WHERE id = ?
		`;
		try {
			await this.query(queryString, [titulo, slug || '', idTemaRevista || null, imagen_url || '', pdf_url || '', esta_activo ? 1 : 0, id]);
			return { success: true };
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo actualizar la revista" };
		}
	}

	async deleteRevista(id) {
		const queryString = `DELETE FROM revistas WHERE id = ?`;
		try {
			await this.query(queryString, [id]);
			return { success: true };
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo eliminar la revista" };
		}
	}

	async getTiposRevista() {
		const queryString = `SELECT id, value, isActive FROM tipos_revista ORDER BY id ASC`;
		try {
			const results = await this.query(queryString);
			return {
				success: true,
				data: results.map(t => ({ ...t, isActive: t.isActive === 1 }))
			};
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudieron obtener los tipos de revista" };
		}
	}

	async createTipoRevista({ value, isActive }) {
		const queryString = `INSERT INTO tipos_revista (value, isActive) VALUES (?, ?)`;
		try {
			const result = await this.query(queryString, [value, isActive ? 1 : 0]);
			return { success: true, data: result, message: "Se creó el tipo de revista" };
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo crear el tipo de revista" };
		}
	}

	async updateTipoRevista({ id, value, isActive }) {
		const queryString = `UPDATE tipos_revista SET value = ?, isActive = ? WHERE id = ?`;
		try {
			const result = await this.query(queryString, [value, isActive ? 1 : 0, id]);
			return { success: true, data: result, message: "Se actualizó el tipo de revista" };
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo actualizar el tipo de revista" };
		}
	}

	async deleteTipoRevista(id) {
		const queryString = `DELETE FROM tipos_revista WHERE id = ?`;
		try {
			const result = await this.query(queryString, [id]);
			return { success: true, data: result, message: "Se eliminó el tipo de revista" };
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo eliminar el tipo de revista" };
		}
	}

	async countRevistasByTipoRevista(idTemaRevista) {
		const queryString = `SELECT COUNT(*) AS count FROM revistas WHERE idTemaRevista = ?`;
		try {
			const results = await this.query(queryString, [idTemaRevista]);
			return { success: true, count: results[0].count };
		} catch (error) {
			console.error(error);
			return { success: false, count: 0 };
		}
	}

	async getRedesSociales() {
		const queryString = `SELECT id, red, url, imagen_url, isActive FROM redes_sociales ORDER BY id ASC`;
		try {
			const results = await this.query(queryString);
			return {
				success: true,
				data: results.map(r => ({ ...r, isActive: r.isActive === 1 }))
			};
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudieron obtener las redes sociales" };
		}
	}

	async createRedSocial({ red, url, imagen_url, isActive }) {
		const queryString = `INSERT INTO redes_sociales (red, url, imagen_url, isActive) VALUES (?, ?, ?, ?)`;
		try {
			const result = await this.query(queryString, [red, url, imagen_url || null, isActive ? 1 : 0]);
			return { success: true, data: result, message: "Red social creada" };
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo crear la red social" };
		}
	}

	async updateRedSocial({ id, red, url, imagen_url, isActive }) {
		const queryString = `UPDATE redes_sociales SET red = ?, url = ?, imagen_url = ?, isActive = ? WHERE id = ?`;
		try {
			await this.query(queryString, [red, url, imagen_url || null, isActive ? 1 : 0, id]);
			return { success: true, message: "Red social actualizada" };
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo actualizar la red social" };
		}
	}

	async deleteRedSocial(id) {
		const queryString = `DELETE FROM redes_sociales WHERE id = ?`;
		try {
			await this.query(queryString, [id]);
			return { success: true, message: "Red social eliminada" };
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo eliminar la red social" };
		}
	}

	// --- Programas (antes Entornos Viales) ---
	async getProgramas() {
		const queryString = `
			SELECT id, codigo, nombre, descripcion, enlace, imagen, estaActivo
			FROM programa
			ORDER BY id ASC
		`;
		try {
			const results = await this.query(queryString);
			return { success: true, data: results.map(r => ({ ...r, activo: r.estaActivo === 1 })) };
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudieron obtener los programas" };
		}
	}

	async createPrograma({ codigo, nombre, descripcion, enlace, imagen, estaActivo }) {
		const queryString = `
			INSERT INTO programa (codigo, nombre, descripcion, enlace, imagen, estaActivo, fechaRegistro, fechaActualizacion)
			VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
		`;
		try {
			const result = await this.query(queryString, [
				codigo || '', nombre || '', descripcion || '', enlace || '', imagen || '', estaActivo ? 1 : 0
			]);
			return { success: true, data: { insertId: result.insertId } };
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo crear el programa" };
		}
	}

	async updatePrograma({ id, codigo, nombre, descripcion, enlace, imagen, estaActivo }) {
		const queryString = `
			UPDATE programa
			SET codigo = ?, nombre = ?, descripcion = ?, enlace = ?, imagen = ?, estaActivo = ?, fechaActualizacion = NOW()
			WHERE id = ?
		`;
		try {
			await this.query(queryString, [
				codigo || '', nombre || '', descripcion || '', enlace || '', imagen || '', estaActivo ? 1 : 0, id
			]);
			return { success: true };
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo actualizar el programa" };
		}
	}

	async deletePrograma(id) {
		const queryString = `DELETE FROM programa WHERE id = ?`;
		try {
			await this.query(queryString, [id]);
			return { success: true };
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo eliminar el programa" };
		}
	}

	async getPublicacionesEstado(tipo) {
		const queryString = `SELECT ghost_id, habilitado FROM publicaciones_estado WHERE tipo = ?`;
		try {
			const results = await this.query(queryString, [tipo]);
			const map = {};
			results.forEach(r => { map[r.ghost_id] = r.habilitado; });
			return { success: true, data: map };
		} catch (error) {
			console.error(error);
			return { success: false, data: {} };
		}
	}

	async setPublicacionEstado(ghost_id, tipo, habilitado) {
		const queryString = `INSERT INTO publicaciones_estado (ghost_id, tipo, habilitado) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE habilitado = VALUES(habilitado)`;
		try {
			await this.query(queryString, [ghost_id, tipo, habilitado ? 1 : 0]);
			return { success: true };
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo actualizar el estado" };
		}
	}

	async getDisabledGhostIds(tipo) {
		const queryString = `SELECT ghost_id FROM publicaciones_estado WHERE tipo = ? AND habilitado = 0`;
		try {
			const results = await this.query(queryString, [tipo]);
			return { success: true, data: results.map(r => r.ghost_id) };
		} catch (error) {
			console.error(error);
			return { success: false, data: [] };
		}
	}

	// --- Banners ---
  async getBanners() {
    const queryString = `SELECT id, posicion, archivo, activo, video_url, kicker_es, kicker_en, titulo_es, titulo_en, parrafo_es, parrafo_en, btn1_label_es, btn1_label_en, btn1_href, btn2_label_es, btn2_label_en, btn2_href FROM banners ORDER BY posicion ASC`;
		try {
			const results = await this.query(queryString);
			return { success: true, data: results };
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudieron obtener los banners" };
		}
	}

  async updateBannerTextos(id, idioma, datos) {
    const lang = idioma === 'en' ? 'en' : 'es';
    const { kicker, titulo, parrafo, btn1_label, btn1_href, btn2_label, btn2_href, video_url } = datos;
    const queryString = `UPDATE banners SET
      kicker_${lang} = ?,
      titulo_${lang} = ?,
      parrafo_${lang} = ?,
      btn1_label_${lang} = ?,
      btn1_href = ?,
      btn2_label_${lang} = ?,
      btn2_href = ?,
      video_url = ?
    WHERE id = ?`;
    try {
      await this.query(queryString, [
        kicker || null,
        titulo || null,
        parrafo || null,
        btn1_label || null,
        btn1_href || null,
        btn2_label || null,
        btn2_href || null,
        video_url || null,
        id
      ]);
			return { success: true };
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudieron actualizar los textos del banner" };
		}
	}

	async updateBannerOrder(items) {
		const queryString = `UPDATE banners SET posicion = ? WHERE id = ?`;
		try {
			for (const { id, posicion } of items) {
				await this.query(queryString, [posicion, id]);
			}
			return { success: true };
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo actualizar el orden" };
		}
	}

	async updateBannerArchivo(id, archivo) {
		const queryString = `UPDATE banners SET archivo = ? WHERE id = ?`;
		try {
			await this.query(queryString, [archivo, id]);
			return { success: true };
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo actualizar el banner" };
		}
	}

	async updateBannerActivo(id, activo) {
		const queryString = `UPDATE banners SET activo = ? WHERE id = ?`;
		try {
			await this.query(queryString, [activo ? 1 : 0, id]);
			return { success: true };
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo actualizar el estado del banner" };
		}
	}

	async getAllBanners() {
		const queryString = `SELECT id, posicion, archivo, activo, kicker_es, kicker_en, titulo_es, titulo_en, parrafo_es, parrafo_en, btn1_label_es, btn1_label_en, btn1_href, btn2_label_es, btn2_label_en, btn2_href FROM banners ORDER BY posicion ASC`;
		try {
			const results = await this.query(queryString);
			return { success: true, data: results };
		} catch (error) {
			console.error(error);
			return { success: false, data: [] };
		}
	}

	async getComponentesTecnologicos(idioma) {
		const lang = idioma && String(idioma).toUpperCase() === 'EN' ? 'EN' : 'ES';
		const queryString = `SELECT id, idioma, orden, titulo, descripcion, link, icon, external FROM componentes_tecnologicos WHERE idioma = ? ORDER BY orden ASC, id ASC`;
		try {
			const results = await this.query(queryString, [lang]);
			return { success: true, data: results };
		} catch (error) {
			console.error(error);
			return { success: false, data: [] };
		}
	}

	async createComponenteTecnologico({ idioma, titulo = '', descripcion = '', link = '' }) {
		const lang = idioma && String(idioma).toUpperCase() === 'EN' ? 'EN' : 'ES';
		const external = /^https?:\/\//.test(link || '') ? 1 : 0;
		const queryString = `
			INSERT INTO componentes_tecnologicos (idioma, orden, titulo, descripcion, link, external)
			SELECT ?, COALESCE(MAX(orden), 0) + 1, ?, ?, ?, ?
			FROM componentes_tecnologicos WHERE idioma = ?
		`;
		try {
			const result = await this.query(queryString, [lang, titulo, descripcion, link, external, lang]);
			return { success: true, data: result, message: "Se creó el componente tecnológico" };
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo crear el componente tecnológico" };
		}
	}

	async updateComponenteTecnologico(id, { titulo, descripcion, link }) {
		const external = /^https?:\/\//.test(link || '') ? 1 : 0;
		const queryString = `
			UPDATE componentes_tecnologicos
			SET titulo = ?, descripcion = ?, link = ?, external = ?
			WHERE id = ?
		`;
		try {
			const result = await this.query(queryString, [titulo, descripcion, link, external, id]);
			return { success: true, data: result, message: "Se actualizó el componente tecnológico" };
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo actualizar el componente tecnológico" };
		}
	}

	async deleteComponenteTecnologico(id) {
		const queryString = `DELETE FROM componentes_tecnologicos WHERE id = ?`;
		try {
			const result = await this.query(queryString, [id]);
			return { success: true, data: result, message: "Se eliminó el componente tecnológico" };
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo eliminar el componente tecnológico" };
		}
	}

	async getAccesosRapidos(idioma) {
		const lang = idioma && String(idioma).toUpperCase() === 'EN' ? 'EN' : 'ES';
		const queryString = `SELECT id, idioma, orden, eyebrow, titulo, descripcion, texto_boton, enlace_boton, external, imagen FROM accesos_rapidos WHERE idioma = ? ORDER BY orden ASC, id ASC`;
		try {
			const results = await this.query(queryString, [lang]);
			return { success: true, data: results.map(r => ({ ...r, external: r.external === 1 })) };
		} catch (error) {
			console.error(error);
			return { success: false, data: [] };
		}
	}

	async createAccesoRapido({ idioma, orden, eyebrow, titulo, descripcion, texto_boton, enlace_boton, imagen }) {
		const lang = idioma && String(idioma).toUpperCase() === 'EN' ? 'EN' : 'ES';
		const external = /^https?:\/\//.test(enlace_boton || '') ? 1 : 0;
		const queryString = `
			INSERT INTO accesos_rapidos (idioma, orden, eyebrow, titulo, descripcion, texto_boton, enlace_boton, external, imagen)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
		`;
		try {
			const result = await this.query(queryString, [
				lang, orden || 0, eyebrow || '', titulo || '', descripcion || '', texto_boton || '', enlace_boton || '', external, imagen || ''
			]);
			return { success: true, data: result, message: "Se creó el acceso rápido" };
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo crear el acceso rápido" };
		}
	}

	async updateAccesoRapido(id, { eyebrow, titulo, descripcion, texto_boton, enlace_boton, imagen }) {
		const external = /^https?:\/\//.test(enlace_boton || '') ? 1 : 0;
		const queryString = `
			UPDATE accesos_rapidos
			SET eyebrow = ?, titulo = ?, descripcion = ?, texto_boton = ?, enlace_boton = ?, external = ?, imagen = ?
			WHERE id = ?
		`;
		try {
			const result = await this.query(queryString, [
				eyebrow || '', titulo || '', descripcion || '', texto_boton || '', enlace_boton || '', external, imagen || '', id
			]);
			return { success: true, data: result, message: "Se actualizó el acceso rápido" };
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo actualizar el acceso rápido" };
		}
	}

	async deleteAccesoRapido(id) {
		const queryString = `DELETE FROM accesos_rapidos WHERE id = ?`;
		try {
			const result = await this.query(queryString, [id]);
			return { success: true, data: result, message: "Se eliminó el acceso rápido" };
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo eliminar el acceso rápido" };
		}
	}

	// --- Subitems del navbar (menu_subitems) ---
	async getMenuSubitems() {
		const queryString = `SELECT id, seccion, orden, label_es, label_en, url, external, isActive FROM menu_subitems ORDER BY seccion ASC, orden ASC, id ASC`;
		try {
			const results = await this.query(queryString);
			return {
				success: true,
				data: (results || []).map(r => ({
					id: r.id,
					seccion: r.seccion,
					orden: r.orden,
					label_es: r.label_es || '',
					label_en: r.label_en || '',
					url: r.url || '',
					external: r.external === 1 || r.external === '1',
					isActive: r.isActive === 1 || r.isActive === '1'
				}))
			};
		} catch (error) {
			console.error(error);
			return { success: false, data: [] };
		}
	}

	async createMenuSubitem({ seccion, label_es, label_en, url, external, isActive }) {
		const allowed = ['quienes-somos', 'comunicaciones', 'publicaciones', 'educacion-vial', 'aplicaciones', 'normas-legales'];
		const sec = allowed.includes(seccion) ? seccion : 'quienes-somos';
		const queryString = `
			INSERT INTO menu_subitems (seccion, orden, label_es, label_en, url, external, isActive)
			SELECT ?, COALESCE(MAX(orden), 0) + 1, ?, ?, ?, ?, ?
			FROM (SELECT orden FROM menu_subitems WHERE seccion = ?) s
		`;
		try {
			const result = await this.query(queryString, [
				sec, label_es || '', label_en || '', url || '',
				external ? 1 : 0, isActive ? 1 : 0, sec
			]);
			return { success: true, data: { insertId: result.insertId }, message: "Se creó el subitem" };
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo crear el subitem" };
		}
	}

	async updateMenuSubitem(id, { label_es, label_en, url, external, isActive }) {
		const setParts = [];
		const params = [];
		if (label_es !== undefined) { setParts.push('label_es = ?'); params.push(label_es || ''); }
		if (label_en !== undefined) { setParts.push('label_en = ?'); params.push(label_en || ''); }
		if (url !== undefined) { setParts.push('url = ?'); params.push(url || ''); }
		if (external !== undefined) { setParts.push('external = ?'); params.push(external ? 1 : 0); }
		if (isActive !== undefined) { setParts.push('isActive = ?'); params.push(isActive ? 1 : 0); }
		if (setParts.length === 0) return { success: true, message: "Nada que actualizar" };
		setParts.push('update_time = CURRENT_TIMESTAMP');
		params.push(id);
		const queryString = `UPDATE menu_subitems SET ${setParts.join(', ')} WHERE id = ?`;
		try {
			await this.query(queryString, params);
			return { success: true, message: "Se actualizó el subitem" };
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo actualizar el subitem" };
		}
	}

	async deleteMenuSubitem(id) {
		const queryString = `DELETE FROM menu_subitems WHERE id = ?`;
		try {
			await this.query(queryString, [id]);
			return { success: true, message: "Se eliminó el subitem" };
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo eliminar el subitem" };
		}
	}

	async reorderMenuSubitems(items) {
		const queryString = `UPDATE menu_subitems SET orden = ? WHERE id = ?`;
		try {
			for (const { id, orden } of items) {
				await this.query(queryString, [orden, id]);
			}
			return { success: true, message: "Se actualizó el orden" };
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo actualizar el orden" };
		}
	}

	// --- Instituciones Aliadas ---
	async getInstitucionesAliadas() {
		const queryString = `SELECT id, nombre, enlace, logo_url, activo FROM instituciones_aliadas WHERE activo = 1 ORDER BY id ASC`;
		try {
			const results = await this.query(queryString);
			return { success: true, data: results };
		} catch (error) {
			console.error(error);
			return { success: false, data: [] };
		}
	}

	async createInstitucionAliada({ nombre, enlace, logo_url }) {
		const queryString = `INSERT INTO instituciones_aliadas (nombre, enlace, logo_url, activo) VALUES (?, ?, ?, 1)`;
		try {
			const result = await this.query(queryString, [nombre || '', enlace || '', logo_url || '']);
			return { success: true, data: { insertId: result.insertId }, message: "Institución aliada creada" };
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo crear la institución aliada" };
		}
	}

	async updateInstitucionAliada(id, { nombre, enlace, logo_url, activo }) {
		const setParts = [];
		const params = [];
		if (nombre !== undefined) { setParts.push('nombre = ?'); params.push(nombre || ''); }
		if (enlace !== undefined) { setParts.push('enlace = ?'); params.push(enlace || ''); }
		if (logo_url !== undefined) { setParts.push('logo_url = ?'); params.push(logo_url || ''); }
		if (activo !== undefined) { setParts.push('activo = ?'); params.push(activo ? 1 : 0); }
		if (setParts.length === 0) return { success: true, message: "Nada que actualizar" };
		params.push(id);
		const queryString = `UPDATE instituciones_aliadas SET ${setParts.join(', ')} WHERE id = ?`;
		try {
			await this.query(queryString, params);
			return { success: true, message: "Institución aliada actualizada" };
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo actualizar la institución aliada" };
		}
	}

	async deleteInstitucionAliada(id) {
		const queryString = `DELETE FROM instituciones_aliadas WHERE id = ?`;
		try {
			await this.query(queryString, [id]);
			return { success: true, message: "Institución aliada eliminada" };
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo eliminar la institución aliada" };
		}
	}

}

module.exports = DataBase;
