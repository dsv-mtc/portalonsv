const mysql = require("mysql");
const dotenv = require("dotenv");
const util = require("util");
dotenv.config();

const connection = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});
const query = util.promisify(connection.query).bind(connection);

connection.connect(async (err) => {
  if (err) {
    console.error("Error de conexión:", err);
    process.exit(1);
  }
  console.log("Conectado a MySQL");

  try {
    const existing = await query("SELECT id, descripcion FROM menu ORDER BY id");
    console.log("\nMenús existentes:");
    const menuMap = {};
    existing.forEach((m) => {
      menuMap[m.descripcion] = m.id;
      console.log(`  ${m.id}: ${m.descripcion}`);
    });

    const getMenuId = (name) => {
      if (!menuMap[name]) throw new Error(`No se encontró el menú: "${name}"`);
      return menuMap[name];
    };

    const insertMenuIfMissing = async (name) => {
      if (!menuMap[name]) {
        const r = await query("INSERT INTO menu (descripcion, estaActivo) VALUES (?, 1)", [name]);
        menuMap[name] = r.insertId;
        console.log(`  [+] Menú creado: "${name}" (id=${r.insertId})`);
      }
    };

    await insertMenuIfMissing("SINIESTRALIDAD FATAL (ONSV)");
    await insertMenuIfMissing("AUTORIZACIONES");
    await insertMenuIfMissing("MOVILIDAD ACTIVA");

    console.log("\n→ Eliminando submenús existentes para los menús afectados...");
    const affectedMenuNames = [
      "ESTADISTICA DE SINIESTRALIDAD",
      "SINIESTRALIDAD FATAL (ONSV)",
      "AUTORIZACIONES",
      "CONCESIONARIAS",
      "CAPACITACION A CONDUCTORES",
      "ENTORNOS VIALES",
      "MOVILIDAD ACTIVA",
    ];
    const affectedIds = affectedMenuNames.map(getMenuId);
    const delResult = await query("DELETE FROM submenu WHERE menu_id IN (?)", [affectedIds]);
    console.log(`  ${delResult.affectedRows} registros eliminados`);

    console.log("\n→ Insertando submenús...");

    const insertSub = async (menuName, submenu, rutabi, linkvideo, linkpdf, imagen, estado) => {
      const menuId = getMenuId(menuName);
      await query(
        "INSERT INTO submenu (descripcion, menu_id, rutabi, linkvideo, linkpdf, imagen, estado, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
        [submenu, menuId, rutabi, linkvideo, linkpdf, imagen, estado ? 1 : 0]
      );
    };

    // ── ESTADÍSTICA DE SINIESTRALIDAD ──
    const est = "ESTADISTICA DE SINIESTRALIDAD";
    await insertSub(est, "Siniestralidad",
      "https://app.powerbi.com/view?r=eyJrIjoiNmNjM2EwNzUtNDA0My00ODY0LWI1NGUtODgyZjlkOWVhNDU5IiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9&pageName=5df93c0c69acca182922",
      "https://app.powerbi.com/view?r=eyJrIjoiNmNjM2EwNzUtNDA0My00ODY0LWI1NGUtODgyZjlkOWVhNDU5IiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9&pageName=5df93c0c69acca182922",
      "https://app.powerbi.com/view?r=eyJrIjoiNmNjM2EwNzUtNDA0My00ODY0LWI1NGUtODgyZjlkOWVhNDU5IiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9&pageName=5df93c0c69acca182922",
      "/estaticos/img/IMAGEN_GRUPO_SINIESTRALIDAD.png", true);
    await insertSub(est, "Vehículos",
      "https://app.powerbi.com/view?r=eyJrIjoiNmNjM2EwNzUtNDA0My00ODY0LWI1NGUtODgyZjlkOWVhNDU5IiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9&pageName=a133fa58d44bbc3df61d",
      "https://app.powerbi.com/view?r=eyJrIjoiNmNjM2EwNzUtNDA0My00ODY0LWI1NGUtODgyZjlkOWVhNDU5IiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9&pageName=a133fa58d44bbc3df61d",
      "https://app.powerbi.com/view?r=eyJrIjoiNmNjM2EwNzUtNDA0My00ODY0LWI1NGUtODgyZjlkOWVhNDU5IiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9&pageName=a133fa58d44bbc3df61d",
      "/estaticos/img/VEHICULOS SEGUROS.png", true);
    await insertSub(est, "Usuarios",
      "https://app.powerbi.com/view?r=eyJrIjoiNmNjM2EwNzUtNDA0My00ODY0LWI1NGUtODgyZjlkOWVhNDU5IiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9&pageName=ccd0b666eb5cee31c0c6",
      "https://app.powerbi.com/view?r=eyJrIjoiNmNjM2EwNzUtNDA0My00ODY0LWI1NGUtODgyZjlkOWVhNDU5IiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9&pageName=ccd0b666eb5cee31c0c6",
      "https://app.powerbi.com/view?r=eyJrIjoiNmNjM2EwNzUtNDA0My00ODY0LWI1NGUtODgyZjlkOWVhNDU5IiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9&pageName=ccd0b666eb5cee31c0c6",
      "/estaticos/img/usauriosvias.png", true);
    await insertSub(est, "Siniestralidad: Lima Metropolitana",
      "https://app.powerbi.com/view?r=eyJrIjoiMzk1ODkwNWUtZTExNC00MzRhLWFhZjgtOTYxNWQyM2I4ODIxIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "https://app.powerbi.com/view?r=eyJrIjoiMzk1ODkwNWUtZTExNC00MzRhLWFhZjgtOTYxNWQyM2I4ODIxIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "https://app.powerbi.com/view?r=eyJrIjoiMzk1ODkwNWUtZTExNC00MzRhLWFhZjgtOTYxNWQyM2I4ODIxIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "/estaticos/img/1 IMAGEN_GRUPO_SINIESTRALIDAD.png", true);
    await insertSub(est, "Vehículos: Lima Metropolitana",
      "https://app.powerbi.com/view?r=eyJrIjoiOWQ1MjJhMmUtODE3Ny00MjRhLWE4MmEtZmJiMTk4ZTA5ZDdhIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "https://app.powerbi.com/view?r=eyJrIjoiOWQ1MjJhMmUtODE3Ny00MjRhLWE4MmEtZmJiMTk4ZTA5ZDdhIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "https://app.powerbi.com/view?r=eyJrIjoiOWQ1MjJhMmUtODE3Ny00MjRhLWE4MmEtZmJiMTk4ZTA5ZDdhIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "/estaticos/img/2 VEHICULOS SEGUROS.png", true);
    await insertSub(est, "Usuarios: Lima Metropolitana",
      "https://app.powerbi.com/view?r=eyJrIjoiOWE3ZWVlMzktNDA3MS00NWQ5LThiY2YtN2M1MmRmYTA3MzVlIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "https://app.powerbi.com/view?r=eyJrIjoiOWE3ZWVlMzktNDA3MS00NWQ5LThiY2YtN2M1MmRmYTA3MzVlIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "https://app.powerbi.com/view?r=eyJrIjoiOWE3ZWVlMzktNDA3MS00NWQ5LThiY2YtN2M1MmRmYTA3MzVlIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "/estaticos/img/3 usauriosvias.png", true);

    // ── SINIESTRALIDAD FATAL (ONSV) ──
    const fatal = "SINIESTRALIDAD FATAL (ONSV)";
    await insertSub(fatal, "Resumen",
      "https://app.powerbi.com/view?r=eyJrIjoiOTcwNjg5MmEtMzEzMC00ZWRiLTg2ZmUtMTAxYmNmM2UzNzc3IiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "https://app.powerbi.com/view?r=eyJrIjoiOTcwNjg5MmEtMzEzMC00ZWRiLTg2ZmUtMTAxYmNmM2UzNzc3IiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "https://app.powerbi.com/view?r=eyJrIjoiOTcwNjg5MmEtMzEzMC00ZWRiLTg2ZmUtMTAxYmNmM2UzNzc3IiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "/estaticos/img/IMAGEN_GRUPO_SINIESTRALIDAD.png", true);
    await insertSub(fatal, "Siniestros",
      "https://app.powerbi.com/view?r=eyJrIjoiYzJiMDMxYTctMDdkNy00MzMwLWIyNGEtZDM4ZWZhMmQ1NWRiIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "https://app.powerbi.com/view?r=eyJrIjoiYzJiMDMxYTctMDdkNy00MzMwLWIyNGEtZDM4ZWZhMmQ1NWRiIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "https://app.powerbi.com/view?r=eyJrIjoiYzJiMDMxYTctMDdkNy00MzMwLWIyNGEtZDM4ZWZhMmQ1NWRiIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "/estaticos/img/IMAGENES PARA LA WEB DEL ONSV_ACCIDENTES.png", true);
    await insertSub(fatal, "Vehículos",
      "https://app.powerbi.com/view?r=eyJrIjoiYjBhYzhkNzMtZGFiYS00OWNjLWExNTQtNzAyNjdhZGIyM2ExIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "https://app.powerbi.com/view?r=eyJrIjoiYjBhYzhkNzMtZGFiYS00OWNjLWExNTQtNzAyNjdhZGIyM2ExIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "https://app.powerbi.com/view?r=eyJrIjoiYjBhYzhkNzMtZGFiYS00OWNjLWExNTQtNzAyNjdhZGIyM2ExIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "/estaticos/img/VEHICULOS SEGUROS.png", true);
    await insertSub(fatal, "Usuarios de Vías",
      "https://app.powerbi.com/view?r=eyJrIjoiNzYwYjRiNDItMGJjZi00ZGIzLWE1ZjItMzM0NjI0YWU0ZmI2IiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "https://app.powerbi.com/view?r=eyJrIjoiNzYwYjRiNDItMGJjZi00ZGIzLWE1ZjItMzM0NjI0YWU0ZmI2IiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "https://app.powerbi.com/view?r=eyJrIjoiNzYwYjRiNDItMGJjZi00ZGIzLWE1ZjItMzM0NjI0YWU0ZmI2IiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "/estaticos/img/usauriosvias.png", true);
    await insertSub(fatal, "Grado de Severidad",
      "https://app.powerbi.com/view?r=eyJrIjoiMDQ5ZWQ1YmEtMzM1MC00NGI3LTgxMTEtZWQ1MjEwOTM4Y2RiIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "https://app.powerbi.com/view?r=eyJrIjoiMDQ5ZWQ1YmEtMzM1MC00NGI3LTgxMTEtZWQ1MjEwOTM4Y2RiIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "https://app.powerbi.com/view?r=eyJrIjoiMDQ5ZWQ1YmEtMzM1MC00NGI3LTgxMTEtZWQ1MjEwOTM4Y2RiIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "/estaticos/img/IMAGENES PARA LA WEB DEL ONSV_GRADO DE SEVERIDAD.png", true);
    await insertSub(fatal, "Mapa de Siniestros",
      "https://app.powerbi.com/view?r=eyJrIjoiZDQ1NzMyMWMtMDExNi00OGU3LWE3YjktN2ZhZDc4ZDk1ZTUyIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "https://app.powerbi.com/view?r=eyJrIjoiZDQ1NzMyMWMtMDExNi00OGU3LWE3YjktN2ZhZDc4ZDk1ZTUyIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "https://app.powerbi.com/view?r=eyJrIjoiZDQ1NzMyMWMtMDExNi00OGU3LWE3YjktN2ZhZDc4ZDk1ZTUyIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "/estaticos/img/IMAGENES PARA LA WEB DEL ONSV_MAPA DE ACCIDENTES.png", true);

    // ── AUTORIZACIONES ──
    const aut = "AUTORIZACIONES";
    await insertSub(aut, "INSPECCIONES TECNICAS",
      "https://www.onsv.gob.pe/analitica/",
      "https://www.onsv.gob.pe/analitica/",
      "https://www.onsv.gob.pe/analitica/",
      "/estaticos/img/IMAGENES PARA LA WEB DEL ONSV_en construcción 4.png", false);
    await insertSub(aut, "LICENCIAS DE CONDUCIR",
      "https://www.onsv.gob.pe/analitica/",
      "https://www.onsv.gob.pe/analitica/",
      "https://www.onsv.gob.pe/analitica/",
      "/estaticos/img/IMAGENES PARA LA WEB DEL ONSV_en construcción 5.png", false);
    await insertSub(aut, "AUTORIZACIONES EN TRANSPORTE TERRESTRE",
      "https://www.onsv.gob.pe/analitica/",
      "https://www.onsv.gob.pe/analitica/",
      "https://www.onsv.gob.pe/analitica/",
      "/estaticos/img/IMAGENES PARA LA WEB DEL ONSV_en construcción 6.png", false);

    // ── CONCESIONARIAS ──
    const conc = "CONCESIONARIAS";
    await insertSub(conc, "Resumen",
      "https://app.powerbi.com/view?r=eyJrIjoiZTViMzIxODgtMzZiYS00Njc3LWJlMWMtYTk2Y2ZjZmMzNDljIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "https://app.powerbi.com/view?r=eyJrIjoiZTViMzIxODgtMzZiYS00Njc3LWJlMWMtYTk2Y2ZjZmMzNDljIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "https://app.powerbi.com/view?r=eyJrIjoiZTViMzIxODgtMzZiYS00Njc3LWJlMWMtYTk2Y2ZjZmMzNDljIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "/estaticos/img/IMAGENES WEB ONSV_RESUMEN.png", true);
    await insertSub(conc, "Siniestros",
      "https://app.powerbi.com/view?r=eyJrIjoiZmIzNGIzZjctMWZhNy00ODdjLWI2YjAtNTdiOGVhY2Y5MjBlIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "https://app.powerbi.com/view?r=eyJrIjoiZmIzNGIzZjctMWZhNy00ODdjLWI2YjAtNTdiOGVhY2Y5MjBlIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "https://app.powerbi.com/view?r=eyJrIjoiZmIzNGIzZjctMWZhNy00ODdjLWI2YjAtNTdiOGVhY2Y5MjBlIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "/estaticos/img/IMAGENES WEB ONSV_SINIESTRO.png", true);
    await insertSub(conc, "Involucrados",
      "https://app.powerbi.com/view?r=eyJrIjoiMDkxYjRjYzQtYjYzMC00YTBiLTk4MWYtNTgwMmNmZWViMTc3IiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "https://app.powerbi.com/view?r=eyJrIjoiMDkxYjRjYzQtYjYzMC00YTBiLTk4MWYtNTgwMmNmZWViMTc3IiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "https://app.powerbi.com/view?r=eyJrIjoiMDkxYjRjYzQtYjYzMC00YTBiLTk4MWYtNTgwMmNmZWViMTc3IiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "/estaticos/img/IMAGENES WEB ONSV_INVOLUCRADOS.png", true);

    // ── CAPACITACIÓN A CONDUCTORES ──
    const cap = "CAPACITACION A CONDUCTORES";
    await insertSub(cap, "Curso de Seguridad Vial",
      "https://app.powerbi.com/view?r=eyJrIjoiN2U3ZWQ5MGUtYTM4NS00Y2I3LThhMDUtZTljZGM4OTE0ZGMyIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "",
      "",
      "/estaticos/img/imagenes ONSV_Mesa de trabajo 1 copia.png", true);

    // ── ENTORNOS VIALES ──
    const env = "ENTORNOS VIALES";
    await insertSub(env, "Análisis de Percepción",
      "https://app.powerbi.com/view?r=eyJrIjoiNmMyMDY0YTMtOGRiOS00YWZmLTkzNTEtZTJhODk0YmZhYjA1IiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "https://app.powerbi.com/view?r=eyJrIjoiNmMyMDY0YTMtOGRiOS00YWZmLTkzNTEtZTJhODk0YmZhYjA1IiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "https://app.powerbi.com/view?r=eyJrIjoiNmMyMDY0YTMtOGRiOS00YWZmLTkzNTEtZTJhODk0YmZhYjA1IiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "/estaticos/img/IMAGENES PARA EL ONSV - Entorno Seguro Viales-03.png", true);

    // ── MOVILIDAD ACTIVA ──
    const mov = "MOVILIDAD ACTIVA";
    await insertSub(mov, "PUBLICACIONES",
      "https://plantilla.techsyse.pe/movilidadactiva/",
      "https://plantilla.techsyse.pe/movilidadactiva/",
      "https://plantilla.techsyse.pe/movilidadactiva/",
      "/estaticos/img/Imagen7.jpg", false);
    await insertSub(mov, "Analítica",
      "https://app.powerbi.com/view?r=eyJrIjoiYWIwMTkyNGUtZmZlZi00ODZmLThhNDctY2U3MjY1Mjc5YzJjIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "https://app.powerbi.com/view?r=eyJrIjoiYWIwMTkyNGUtZmZlZi00ODZmLThhNDctY2U3MjY1Mjc5YzJjIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "https://app.powerbi.com/view?r=eyJrIjoiYWIwMTkyNGUtZmZlZi00ODZmLThhNDctY2U3MjY1Mjc5YzJjIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9",
      "/estaticos/img/Imagen5.jpg", true);

    console.log("\n=== RESUMEN FINAL ===");
    const summary = await query(`
      SELECT m.descripcion AS menu, s.descripcion AS submenu, s.estado, s.rutabi, s.linkvideo, s.linkpdf, s.imagen
      FROM submenu s
      JOIN menu m ON m.id = s.menu_id
      WHERE m.descripcion IN (?, ?, ?, ?, ?, ?, ?)
      ORDER BY m.id, s.id
    `, [est, fatal, aut, conc, cap, env, mov]);
    summary.forEach((r) => {
      console.log(`  [${r.estado ? "ACT" : "INA"}] ${r.menu} → ${r.submenu} | img: ${r.imagen}`);
    });
    console.log(`\nTotal: ${summary.length} submenús insertados`);

    console.log("\n✓ Script completado exitosamente");
  } catch (e) {
    console.error("Error:", e);
    process.exit(1);
  } finally {
    connection.end();
  }
});
