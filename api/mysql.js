const mysql = require("mysql2");
const dotenv = require("dotenv");
const crypto = require("crypto-js");
const moment = require('moment');
dotenv.config();
const util = require("util");
const logger = require('../controllers/logger');
const MySQLStore = require('express-mysql-session');
const dataConnection = {
	host: process.env.DATABASE_HOST,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASSWORD,
	database: process.env.DATABASE_NAME
}

const client = mysql.createConnection(dataConnection)

class DataBase {
	constructor() {
		this.query = null;
	}
	getConnection = () => {
		client.connect(
			(error) => {
				if (!error) {
					logger.info('La base de datos está conectada');

				}
				else {
					logger.error(error);
					throw error
				}
			}
		)
	}
	setQuery() {
		//Habilitamos el uso de asyn await
		this.query = util.promisify(client.query).bind(client);
		this.beginTransaction = util.promisify(client.beginTransaction).bind(client);
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
		if (conditions) {
			const unionCondition = ' AND '
			let isFirstCondition = true
			if (conditions.id) {
				const prefix = isFirstCondition ? '' : unionCondition
				whereConditions += `${prefix} rurp.id = ${conditions.id} `
				isFirstCondition = false
			}
			if (conditions.userId) {
				const prefix = isFirstCondition ? '' : unionCondition
				whereConditions += `${prefix} u.id = ${conditions.userId}`
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
			const results = await this.query(query);

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
			VALUES ('${value}');
		`
		try {
			const {insertId} = await this.query(roleQuery);

			const permissionsQuery = `
				INSERT INTO rel_user_role_permission (permissionId, roleId)
				VALUES ${permissionIds.map(p => `(${p}, ${insertId})`).join(',')}
			`;
			
			await this.query(permissionsQuery);
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
			DELETE FROM rel_user_role_permission WHERE roleId=${id}
		`

		const createRolPermissionQuery = `
			INSERT INTO rel_user_role_permission (permissionId, roleId)
			VALUES ${permissionIds.map(p => `(${p}, ${id})`).join(',')}
		`

		const updateRoleQuery = `
			UPDATE user_role SET value='${value}' WHERE id=${id}
		`

		try {
			await this.query(removeRolPermissionsQuery)
			await Promise.all([
				this.query(createRolPermissionQuery),
				this.query(updateRoleQuery),
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
		const queryString = `DELETE FROM user_role WHERE id=${id}`;
		try {
			const result = await this.query(queryString);
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
			const queryString = `SELECT * FROM ${process.env.USER_TABLE} WHERE user="${user}" `;
			let result = await this.query(queryString)
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
				WHERE u.id=${id}
			`;
			let result = await this.query(queryString)
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
			const passwordEncrypted = crypto.AES.encrypt(password, process.env.CRYPTO_SECRET_KEY);
			const queryString = `
				INSERT INTO ${process.env.USER_TABLE} 
					(user, password, idUserRole, estaActivo) 
				VALUES 
					("${email}","${passwordEncrypted}", ${roleId}, ${estaActivo ? 1 : 0})
			`
			const result = await this.query(queryString)
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
		const passwordEncrypted = password
			? crypto.AES.encrypt(password, process.env.CRYPTO_SECRET_KEY)
			: undefined;
		const queryString = `
			UPDATE ${process.env.USER_TABLE} 
				SET
					user='${email}',
					${password ? `password='${passwordEncrypted}',` : ''}
					idUserRole=${roleId},
					estaActivo=${estaActivo ? 1 : 0}
				WHERE id=${id}
		`;
		try {
			const result = await this.query(queryString);
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
		const queryString = `DELETE FROM ${process.env.USER_TABLE} WHERE id=${id}`;
		try {
			const result = await this.query(queryString);
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
	 * @description: Compara el password ingresado con el password guardado en tabla
	 * @param {string} passIn: Password ingresado 
	 * @param {string} passSaved: Password guardado en tabla
	 * @returns 
	 */
	comparePassword = (passIn, passSaved) => {
		const passwordDecrypted = crypto.AES.decrypt(passSaved, process.env.CRYPTO_SECRET_KEY).toString(crypto.enc.Utf8);
		if (passIn == passwordDecrypted) {
			return true;
		}
		return false;
	}

	getDocumentsByTitle = async (title) => {
		const queryString = `SELECT * FROM ${process.env.DOCUMENTS_TABLE} WHERE  category1='${title}' OR category2='${title}' OR category3='${title}' `;
		try {
			const results = await this.query(queryString);
			return { success: true, data: results }
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo recuperar los datos, recargue la página" }
		}
	}

	saveDocument = async (data) => {
		try {
			const date = moment().format('DD/MM/YYYY');
			//const {title,author,description,category1,category2,category3,type,excelfile,pdffile,csvfile} = data;
			const { title, author, description, category1, type, excelfile, pdffile, csvfile } = data;
			// const queryString=`INSERT INTO ${process.env.DOCUMENTS_TABLE} 
			//     (title,author,description,category1,category2,category3,type,excelfile,pdffile,csvfile) 
			//     VALUES ("${title}","${author}","${description}","${category1}","${category2}","${category3}","${type}","${excelfile}","${pdffile}","${csvfile}")`
			const queryString = `INSERT INTO ${process.env.DOCUMENTS_TABLE} 
                (title,author,description,category1,category2,category3,type,excelfile,pdffile,csvfile,fecha) 
                VALUES ("${title}","${author}","${description}","${category1}","0","0","${type}","${excelfile}","${pdffile}","${csvfile}","${date}")`
			await this.query(queryString);
			return { success: true, message: "El documento ha sido guardado" }
		} catch (error) {
			console.error(error);
			return { success: false, message: "Al parecer algo salió mal, comuníquese con el administrador de la plataforma" }
		}
	}

	//MANEJO DE SESIONES
	//doc: https://www.cleverclouds.im/es/blog/2018/06/guardar-la-sesi%C3%B3n-en-mysql-para-el-framework-express-en-node

	sessionStore(session) {
		MySQLStore(session);
		let sessionStoreVar = new MySQLStore(dataConnection);
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
					lesionado=${lesionados}, 
					accidente=${accidentados}, 
					fallecido=${fallecidos},
					mensaje1='${mensaje1}',
					mensaje2='${mensaje2}',
					fuente_siniestro='${fuente_siniestro}',
					porcentaje_siniestro='${porcentaje_siniestro}',
					fuente_lesiones='${fuente_lesiones}',
					porcentaje_lesiones='${porcentaje_lesiones}',
					fuente_muertes='${fuente_muertes}',
					porcentaje_muertes='${porcentaje_muertes}'
    `;
		try {
			const result = await this.query(queryString);
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
		`;
		try {
			const results = await this.query(queryString);
			return {
				success: true,
				data: {
					telefono: results[0].telefono,
					email: results[0].email,
					direccion: results[0].direccion,
					descripcion: results[0].descripcion,
					horario: results[0].horario
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
		horario
	}) {
		const queryString = `
			UPDATE footer 
				SET 
					telefono='${telefono}',
					email='${email}',
					direccion='${direccion}',
					descripcion='${descripcion}',
					horario='${horario}'
		`;
		try {
			const result = await this.query(queryString);
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
		const queryString = `SELECT seccion1, seccion2, seccion3, seccion4, seccion5, seccion6, seccion7, seccion8, seccion9, seccion10, seccion11, seccion12, seccion13, seccion14, seccion15, seccion16, seccion17, seccion18, seccion19, seccion20, seccion21, seccion22, seccion23, seccion24, seccion25, seccion26, seccion27, seccion28, seccion29, seccion30, seccion31, seccion32, seccion33, seccion34, seccion35, seccion36, seccion37, seccion38, seccion39, seccion40, seccion41, seccion42, seccion43, seccion44 FROM pagina WHERE idioma like '${idioma}'`;
		try {
			const results = await this.query(queryString);
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
			comp1_titulo, comp1_desc, comp2_titulo, comp2_desc,
			comp3_titulo, comp3_desc, comp4_titulo, comp4_desc,
			comp5_titulo, comp5_desc, comp6_titulo, comp6_desc,
			comp7_titulo, comp7_desc, comp8_titulo, comp8_desc,
			comp9_titulo, comp9_desc,
			comp1_link, comp2_link, comp3_link, comp4_link,
			comp5_link, comp6_link, comp7_link, comp8_link, comp9_link,
			val1_titulo, val1_desc, val2_titulo, val2_desc,
			val3_titulo, val3_desc, val4_titulo, val4_desc,
			val5_titulo, val5_desc, val6_titulo, val6_desc
		} = data;
		const queryString = `
            UPDATE pagina
                SET
                    seccion1='${descripcion}',
                    seccion2='${mision}',
                    seccion3='${vision}',
                    seccion4='${comp_titulo}',
                    seccion5='${val_intro}',
                    seccion6='${comp1_titulo}',
                    seccion7='${comp1_desc}',
                    seccion8='${comp2_titulo}',
                    seccion9='${comp2_desc}',
                    seccion10='${comp3_titulo}',
                    seccion11='${comp3_desc}',
                    seccion12='${comp4_titulo}',
                    seccion13='${comp4_desc}',
                    seccion14='${val1_titulo}',
                    seccion15='${val1_desc}',
                    seccion16='${val2_titulo}',
                    seccion17='${val2_desc}',
                    seccion18='${val3_titulo}',
                    seccion19='${val3_desc}',
                    seccion20='${val4_titulo}',
                    seccion21='${val4_desc}',
                    seccion22='${val5_titulo}',
                    seccion23='${val5_desc}',
                    seccion24='${val6_titulo}',
                    seccion25='${val6_desc}',
                    seccion26='${comp5_titulo}',
                    seccion27='${comp5_desc}',
                    seccion28='${comp6_titulo}',
                    seccion29='${comp6_desc}',
                    seccion30='${comp7_titulo}',
                    seccion31='${comp7_desc}',
                    seccion32='${comp8_titulo}',
                    seccion33='${comp8_desc}',
                    seccion34='${comp9_titulo}',
                    seccion35='${comp9_desc}',
                    seccion36='${comp1_link || ''}',
                    seccion37='${comp2_link || ''}',
                    seccion38='${comp3_link || ''}',
                    seccion39='${comp4_link || ''}',
                    seccion40='${comp5_link || ''}',
                    seccion41='${comp6_link || ''}',
                    seccion42='${comp7_link || ''}',
                    seccion43='${comp8_link || ''}',
                    seccion44='${comp9_link || ''}'
            WHERE idioma LIKE '${idioma}'`;
		try {
			const result = await this.query(queryString);
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
					imagen: s.imagen || 'No existe',
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
					imagen: s.imagen || 'No existe',
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
            imagen,
            estado,
            enlace,
            create_time, 
            update_time 
        FROM popup`;
		try {
			const result = await this.query(queryString);
			return {
				success: true,
				data: result[0],
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

	async updatePopup({ imagen, estado, enlace }) {
		const queryString = `
      		UPDATE popup 
          	SET 
              imagen='${imagen}', 
              estado='${estado}',
              enlace='${enlace}',
              update_time=CURRENT_TIMESTAMP`;
		try {
			const result = await this.query(queryString);
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

	async getDatosAbiertosPages({ pageLength, conditions }) {
		let whereConditions = ''
		if (conditions) {
			const unionCondition = ' AND '
			let isFirstCondition = true
			if (conditions.id) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} f.id = ${conditions.id} `
				isFirstCondition = false
			}
			if (conditions.idCategoria) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} f.idCategoria = ${conditions.idCategoria}`
				isFirstCondition = false
			}
			if (conditions.idTipo) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} f.idTipo = ${conditions.idTipo}`
				isFirstCondition = false
			}
			if (conditions.title) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} f.title LIKE '%${conditions.title}%'`
				isFirstCondition = false
			}
			if (conditions.description) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} f.description LIKE '%${conditions.description}%'`
				isFirstCondition = false
			}
		if (conditions.fecha) {
			whereConditions += `${isFirstCondition ? '' : unionCondition} f.fecha LIKE '${conditions.fecha}%'`
			isFirstCondition = false
		}
		if (conditions.estaActivo !== undefined) {
			whereConditions += `${isFirstCondition ? '' : unionCondition} f.estaActivo = ${conditions.estaActivo}`
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
		console.log(query)
		try {
			const results = await this.query(query);
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
		if (conditions) {
			const unionCondition = ' AND '
			let isFirstCondition = true
			if (conditions.id) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} f.id = ${conditions.id} `
				isFirstCondition = false
			}
			if (conditions.idCategoria) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} f.idCategoria = ${conditions.idCategoria}`
				isFirstCondition = false
			}
			if (conditions.idTipo) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} f.idTipo = ${conditions.idTipo}`
				isFirstCondition = false
			}
			if (conditions.title) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} f.title LIKE '%${conditions.title}%'`
				isFirstCondition = false
			}
			if (conditions.description) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} f.description LIKE '%${conditions.description}%'`
				isFirstCondition = false
			}
		if (conditions.fecha) {
			whereConditions += `${isFirstCondition ? '' : unionCondition} f.fecha LIKE '${conditions.fecha}%'`
			isFirstCondition = false
		}
		if (conditions.estaActivo !== undefined) {
			whereConditions += `${isFirstCondition ? '' : unionCondition} f.estaActivo = ${conditions.estaActivo}`
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
			query += `LIMIT ${pageLength} OFFSET ${offsetData}`
		}

		query = query.replace(/\s+/g, ' ').trim()

		try {
			const results = await this.query(query);
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
				'${titulo}', 
				'${autor}', 
				'${descripcion}', 
				${idCategoria}, 
				${idTipo}, 
				'${excelfilepath}', 
				'${pdffilepath}', 
				'${csvfilepath}', 
				'${shapefilepath}',
				${estaActivo ? 1 : 0},
				'${fecha}' 
			)
		`;
		try {
			const result = await this.query(queryString);
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
					title='${titulo}',
					author='${autor}',
					description='${descripcion}',
					idCategoria=${idCategoria},
					idTipo=${idTipo},
					excelfile='${excelfilepath}',
					pdffile='${pdffilepath}',
					csvfile='${csvfilepath}',
					shapefile='${shapefilepath}',
					estaActivo=${estaActivo ? 1 : 0},
					fecha='${fecha}'
				WHERE id=${id}
		`;
		try {
			const result = await this.query(queryString);
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
		const queryString = `DELETE FROM files WHERE id=${id}`;
		try {
			const result = await this.query(queryString);
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
			VALUES ( '${value}', '${icon}',${estaActivo ? 1 : 0} )
		`;
		try {
			const result = await this.query(queryString);
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
					value='${value}',
					icon='${icon}',
					estaActivo=${estaActivo ? 1 : 0}
				WHERE id=${id}
		`;
		try {
			const result = await this.query(queryString);
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
		const queryString = `DELETE FROM categoria WHERE id=${id}`;
		try {
			const result = await this.query(queryString);
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
			WHERE r.value LIKE '${name}' OR r.slug = '${slug}'
			ORDER BY r.slug ASC
			LIMIT 1
		`

		query = query.replace(/\s+/g, ' ').trim()

		try {
			const results = await this.query(query);
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
		if (conditions) {
			const unionCondition = ' AND '
			let isFirstCondition = true
			if (conditions.id) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} r.id = ${conditions.id}`
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
			const results = await this.query(query);
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
		if (conditions) {
			const unionCondition = ' AND '
			let isFirstCondition = true
			if (conditions.id) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} r.id = ${conditions.id}`
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
			query += `LIMIT ${pageSize} OFFSET ${offsetData}`
		}

		query = query.replace(/\s+/g, ' ').trim()

		try {
			const results = await this.query(query);
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
					nombreEncargado=${nombreEncargado ? `'${nombreEncargado}'` : 'null'},
					celularEncargado=${celularEncargado ? `'${celularEncargado}'` : 'null'},
					correoEncargado=${correoEncargado ? `'${correoEncargado}'` : 'null'},
					imageUrl='${imageUrl}',
					pageLink=${pageLink ? `'${pageLink}'` : 'null'}
				WHERE id=${id}
		`;
		try {
			const result = await this.query(queryString);
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
			VALUES ( '${value}', ${estaActivo ? 1 : 0} )
		`;
		try {
			const result = await this.query(queryString);
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
					value='${value}',
					estaActivo=${estaActivo ? 1 : 0}
				WHERE id=${id}
		`;
		try {
			const result = await this.query(queryString);
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
		const queryString = `DELETE FROM tipo WHERE id=${id}`;
		try {
			const result = await this.query(queryString);
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
			WHERE e.id = ${id};
		`;
		try {
			const results = await this.query(queryString);
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
		if (conditions) {
			const unionCondition = ' AND '
			let isFirstCondition = true
			if (conditions.idTipoEvento) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} e.idTipoEvento = ${conditions.idTipoEvento}`
				isFirstCondition = false
			}
			if (conditions.title) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} e.title LIKE '%${conditions.title}%'`
				isFirstCondition = false
			}
			if (conditions.startDate) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} DATE(e.startTime) >= '${conditions.startDate}'`
				isFirstCondition = false
			}
			if (conditions.endDate) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} DATE(e.endTime) <= '${conditions.endDate}'`
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
			const results = await this.query(query);
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
		if (conditions) {
			const unionCondition = ' AND '
			let isFirstCondition = true
			if (conditions.idTipoEvento) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} e.idTipoEvento = ${conditions.idTipoEvento}`
				isFirstCondition = false
			}
			if (conditions.title) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} e.title LIKE '%${conditions.title}%'`
				isFirstCondition = false
			}
			if (conditions.startDate) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} DATE(e.startTime) >= '${conditions.startDate}'`
				isFirstCondition = false
			}
			if (conditions.endDate) {
				whereConditions += `${isFirstCondition ? '' : unionCondition} DATE(e.endTime) <= '${conditions.endDate}'`
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
			query += `LIMIT ${pageSize} OFFSET ${offsetData}`
		}

		query = query.replace(/\s+/g, ' ').trim()

		try {
			const results = await this.query(query);
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
				'${title}',
				${idTipoEvento},
				'${organizedBy}',
				${place ? `'${place}'` : 'null'},
				${shortDescription ? `'${shortDescription}'` : 'null'},
				${description ? `'${description}'` : 'null'},
				'${startDay} ${startTime}',
				${endDay ? `'${endDay}${endTime ? ` ${endTime}` : ''}'` : 'null'},
				${price ? price : 'null'},
				${imageUrl ? `'${imageUrl}'` : 'null'},
				${direccion ? `'${direccion}'` : 'null'},
				${reunionLink ? `'${reunionLink}'` : 'null'},
				${facebookLink ? `'${facebookLink}'` : 'null'},
				${youtubeLink ? `'${youtubeLink}'` : 'null'},
				${twitterLink ? `'${twitterLink}'` : 'null'},
				${anotherLink ? `'${anotherLink}'` : 'null'},
				${isActive ? 1 : 0}
			)
		`;
		try {
			const result = await this.query(queryString);
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
					title = '${title}',
					idTipoEvento = ${idTipoEvento},
					organizedBy = '${organizedBy}',
					place = ${place ? `'${place}'` : 'null'},
					shortDescription = ${shortDescription ? `'${shortDescription}'` : 'null'},
					description = ${description ? `'${description}'` : 'null'},
					startTime = '${startDay} ${startTime}',
					endTime = ${(endDay && endDay !== 'Invalid date') ? `'${endDay}${endTime ? ` ${endTime}` : ''}'` : 'null'},
					price = ${price ? price : 'null'},
					imageUrl = ${imageUrl ? `'${imageUrl}'` : 'null'},
					direccion = ${direccion ? `'${direccion}'` : 'null'},
					reunionLink = ${reunionLink ? `'${reunionLink}'` : 'null'},
					facebookLink = ${facebookLink ? `'${facebookLink}'` : 'null'},
					youtubeLink = ${youtubeLink ? `'${youtubeLink}'` : 'null'},
					twitterLink = ${twitterLink ? `'${twitterLink}'` : 'null'},
					anotherLink = ${anotherLink ? `'${anotherLink}'` : 'null'},
					isActive = ${isActive ? 1 : 0}
				WHERE id=${id}
		`;
		try {
			const result = await this.query(queryString);
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
		const queryString = `DELETE FROM evento WHERE id=${id}`;
		try {
			const result = await this.query(queryString);
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
				'${value}',
				${isActive ? 1 : 0}
			)
		`;
		try {
			const result = await this.query(queryString);
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
					value = '${value}',
					isActive = ${isActive ? 1 : 0}
				WHERE id=${id}`;
		try {
			const result = await this.query(queryString);
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
		const queryString = `DELETE FROM tipo_evento WHERE id=${id}`;
		try {
			const result = await this.query(queryString);
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
		if (conditions) {
			const unionCondition = ' AND '
			let isFirstCondition = true
			if (conditions.id) {
				const prefix = isFirstCondition ? '' : unionCondition
				whereConditions += `${prefix} pr.id = ${conditions.id} `
				isFirstCondition = false
			}
			if (conditions.idAutor) {
				const prefix = isFirstCondition ? '' : unionCondition
				whereConditions += `${prefix} pr.authorId = ${conditions.idAutor}`
				isFirstCondition = false
			}
			if (conditions.idRegion) {
				const prefix = isFirstCondition ? '' : unionCondition
				whereConditions += `${prefix} pr.regionId = ${conditions.idRegion}`
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
			const results = await this.query(query);
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
				'${titulo.trim()}',
				'${descripcion.trim()}',
				${idRegion},
				${idAutor},
				${pdfFileUrl ? `'${pdfFileUrl}'`.trim() : 'null'},
				${excelFileUrl ? `'${excelFileUrl}'`.trim() : 'null'},
				${csvFileUrl ? `'${csvFileUrl}'`.trim() : 'null'},
				'${fechaCreacion}',
				${estaActivo ? 1 : 0}
			)
		`;
		try {
			const result = await this.query(queryString);
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
					title='${titulo.trim()}',
					description='${descripcion.trim()}',
					regionId=${idRegion},
					authorId=${idAutor},
					pdfFileUrl=${pdfFileUrl ? `'${pdfFileUrl}'`.trim() : 'null'},
					excelFileUrl=${excelFileUrl ? `'${excelFileUrl}'`.trim() : 'null'},
					csvFileUrl=${csvFileUrl ? `'${csvFileUrl}'`.trim() : 'null'},
					creationDate='${fechaCreacion}',
					isActive=${estaActivo ? 1 : 0}
				WHERE id=${id}
		`;
		try {
			const result = await this.query(queryString);
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
		const queryString = `DELETE FROM plan_regional WHERE id=${id}`;
		try {
			const result = await this.query(queryString);
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
			SELECT id, codigo, nombre, descripcion, estaActivo
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

	async createPrograma({ codigo, nombre, descripcion, estaActivo }) {
		const queryString = `
			INSERT INTO programa (codigo, nombre, descripcion, estaActivo, fechaRegistro, fechaActualizacion)
			VALUES (?, ?, ?, ?, NOW(), NOW())
		`;
		try {
			const result = await this.query(queryString, [
				codigo || '', nombre || '', descripcion || '', estaActivo ? 1 : 0
			]);
			return { success: true, data: { insertId: result.insertId } };
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo crear el programa" };
		}
	}

	async updatePrograma({ id, codigo, nombre, descripcion, estaActivo }) {
		const queryString = `
			UPDATE programa
			SET codigo = ?, nombre = ?, descripcion = ?, estaActivo = ?, fechaActualizacion = NOW()
			WHERE id = ?
		`;
		try {
			await this.query(queryString, [
				codigo || '', nombre || '', descripcion || '', estaActivo ? 1 : 0, id
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
		const queryString = `SELECT id, posicion, archivo FROM banners ORDER BY posicion ASC`;
		try {
			const results = await this.query(queryString);
			return { success: true, data: results };
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudieron obtener los banners" };
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

	async getAllBanners() {
		const queryString = `SELECT id, posicion, archivo FROM banners ORDER BY posicion ASC`;
		try {
			const results = await this.query(queryString);
			return { success: true, data: results };
		} catch (error) {
			console.error(error);
			return { success: false, data: [] };
		}
	}

}

module.exports = DataBase;
