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

	async getDocumentsPages ({ pageLength }) {
		const queryString = `
			SELECT
				count(id) pages
			FROM ${process.env.DOCUMENTS_TABLE} 
		`;
		try {
			const results = await this.query(queryString);
			return { success: true, data: Math.ceil(Number(results[0].pages) / pageLength) }
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo recuperar los datos, recargue la página" }
		}
	}

	async getDocuments ({page, pageLength = 5}) {
		page = page < 0 ? 1 : page 
		const offsetData = (page - 1) * pageLength 
		const queryString = `
			SELECT
				* 
			FROM ${process.env.DOCUMENTS_TABLE} 
			ORDER BY id DESC
			LIMIT ${pageLength} OFFSET ${offsetData} 
		`;
		try {
			const results = await this.query(queryString);
			return { success: true, data: results }
		} catch (error) {
			console.error(error);
			return { success: false, message: "No se pudo recuperar los datos, recargue la página" }
		}
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
		const queryString = "SELECT lesionado, accidente, fallecido, telefono, email FROM parametro";
		try {
			const results = await this.query(queryString);
			return {
				success: true,
				data: {
					lesionados: results[0].lesionado,
					accidentados: results[0].accidente,
					fallecidos: results[0].fallecido,
					telefono: results[0].telefono,
					email: results[0].email
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

	/**
	 * @description: Actualiza el valor de la variable lesionado en la tabla parametro
	 * @param {{
	 *  lesionados: number,
	 *  accidentados: number,
	 *  fallecidos: number,
	 *  telefono: string,
	 *  email: string
	 * }} cifras valor de la variable lesionado
	 * @returns
	 */
	async updateCifras({ lesionados, accidentados, fallecidos, telefono, email }) {
		const queryString = `
            UPDATE parametro 
                SET 
                    lesionado=${lesionados}, 
                    accidente=${accidentados}, 
                    fallecido=${fallecidos},
                    telefono='${telefono}',
                    email='${email}'
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
		const queryString = `SELECT telefono, email, direccion FROM parametro`;
		try {
			const results = await this.query(queryString);
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
		const queryString = "SELECT id, descripcion FROM menu";
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

	async getSubmenu() {
		const queryString = `
			SELECT
				s.id,
				m.descripcion menu,
				s.descripcion submenu,
				s.menu_id,
				s.rutabi,
				s.linkvideo,
				s.linkpdf,
				s.imagen,
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

	async getDatosAbiertos() {
		const queryString = `
			SELECT
				f.id,
				f.title titulo,
				f.author autor,
				f.description descripcion,
				f.category1 categoria,
				f.type tipo,
				f.excelfile,
				f.pdffile,
				f.csvfile,
				f.fecha
			FROM files f;
		`;
		try {
			const results = await this.query(queryString);
			return {
				success: true,
				data: results.map(res => ({
					...res,
					excelfile: res.excelfile === 'null' ? 'No existe' : res.excelfile,
					pdffile: res.pdffile === 'null' ? 'No existe': res.pdffile,
					csvfile: res.csvfile === 'null'? 'No existe' : res.csvfile,
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
		categoria,
		tipo,
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
					category1,
					type,
					excelfile,
					pdffile,
					csvfile,
					fecha
				)
			VALUES (
				'${titulo}', 
				'${autor}', 
				'${descripcion}', 
				'${categoria}', 
				'${tipo}', 
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
		categoria,
		tipo,
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
					category1='${categoria}',
					type='${tipo}',
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
				message: "Se eliminaron los datos"
			}
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: "No se pudieron eliminar los datos"
			}
		}
	}
}


module.exports = DataBase;
