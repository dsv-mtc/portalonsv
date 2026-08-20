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
    const categorias = await query("SELECT id, value FROM categoria ORDER BY id");
    const tipos = await query("SELECT id, value FROM tipo ORDER BY id");
    console.log("\nCategorías existentes:", categorias.map(c => `${c.id}:${c.value}`).join(", "));
    console.log("Tipos existentes:", tipos.map(t => `${t.id}:${t.value}`).join(", "));

    const catMap = {};
    categorias.forEach(c => { catMap[c.value] = c.id; });
    const tipoMap = {};
    tipos.forEach(t => { tipoMap[t.value] = t.id; });

    const ensureCategoria = async (name) => {
      if (!catMap[name]) {
        const r = await query("INSERT INTO categoria (value, estaActivo) VALUES (?, 1)", [name]);
        catMap[name] = r.insertId;
        console.log(`  [+] Categoría creada: "${name}" (id=${r.insertId})`);
      }
      return catMap[name];
    };

    const ensureTipo = async (name) => {
      if (!tipoMap[name]) {
        const r = await query("INSERT INTO tipo (value, estaActivo) VALUES (?, 1)", [name]);
        tipoMap[name] = r.insertId;
        console.log(`  [+] Tipo creado: "${name}" (id=${r.insertId})`);
      }
      return tipoMap[name];
    };

    const idSiniestros = await ensureCategoria("Siniestros");
    const idPersonas = await ensureCategoria("Personas Involucradas");
    const idVehiculos = await ensureCategoria("Vehículos Involucrados");
    const idDataset = await ensureTipo("Dataset");

    const ymdToDmy = (ymd) => {
      const [y, m, d] = ymd.split("-");
      return `${d}/${m}/${y}`;
    };

    const insertFile = async (title, author, description, idCat, idTipo, excelfile, fecha) => {
      await query(
        "INSERT INTO files (title, author, description, idCategoria, idTipo, excelfile, pdffile, csvfile, shapefile, fecha) VALUES (?, ?, ?, ?, ?, ?, 'null', 'null', 'null', ?)",
        [title, author, description, idCat, idTipo, excelfile, ymdToDmy(fecha)]
      );
    };

    console.log("\n→ Insertando datasets...");

    await insertFile(
      "HISTORICO DE SINIESTROS DE TRÁNSITO 2008-2025 (Preliminar)",
      "ONSV",
      "Resumen histórico de información de siniestros de tránsito, ocurridos a nivel nacional, 2008 - 2025. Las cifras toman como fuente de información los Anuarios Estadísticos de la PNP. Nota: Las cifras del periodo 2025 son preliminares de Enero a Octubre",
      idSiniestros, idDataset,
      "/estaticos/excel/PERU. SINIESTROS DE TRANSITO POR AÑO_2008-2025_preliminar.xlsx",
      "2025-12-18"
    );

    await insertFile(
      "PERSONAS INVOLUCRADAS EN SINIESTROS DE TRÁNSITO FATALES 2021-2025 (PRELIMINAR)",
      "ONSV",
      "Detalle de personas involucradas en siniestros de tránsito con consecuencias fatales, ocurridos a nivel nacional, 2021 - 2025 (preliminar)",
      idPersonas, idDataset,
      "/estaticos/excel/BBDD ONSV - PERSONAS 2021-2025 (preliminar).xlsx",
      "2026-02-27"
    );

    await insertFile(
      "VEHÍCULOS INVOLUCRADOS EN SINIESTROS DE TRÁNSITO FATALES 2021-2025 (preliminar)",
      "ONSV",
      "Detalle de los vehículos involucrados en siniestros de tránsito con consecuencias fatales, ocurridos a nivel nacional, 2021 - 2025 (preliminar).",
      idVehiculos, idDataset,
      "/estaticos/excel/BBDD ONSV - VEHICULOS 2021-2025 (preliminar).xlsx",
      "2026-02-27"
    );

    await insertFile(
      "SINIESTROS DE TRANSITO FATALES 2021-2025 (preliminar)",
      "ONSV",
      "Detalle de siniestros de tránsito con consecuencias fatales, ocurridos a nivel nacional, 2021 - 2025 (preliminar).",
      idSiniestros, idDataset,
      "/estaticos/excel/BBDD ONSV - SINIESTROS FATALES 2021-2025 (preliminar).xlsx",
      "2026-02-27"
    );

    console.log("\n=== RESUMEN ===");
    const all = await query("SELECT f.id, f.title titulo, c.value categoria, t.value tipo, f.fecha FROM files f LEFT JOIN categoria c ON c.id = f.idCategoria LEFT JOIN tipo t ON t.id = f.idTipo ORDER BY f.id DESC LIMIT 6");
    all.forEach(r => console.log(`  ${r.id}: [${r.categoria}] [${r.tipo}] ${r.titulo} | ${r.fecha}`));
    console.log(`\n✓ 4 datasets insertados`);

  } catch (e) {
    console.error("Error:", e);
    process.exit(1);
  } finally {
    connection.end();
  }
});
