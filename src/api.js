
const express = require('express');
const path = require('path');
const { initDb } = require('./db');

const app = express();
const PORT = 3000;

// Middleware para parsear JSON y servir archivos estáticos (Frontend)
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public'))); // Sirve index.html y otros archivos

let db;

// Función para iniciar la aplicación
async function startApp() {
    try {
        db = await initDb(); // Inicializa la DB y obtiene la conexión
        console.log("Conexión a la DB establecida.");

        // --- RUTAS DE LA API (Épica 1: Gestión de Vehículos) ---

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
                console.error('Error al registrar vehículo:', error);
                res.status(500).json({ error: 'Error interno del servidor' });
            }
        });

        // GET: Obtener la lista de todos los vehículos
        app.get('/api/vehiculos', async (req, res) => {
            try {
                const vehiculos = await db.all('SELECT * FROM Vehiculos');
                res.json(vehiculos);
            } catch (error) {
                console.error('Error al obtener vehículos:', error);
                res.status(500).json({ error: 'Error interno del servidor' });
            }
        });

        // Agrega aquí más rutas para Mantenimientos, etc.

        // Iniciar el servidor
        app.listen(PORT, () => {
            console.log(`Servidor escuchando en http://localhost:${PORT}`);
            // Abre tu navegador y ve a esta dirección para ver el frontend:
            console.log(`Frontend disponible en http://localhost:${PORT}/index.html`);
        });

    } catch (err) {
        console.error("Fallo al iniciar la aplicación:", err.message);
        process.exit(1);
    }
}

startApp();