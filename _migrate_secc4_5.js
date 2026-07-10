const mysql = require('mysql');
const util = require('util');
const conn = mysql.createConnection({
  host: 'localhost', user: 'root', password: '%Xlr8-1997$', database: 'onsv'
});
const q = util.promisify(conn.query).bind(conn);

(async () => {
  await q("UPDATE pagina SET seccion4 = ? WHERE idioma = 'ES'", ["COMPONENTES TECNOL\u00d3GICOS"]);
  await q("UPDATE pagina SET seccion4 = ? WHERE idioma = 'EN'", ["TECHNOLOGICAL COMPONENTS"]);
  await q("UPDATE pagina SET seccion5 = ? WHERE idioma = 'ES'", ["Actuamos con \u00e9tica, honestidad y coherencia en la gesti\u00f3n de la informaci\u00f3n p\u00fablica. Creemos en la transparencia, el compromiso, la vocaci\u00f3n de servicio, el trabajo articulado y la innovaci\u00f3n para reducir la siniestralidad y proteger la vida de las personas en las v\u00edas."]);
  await q("UPDATE pagina SET seccion5 = ? WHERE idioma = 'EN'", ["We act with ethics, honesty and consistency in the management of public information. We believe in transparency, commitment, service vocation, articulated work and innovation to reduce road crashes and protect lives on the roads."]);
  console.log('seccion4 y seccion5 migradas');
  const r = await q("SELECT idioma, seccion4, seccion5, seccion6, seccion7, seccion14, seccion15 FROM pagina");
  console.log(JSON.stringify(r, null, 2));
  conn.end();
})();