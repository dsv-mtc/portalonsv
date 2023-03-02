const mysql = require("mysql");
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
			const queryString = `SELECT * FROM ${process.env.USER_TABLE} WHERE id="${id}" `;
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
	/**
	 * @description: Guarda un usuario dentro de las tablas que es de tipo admin
	 * @param {string} email: cuenta de correo para el registro 
	 * @param {string} password clave asignada a la cuenta de correo
	 * @returns 
	 */
	saveUser = async (email, password) => {
		try {
			const passwordEncrypted = crypto.AES.encrypt(password, process.env.CRYPTO_SECRET_KEY);
			const queryString = `INSERT INTO ${process.env.USER_TABLE} (user,password) VALUES ("${email}","${passwordEncrypted}")`
			const result = await this.query(queryString)
			return { success: true, data: result };
		} catch (error) {
			console.error(error);
			return { success: false, message: "Cannot save user" }
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

	sessionStore = (session) => {
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
				mensaje2
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
		mensaje2
	}) {
		const queryString = `
			UPDATE parametro 
				SET 
					lesionado=${lesionados}, 
					accidente=${accidentados}, 
					fallecido=${fallecidos},
					mensaje1='${mensaje1}',
					mensaje2='${mensaje2}'
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
				piePagina
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
					piePagina: results[0].piePagina
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

	async updateFooterData ({
		telefono,
		email,
		direccion,
		piePagina
	}) {
		const queryString = `
			UPDATE footer 
				SET 
					telefono='${telefono}',
					email='${email}',
					direccion='${direccion}',
					piePagina='${piePagina}'
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
		const queryString = `SELECT seccion1, seccion2, seccion3, seccion4 FROM pagina WHERE idioma like '${idioma}'`;
		try {
			const results = await this.query(queryString);
			return {
				success: true,
				data: [
					{
						label: '¿Quiénes somos?',
						contenido: results[0].seccion1
					},
					{
						label: 'Misión',
						contenido: results[0].seccion2
					},
					{
						label: 'Visión',
						contenido: results[0].seccion3
					},
					{
						label: 'Componentes tecnológicos',
						contenido: results[0].seccion4.replace(/\s+/g, ' ').trim()
					},
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

	async updateMisionVision(secondary_navigation, { descripcion, mision, vision }) {
		const idioma = secondary_navigation ? 'EN' : 'ES';
		const queryString = `
            UPDATE pagina 
                SET 
                    seccion1='${descripcion}',
                    seccion2='${mision}',
                    seccion3='${vision}' 
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
			VALUES (
				'${descripcion}',
				${urlImagen?.trim() === '' ? null : `'${urlImagen.trim()}'`},
				${observacion ? `'${observacion.trim()}'` : null},
				${estaActivo ? 1 : 0},
				CURRENT_TIMESTAMP,
				CURRENT_TIMESTAMP
			)
		`;
		try {
			const result = await this.query(queryString);
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
					descripcion='${descripcion}',
					urlImagen=${urlImagen?.trim() === '' ? null : `'${urlImagen.trim()}'`},
					observacion=${observacion ? `'${observacion.trim()}'` : null },
					estaActivo=${estaActivo ? 1 : 0},
					update_time=CURRENT_TIMESTAMP
				WHERE id=${id}`;
		try {
			const result = await this.query(queryString);
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
		const queryString = `DELETE FROM menu WHERE id=${id}`;
		try {
			const result = await this.query(queryString);
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
				'${descripcion}', 
				CURRENT_TIMESTAMP, 
				CURRENT_TIMESTAMP, 
				${menu_id}, 
				'${rutabi}', 
				'${linkvideo}', 
				'${linkpdf}',
				'${imagenpath}',
				${estado ? 1 : 0}
			)
		`;
		try {
			const result = await this.query(queryString);
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
					descripcion='${descripcion}',
					update_time=CURRENT_TIMESTAMP,
					menu_id=${menu_id}, 
					rutabi='${rutabi}', 
					linkvideo='${linkvideo}', 
					linkpdf='${linkpdf}',
					imagen='${imagenpath}',
					estado=${estado ? 1 : 0}
				WHERE id=${id}`;
		try {
			const result = await this.query(queryString);
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
		const queryString = `DELETE FROM submenu WHERE id=${id}`;
		try {
			const result = await this.query(queryString);
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

	async getDatosAbiertosPages ({ pageLength, conditions }) {
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
		}

		const queryString = `
			SELECT
				count(f.id) pages
			FROM files f
			LEFT JOIN categoria c ON c.id = f.idCategoria
			LEFT JOIN tipo t ON t.id = f.idTipo
			${
				whereConditions 
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
				f.fecha
			FROM files f
			LEFT JOIN categoria c ON c.id = f.idCategoria
			LEFT JOIN tipo t ON t.id = f.idTipo
			${
				whereConditions 
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
					categoria: res.categoria ?? 'No existe',
					tipo: res.tipo ?? 'No existe',
					excelfile: res.excelfile === 'null' ? 'No existe' : res.excelfile,
					hasExcel: res.excelfile === 'null' ? false : true,
					pdffile: res.pdffile === 'null' ? 'No existe': res.pdffile,
					hasPdf: res.pdffile === 'null' ? false : true,
					csvfile: res.csvfile === 'null'? 'No existe' : res.csvfile,
					hasCsv: res.csvfile === 'null' ? false : true,
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
			WHERE r.value LIKE '${name}'
			ORDER BY r.slug ASC
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
			${
				whereConditions 
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
			${
				whereConditions 
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
					hasSocialLinks: evento.facebookLink || evento.youtubeLink || evento.twitterLink ,
					fullYoutubeLink: evento.youtubeLink ? evento.youtubeLink.replace('embed/', 'watch?v=') : null,
					reunionIsInGoogleMeet: evento.reunionLink?.includes("google"),
					reunionIsInZoom: evento.reunionLink?.includes("zoom"),
					startDateString: moment(evento.startTime).format("DD/MM/YYYY"),
					startTimeString: moment(evento.startTime).format("HH:mm"),
					endDateString: moment(evento.endTime).format("DD/MM/YYYY"),
					endTimeString: moment(evento.endTime).format("HH:mm"),
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
			if(conditions.nearest) {
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
			${
				whereConditions 
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
			if(conditions.nearest) {
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
			${
				whereConditions 
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
					endDayISO: moment(evento.endTime).format("YYYY-MM-DD"),
					endTimeISO: moment(evento.endTime).format("HH:mm:ss"),
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
					endTime = ${endDay ? `'${endDay}${endTime ? ` ${endTime}` : ''}'` : 'null'},
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

}


module.exports = DataBase;
