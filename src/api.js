// src/api.js
const express = require('express');
const path = require('path');
const { initDb } = require('./db');

const app = express();
const PORT = 3000;

// Middleware para parsear JSON y servir archivos estáticos (Frontend)
app.use(express.json());
// La carpeta 'public' contiene el frontend (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '..', 'public'))); 

let db;

// Función para iniciar la aplicación
async function startApp() {
    try {
        db = await initDb(); // Inicializa la DB y obtiene la conexión
        console.log("Conexión a la DB establecida.");

        // -------------------------------------------------------------------
        // --- RUTAS DE LA API (ÉPICA 1: Gestión de Vehículos) ---
        // -------------------------------------------------------------------

        // POST: Registrar un nuevo vehículo
        app.post('/api/vehiculos', async (req, res) => {
            const { marca, modelo, anio, kilometraje_actual } = req.body;
            try {
                const result = await db.run(
                    `INSERT INTO Vehiculos (marca, modelo, anio, kilometraje_actual) 
                     VALUES (?, ?, ?, ?)`,
                    [marca, modelo, anio, kilometraje_actual]
                );
                res.status(201).json({ 
                    id: result.lastID, 
                    message: 'Vehículo registrado con éxito' 
                });
            } catch (error) {
                // El error 19 es generalmente por restricción UNIQUE
                if (error.errno === 19) {
                    return res.status(409).json({ error: 'Este vehículo (Marca, Modelo, Año) ya está registrado.' });
                }
                console.error('Error al registrar vehículo:', error);
                res.status(500).json({ error: 'Error interno del servidor al registrar vehículo' });
            }
        });

        // GET: Obtener la lista de todos los vehículos
        app.get('/api/vehiculos', async (req, res) => {
            try {
                const vehiculos = await db.all('SELECT * FROM Vehiculos ORDER BY id DESC');
                res.json(vehiculos);
            } catch (error) {
                console.error('Error al obtener vehículos:', error);
                res.status(500).json({ error: 'Error interno del servidor' });
            }
        });

        // -------------------------------------------------------------------
        // --- RUTAS DE LA API (ÉPICA 2: Seguimiento de Mantenimientos) ---
        // -------------------------------------------------------------------

        // POST: Registrar un nuevo mantenimiento
        app.post('/api/mantenimientos', async (req, res) => {
            const { vehiculo_id, tipo_mantenimiento, fecha_realizacion, costo, notas } = req.body;
            
            // Validación básica
            if (!vehiculo_id || !tipo_mantenimiento || !fecha_realizacion || !costo) {
                return res.status(400).json({ error: 'Faltan campos obligatorios para el mantenimiento.' });
            }

            try {
                const result = await db.run(
                    `INSERT INTO Mantenimientos (vehiculo_id, tipo_mantenimiento, fecha_realizacion, costo, notas) 
                     VALUES (?, ?, ?, ?, ?)`,
                    [vehiculo_id, tipo_mantenimiento, fecha_realizacion, costo, notas]
                );
                res.status(201).json({ 
                    id: result.lastID, 
                    message: 'Mantenimiento registrado con éxito' 
                });
            } catch (error) {
                console.error('Error al registrar mantenimiento:', error);
                res.status(500).json({ error: 'Error interno del servidor al registrar mantenimiento' });
            }
        });

        // GET: Obtener el historial de mantenimientos de un vehículo (Por ID)
        app.get('/api/mantenimientos/:id', async (req, res) => {
            const vehiculo_id = req.params.id;
            try {
                const mantenimientos = await db.all(
                    `SELECT * FROM Mantenimientos WHERE vehiculo_id = ? ORDER BY fecha_realizacion DESC`,
                    [vehiculo_id]
                );
                res.json(mantenimientos);
            } catch (error) {
                console.error('Error al obtener mantenimientos:', error);
                res.status(500).json({ error: 'Error interno del servidor' });
            }
        });

        // Iniciar el servidor
        app.listen(PORT, () => {
            console.log(`Servidor escuchando en http://localhost:${PORT}`);
            console.log(`Frontend disponible en http://localhost:${PORT}/index.html`);
        });

    } catch (err) {
        console.error("Fallo al iniciar la aplicación:", err.message);
        process.exit(1);
    }
}

startApp();