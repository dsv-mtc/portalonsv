const mysql = require('mysql');
const util = require('util');
const conn = mysql.createConnection({
  host: 'localhost', user: 'root', password: '%Xlr8-1997$', database: 'onsv'
});
const query = util.promisify(conn.query).bind(conn);
(async () => {
  try {
    await query("ALTER TABLE pagina ADD COLUMN seccion5 TEXT AFTER seccion4");
    console.log('Columna seccion5 agregada correctamente');
  } catch(e) {
    if (e.code === 'ER_DUP_FIELDNAME') console.log('seccion5 ya existe');
    else console.error(e);
  }
  conn.end();
})();
