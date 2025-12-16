// public/script.js

document.addEventListener('DOMContentLoaded', () => {
    const formVehiculo = document.getElementById('form-registro-vehiculo');
    const formMantenimiento = document.getElementById('form-registro-mantenimiento');
    const mensajeRegistroVehiculo = document.getElementById('mensaje-registro');
    const mensajeRegistroMantenimiento = document.getElementById('mensaje-mantenimiento');
    const selectVehiculo = document.getElementById('select-vehiculo');

    // --- Funciones de Carga de Datos ---

    async function cargarVehiculos() {
        const tablaBody = document.getElementById('tabla-vehiculos').querySelector('tbody');
        tablaBody.innerHTML = ''; 
        selectVehiculo.innerHTML = '<option value="">-- Seleccione un Vehículo --</option>';

        try {
            const response = await fetch('/api/vehiculos');
            const vehiculos = await response.json();

            vehiculos.forEach(vehiculo => {
                // Rellenar la Tabla
                const row = tablaBody.insertRow();
                row.insertCell().textContent = vehiculo.id;
                row.insertCell().textContent = vehiculo.marca;
                row.insertCell().textContent = vehiculo.modelo;
                row.insertCell().textContent = vehiculo.anio;
                row.insertCell().textContent = vehiculo.kilometraje_actual;

                // Botón de Acciones
                const actionCell = row.insertCell();
                const btnHistorial = document.createElement('button');
                btnHistorial.textContent = 'Ver Historial';
                btnHistorial.classList.add('btn-historial');
                btnHistorial.onclick = () => verHistorial(vehiculo.id, `${vehiculo.marca} ${vehiculo.modelo}`);
                actionCell.appendChild(btnHistorial);


                // Rellenar el Select de Mantenimientos
                const option = document.createElement('option');
                option.value = vehiculo.id;
                option.textContent = `${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.anio})`;
                selectVehiculo.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar vehículos:', error);
            tablaBody.innerHTML = '<tr><td colspan="6">Error al cargar la lista.</td></tr>';
        }
    }


    // --- Lógica para Registrar VEHÍCULO ---

    formVehiculo.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nuevoVehiculo = {
            marca: document.getElementById('marca').value,
            modelo: document.getElementById('modelo').value,
            anio: parseInt(document.getElementById('anio').value),
            kilometraje_actual: parseFloat(document.getElementById('km').value)
        };

        try {
            const response = await fetch('/api/vehiculos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoVehiculo),
            });

            const data = await response.json();

            if (response.ok) {
                mensajeRegistroVehiculo.textContent = `¡Vehículo registrado con éxito! ID: ${data.id}`;
                mensajeRegistroVehiculo.style.color = 'green';
                formVehiculo.reset(); 
                cargarVehiculos(); // Recargar la lista y el select
            } else {
                mensajeRegistroVehiculo.textContent = `Error: ${data.error || 'No se pudo guardar.'}`;
                mensajeRegistroVehiculo.style.color = 'red';
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            mensajeRegistroVehiculo.textContent = 'Error de conexión con el servidor.';
            mensajeRegistroVehiculo.style.color = 'red';
        }
    });


    // --- Lógica para Registrar MANTENIMIENTO ---

    formMantenimiento.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nuevoMantenimiento = {
            vehiculo_id: parseInt(selectVehiculo.value),
            tipo_mantenimiento: document.getElementById('tipo-mantenimiento').value,
            fecha_realizacion: document.getElementById('fecha-mantenimiento').value,
            costo: parseFloat(document.getElementById('costo').value),
            notas: document.getElementById('notas').value
        };

        if (!nuevoMantenimiento.vehiculo_id) {
            mensajeRegistroMantenimiento.textContent = 'Por favor, seleccione un vehículo.';
            mensajeRegistroMantenimiento.style.color = 'red';
            return;
        }

        try {
            const response = await fetch('/api/mantenimientos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoMantenimiento),
            });

            const data = await response.json();

            if (response.ok) {
                mensajeRegistroMantenimiento.textContent = '¡Mantenimiento registrado con éxito!';
                mensajeRegistroMantenimiento.style.color = 'green';
                formMantenimiento.reset();
            } else {
                mensajeRegistroMantenimiento.textContent = `Error: ${data.error || 'No se pudo guardar el mantenimiento.'}`;
                mensajeRegistroMantenimiento.style.color = 'red';
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            mensajeRegistroMantenimiento.textContent = 'Error de conexión con el servidor.';
            mensajeRegistroMantenimiento.style.color = 'red';
        }
    });

    // --- Lógica para VER HISTORIAL (Épica 2) ---

    async function verHistorial(vehiculoId, vehiculoNombre) {
        const historialSection = document.getElementById('historial-mantenimientos');
        const tablaBody = document.getElementById('tabla-mantenimientos').querySelector('tbody');
        const historialTitulo = document.getElementById('historial-titulo');
        const historialVacio = document.getElementById('historial-vacio');
        
        historialSection.style.display = 'block';
        historialTitulo.textContent = `3. Historial de Mantenimientos para: ${vehiculoNombre}`;
        tablaBody.innerHTML = '';
        historialVacio.style.display = 'none';

        try {
            const response = await fetch(`/api/mantenimientos/${vehiculoId}`);
            const mantenimientos = await response.json();

            if (mantenimientos.length === 0) {
                historialVacio.style.display = 'block';
            } else {
                mantenimientos.forEach(m => {
                    const row = tablaBody.insertRow();
                    row.insertCell().textContent = m.fecha_realizacion;
                    row.insertCell().textContent = m.tipo_mantenimiento;
                    row.insertCell().textContent = `$${m.costo.toFixed(2)}`;
                    row.insertCell().textContent = m.notas || 'Sin notas';
                });
            }
        } catch (error) {
            console.error('Error al cargar historial:', error);
            historialVacio.textContent = 'Error al cargar el historial.';
            historialVacio.style.display = 'block';
        }
    }

    // Cargar datos iniciales
    cargarVehiculos();
});