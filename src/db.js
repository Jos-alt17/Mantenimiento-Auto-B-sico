
const sqlite3 = require('sqlite3').verbose();
const sqlite = require('sqlite');

const DB_PATH = './mantenimiento.db'; // Archivo donde se guardarán los datos

async function initDb() {
    // Abre la conexión a la base de datos
    const db = await sqlite.open({
        filename: DB_PATH,
        driver: sqlite3.Database
    });

    // 1. Crear tabla de VEHÍCULOS
    await db.run(`
        CREATE TABLE IF NOT EXISTS Vehiculos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            marca TEXT NOT NULL,
            modelo TEXT NOT NULL,
            anio INTEGER,
            kilometraje_actual REAL,
            UNIQUE(marca, modelo, anio)
        );
    `);

    // 2. Crear tabla de MANTENIMIENTOS
    await db.run(`
        CREATE TABLE IF NOT EXISTS Mantenimientos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vehiculo_id INTEGER NOT NULL,
            tipo_mantenimiento TEXT NOT NULL,
            fecha_realizacion DATE NOT NULL,
            costo REAL,
            notas TEXT,
            FOREIGN KEY (vehiculo_id) REFERENCES Vehiculos(id)
        );
    `);

    console.log('Base de datos inicializada y tablas creadas.');
    return db; // Devuelve el objeto de conexión
}

module.exports = { initDb };