const mysql = require('mysql');
const util = require('util');
const conn = mysql.createConnection({
  host: 'localhost', user: 'root', password: '%Xlr8-1997$', database: 'onsv'
});
const query = util.promisify(conn.query).bind(conn);

const alterations = [
  "ALTER TABLE pagina ADD COLUMN seccion6 TEXT AFTER seccion5",
  "ALTER TABLE pagina ADD COLUMN seccion7 TEXT AFTER seccion6",
  "ALTER TABLE pagina ADD COLUMN seccion8 TEXT AFTER seccion7",
  "ALTER TABLE pagina ADD COLUMN seccion9 TEXT AFTER seccion8",
  "ALTER TABLE pagina ADD COLUMN seccion10 TEXT AFTER seccion9",
  "ALTER TABLE pagina ADD COLUMN seccion11 TEXT AFTER seccion10",
  "ALTER TABLE pagina ADD COLUMN seccion12 TEXT AFTER seccion11",
  "ALTER TABLE pagina ADD COLUMN seccion13 TEXT AFTER seccion12",
  "ALTER TABLE pagina ADD COLUMN seccion14 TEXT AFTER seccion13",
  "ALTER TABLE pagina ADD COLUMN seccion15 TEXT AFTER seccion14",
  "ALTER TABLE pagina ADD COLUMN seccion16 TEXT AFTER seccion15",
  "ALTER TABLE pagina ADD COLUMN seccion17 TEXT AFTER seccion16",
  "ALTER TABLE pagina ADD COLUMN seccion18 TEXT AFTER seccion17",
  "ALTER TABLE pagina ADD COLUMN seccion19 TEXT AFTER seccion18",
  "ALTER TABLE pagina ADD COLUMN seccion20 TEXT AFTER seccion19",
  "ALTER TABLE pagina ADD COLUMN seccion21 TEXT AFTER seccion20",
  "ALTER TABLE pagina ADD COLUMN seccion22 TEXT AFTER seccion21",
  "ALTER TABLE pagina ADD COLUMN seccion23 TEXT AFTER seccion22",
  "ALTER TABLE pagina ADD COLUMN seccion24 TEXT AFTER seccion23",
  "ALTER TABLE pagina ADD COLUMN seccion25 TEXT AFTER seccion24",
];

(async () => {
  for (const sql of alterations) {
    try {
      await query(sql);
      console.log('OK: ' + sql.slice(0, 60));
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('SKIP (exists): ' + sql.slice(0, 60));
      else console.error('ERROR: ' + e.code + ' — ' + sql.slice(0, 60));
    }
  }
  conn.end();
})();