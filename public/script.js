
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-registro-vehiculo');
    const mensajeRegistro = document.getElementById('mensaje-registro');
    
    // Función para obtener y mostrar los vehículos
    async function cargarVehiculos() {
        const tablaBody = document.getElementById('tabla-vehiculos').querySelector('tbody');
        tablaBody.innerHTML = ''; // Limpiar tabla

        try {
            const response = await fetch('/api/vehiculos');
            const vehiculos = await response.json();

            vehiculos.forEach(vehiculo => {
                const row = tablaBody.insertRow();
                row.insertCell().textContent = vehiculo.id;
                row.insertCell().textContent = vehiculo.marca;
                row.insertCell().textContent = vehiculo.modelo;
                row.insertCell().textContent = vehiculo.anio;
                row.insertCell().textContent = vehiculo.kilometraje_actual;
            });
        } catch (error) {
            console.error('Error al cargar vehículos:', error);
            tablaBody.innerHTML = '<tr><td colspan="5">Error al cargar la lista.</td></tr>';
        }
    }

    // Manejar el envío del formulario
    form.addEventListener('submit', async (e) => {
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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(nuevoVehiculo),
            });

            if (response.ok) {
                mensajeRegistro.textContent = '¡Vehículo registrado con éxito!';
                mensajeRegistro.style.color = 'green';
                form.reset(); // Limpiar el formulario
                cargarVehiculos(); // Recargar la lista
            } else {
                const errorData = await response.json();
                mensajeRegistro.textContent = `Error: ${errorData.error || 'No se pudo guardar.'}`;
                mensajeRegistro.style.color = 'red';
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            mensajeRegistro.textContent = 'Error de conexión con el servidor.';
            mensajeRegistro.style.color = 'red';
        }
    });

    // Cargar la lista de vehículos al inicio
    cargarVehiculos();
});