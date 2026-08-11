const mysql = require('mysql');
const util = require('util');
require('dotenv').config();
const conn = mysql.createConnection({
  host: process.env.DATABASE_HOST || 'localhost', user: process.env.DATABASE_USER || 'root', password: process.env.DATABASE_PASSWORD || '', database: process.env.DATABASE_NAME || 'onsv'
});
const q = util.promisify(conn.query).bind(conn);

const comp = {
  es: [
    { titulo: "SISTEMA DE INFORMACI\u00d3N DE SINIESTROS", desc: "Estandariza las variables para el recojo y registro de informaci\u00f3n ante la ocurrencia de un siniestro, sobre la base del Formato \u00danico de Registro de Accidentes de Tr\u00e1nsito (RD N\u00b0 020-2019-MTC/18)." },
    { titulo: "VISOR GEORREFERENCIADO", desc: "Permite visualizar al p\u00fablico y a las entidades de rescate el lugar exacto del siniestro de tr\u00e1nsito." },
    { titulo: "ANAL\u00cdTICA DE DATOS", desc: "Permite interactuar con los indicadores de seguridad vial de cada localidad mediante herramientas de business intelligence." },
    { titulo: "PORTAL WEB", desc: "Orientado a una pol\u00edtica de datos abiertos a fin de fomentar la investigaci\u00f3n en materia de seguridad vial." },
  ],
  en: [
    { titulo: "CRASH INFORMATION SYSTEM", desc: "Standardizes variables for collecting and recording information when a crash occurs, based on the Single Traffic Accident Record Format (RD N\u00b0 020-2019-MTC/18)." },
    { titulo: "GEOREFERENCED VIEWER", desc: "Allows the public and rescue entities to visualize the exact location of the traffic crash." },
    { titulo: "DATA ANALYTICS", desc: "Enables interaction with road safety indicators for each locality through business intelligence tools." },
    { titulo: "WEB PORTAL", desc: "Aimed at an open data policy to promote research in road safety." },
  ]
};

const val = {
  es: [
    { titulo: "INTEGRIDAD", desc: "Actuamos con \u00e9tica, honestidad y coherencia en la gesti\u00f3n de la informaci\u00f3n p\u00fablica." },
    { titulo: "TRANSPARENCIA", desc: "Promovemos el acceso abierto a datos confiables de seguridad vial para toda la ciudadan\u00eda." },
    { titulo: "COMPROMISO", desc: "Trabajamos por reducir la siniestralidad y proteger la vida de las personas en las v\u00edas." },
    { titulo: "VOCACI\u00d3N DE SERVICIO", desc: "Orientamos nuestro esfuerzo a las necesidades de las instituciones y de la poblaci\u00f3n." },
    { titulo: "TRABAJO ARTICULADO", desc: "Fomentamos la coordinaci\u00f3n intersectorial e intergubernamental basada en evidencia." },
    { titulo: "INNOVACI\u00d3N", desc: "Incorporamos tecnolog\u00eda y an\u00e1lisis de datos para una mejor toma de decisiones." },
  ],
  en: [
    { titulo: "INTEGRITY", desc: "We act with ethics, honesty and consistency in the management of public information." },
    { titulo: "TRANSPARENCY", desc: "We promote open access to reliable road safety data for all citizens." },
    { titulo: "COMMITMENT", desc: "We work to reduce road crashes and protect people's lives on the roads." },
    { titulo: "SERVICE VOCATION", desc: "We focus our efforts on the needs of institutions and the population." },
    { titulo: "ARTICULATED WORK", desc: "We foster intersectoral and intergovernmental coordination based on evidence." },
    { titulo: "INNOVATION", desc: "We incorporate technology and data analysis for better decision making." },
  ]
};

(async () => {
  const langs = [
    { code: 'ES', comp: comp.es, val: val.es },
    { code: 'EN', comp: comp.en, val: val.en },
  ];

  for (const { code, comp: cp, val: vl } of langs) {
    const updates = [
      q("UPDATE pagina SET seccion6 = ? WHERE idioma = ?", [cp[0].titulo, code]),
      q("UPDATE pagina SET seccion7 = ? WHERE idioma = ?", [cp[0].desc, code]),
      q("UPDATE pagina SET seccion8 = ? WHERE idioma = ?", [cp[1].titulo, code]),
      q("UPDATE pagina SET seccion9 = ? WHERE idioma = ?", [cp[1].desc, code]),
      q("UPDATE pagina SET seccion10 = ? WHERE idioma = ?", [cp[2].titulo, code]),
      q("UPDATE pagina SET seccion11 = ? WHERE idioma = ?", [cp[2].desc, code]),
      q("UPDATE pagina SET seccion12 = ? WHERE idioma = ?", [cp[3].titulo, code]),
      q("UPDATE pagina SET seccion13 = ? WHERE idioma = ?", [cp[3].desc, code]),
      q("UPDATE pagina SET seccion14 = ? WHERE idioma = ?", [vl[0].titulo, code]),
      q("UPDATE pagina SET seccion15 = ? WHERE idioma = ?", [vl[0].desc, code]),
      q("UPDATE pagina SET seccion16 = ? WHERE idioma = ?", [vl[1].titulo, code]),
      q("UPDATE pagina SET seccion17 = ? WHERE idioma = ?", [vl[1].desc, code]),
      q("UPDATE pagina SET seccion18 = ? WHERE idioma = ?", [vl[2].titulo, code]),
      q("UPDATE pagina SET seccion19 = ? WHERE idioma = ?", [vl[2].desc, code]),
      q("UPDATE pagina SET seccion20 = ? WHERE idioma = ?", [vl[3].titulo, code]),
      q("UPDATE pagina SET seccion21 = ? WHERE idioma = ?", [vl[3].desc, code]),
      q("UPDATE pagina SET seccion22 = ? WHERE idioma = ?", [vl[4].titulo, code]),
      q("UPDATE pagina SET seccion23 = ? WHERE idioma = ?", [vl[4].desc, code]),
      q("UPDATE pagina SET seccion24 = ? WHERE idioma = ?", [vl[5].titulo, code]),
      q("UPDATE pagina SET seccion25 = ? WHERE idioma = ?", [vl[5].desc, code]),
    ];
    await Promise.all(updates);
    console.log('Seed ' + code + ' OK');
  }

  const r = await q("SELECT idioma, seccion4, seccion6, seccion7, seccion14, seccion15 FROM pagina");
  console.log(JSON.stringify(r, null, 2));
  conn.end();
})();