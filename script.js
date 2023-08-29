// Esta entrega simula un portal de cotizacion de prestamo con amortizacion frances.

// Creo las variables necesarias 
const formulario = document.querySelector('.formulario-cotizador');
const nombreUsuario = document.getElementById('nombre');
const email = document.getElementById('email');
const tipoPrestamo = document.getElementById('tipoPrestamo');
const monto = document.getElementById('montoPrestamo');
const cuotas = document.getElementById('cuotas');
const interes = document.getElementById('tasaInteres');
const btnConsultar = document.getElementById('btnConsultar');
const btnNuevaConsul = document.getElementById('btnNuevaConsul');
const btnEnvio = document.getElementById('btnEnvio');
const generaTabla = document.querySelector('#genera-tabla tbody');
const indicadorCarga = document.getElementById('indicador-carga');
const historialConsultas = document.addEventListener('DOMContentLoaded', mostrarHistorialDeCotizaciones);
const apiMap = document.getElementById('map');

// Creo el array de tipos de préstamo
function obtenerTiposDePrestamo() {
    return ['Personal', 'Hipotecario', 'Automotriz'];
}

// Función para obtener el tipo de préstamo seleccionado por el usuario
function obtenerTipoPrestamoElegido() {
    const tipoPrestamoSeleccionado = tipoPrestamo.value;
    const tiposDePrestamo = obtenerTiposDePrestamo();
    let tipoPrestamoElegido = null;

    tiposDePrestamo.forEach((tipo) => {
        if (tipo === tipoPrestamoSeleccionado) {
            tipoPrestamoElegido = tipo;
        }
    });
    return tipoPrestamoElegido;
}

// Función que valida que se selecciono un tipo de prestamo
function validarTipoPrestamo() {
    const tipoPrestamoSeleccionado = obtenerTipoPrestamoElegido();

    if (tipoPrestamoSeleccionado === null) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, elige un tipo de préstamo antes de calcular.',
        });
        return false;
    }
    return true;
}

function mostrarCotizacionEnTabla(cuotaId, saldo, cuota, pagoCapital, pagoInteres, pagoIva, cuotaTotal){
    // Genero la informacion que se volcara en la tabla de cuotas del prestamo donde agrego un id cuota para saber que numero de cuota es
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${cuotaId}</td>
        <td>${saldo.toFixed(2)}</td>
        <td>${cuota.toFixed(2)}</td>
        <td>${pagoCapital.toFixed(2)}</td>
        <td>${pagoInteres.toFixed(2)}</td>
        <td>${pagoIva.toFixed(2)}</td>
        <td>${cuotaTotal.toFixed(2)}</td>
    `;
    generaTabla.appendChild(row);
}

// Función para mostrar el historial de cotizaciones
function mostrarHistorialDeCotizaciones() {
    const cotizacionesGuardadas = JSON.parse(localStorage.getItem('cotizaciones'));

    if (cotizacionesGuardadas && cotizacionesGuardadas.length > 0) {
        let historialHTML = '<h2>Historial de Consultas</h2><ul>';

        cotizacionesGuardadas.forEach((cotizacion, index) => {
            historialHTML += `<li><strong>Cotización ${index + 1}:</strong> Monto de Préstamo: ${cotizacion.monto}, Cantidad de Cuotas: ${cotizacion.cuotas}, Tipo de Préstamo: ${cotizacion.tipoPrestamo}</li>`;
        });

        historialHTML += '</ul>';
        document.getElementById('historialConsultas').innerHTML = historialHTML;
    } else {
        document.getElementById('historialConsultas').innerHTML = '<p>No hay consultas previas.</p>';
    }
}

// Función que valido si el valor ingresado es numerico
function esNumero(valor) {
    return !isNaN(valor);
}

// Funcion que muestra un alerta de error por formato de dato ingresado
function mostrarAlertaError(mensajeError){
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: mensajeError,
    })
}

// Función para mostrar el indicador de carga
function mostrarIndicadorDeCarga() {
    indicadorCarga.classList.add('indicador-carga-visible');
    indicadorCarga.classList.remove('indicador-carga-oculto');
}

// Función para ocultar el indicador de carga
function ocultarIndicadorDeCarga() {
    indicadorCarga.classList.remove('indicador-carga-visible');
    indicadorCarga.classList.add('indicador-carga-oculto');
}

// Función que simula una operación asincrónica de cálculo de cuotas
function calcularCuotasAsincrono(monto, interes, cuotas) {
    return new Promise((resolve, reject) => {
        // Muestra el indicador de carga antes de la operación asincrónica
        mostrarIndicadorDeCarga();

        // Simulamos una demora de 3 segundos en el cálculo
        setTimeout(() => {
            try {
                const cuotasCalculadas = calcularValorCuota(monto, interes, cuotas);

                // Oculta el indicador de carga después de completar la operación asincrónica
                ocultarIndicadorDeCarga();

                resolve(cuotasCalculadas);
            } catch (error) {
                // Si hay un error, también ocultamos el indicador de carga y rechazamos la promesa
                ocultarIndicadorDeCarga();
                reject(error);
            }
        }, 4000);
    });
}


// Funcion del calculo de la cuota para el prestamo personal
function calcularValorCuota(monto, interes, cuotas){
    const tipoPrestamoElegido = obtenerTipoPrestamoElegido();

    return new Promise((resolve, reject) => {
        let pagoInteres = 0, pagoCapital = 0, cuota = 0, cuotaId = 1;
        let saldo = monto;

        cuota = monto * (Math.pow(1+((interes/100)/12), cuotas)*((interes/100)/12))/(Math.pow(1+((interes/100)/12), cuotas)-1);

        if (cuotas < 12 || cuotas > 60) {
            reject('La cantidad de cuotas debe estar entre 12 y 60.');
            return;
        }

        // Realizo un for para que me complete el desarrollo del prestamo y veamos todas las cuotas del prestamo
        for(let i = 1; i <= cuotas; i++) {
            pagoInteres = parseFloat(saldo*((interes/100)/12));
            pagoIva = pagoInteres * 0.21;
            pagoCapital = cuota - pagoInteres;
            saldo = parseFloat(saldo-pagoCapital);
            cuotaTotal = cuota + pagoIva;

            // Llama a la función para mostrar la cotización en la tabla
            mostrarCotizacionEnTabla(cuotaId, saldo, cuota, pagoCapital, pagoInteres, pagoIva, cuotaTotal);
            cuotaId++;
        }

        // Creo clase contizacion 
        class Cotizacion {
            constructor(nombre, email, tipoPrestamo, monto, cuotas, interes){
                this.nombre = nombre
                this.email = email
                this.tipoPrestamo = tipoPrestamo
                this.monto = monto
                this.cuotas = cuotas
                this.interes =  interes
            }
        };
                
        // Obtengo cotizaciones almacenadas en el localStorage
        let cotizaciones = localStorage.getItem('cotizaciones');
        if (cotizaciones) {
            cotizaciones = JSON.parse(cotizaciones);
        } else {
            cotizaciones = [];
        } 
        
        // Agrego cotizacion actual al array de cotizaciones y ademas intancio la clase
        const cotizacionNueva = new Cotizacion(nombreUsuario.value.toLowerCase(), email.value.toLowerCase(), tipoPrestamoElegido, monto, cuotas, interes);
        cotizaciones.push(cotizacionNueva)

        
        //cotizaciones.push(new Cotizacion(nombreUsuario.value.toLowerCase(), email.value.toLowerCase(), tipoPrestamoElegido, monto, cuotas, interes));

        // Almaceno las cotizaciones en el localStorage
        localStorage.setItem('cotizaciones', JSON.stringify(cotizaciones));
        resolve();        
    })   

} 

const coord = {lat: -34.60346984863281 , lng: -58.38208770751953};
let map;
let marker;
function iniciarMap(){
    map = new google.maps.Map(apiMap,{
        center: coord,
        zoom: 10,
    });
    marker = new google.maps.Marker({
        position: coord,
        map: map,
    });
}


// Creo evento 'click' del botón Consultar
btnConsultar.addEventListener('click', async (event) => {
    event.preventDefault();

    if (!esNumero(monto.value) || !esNumero(interes.value) || !esNumero(cuotas.value)) {
        mostrarAlertaError('Por favor, ingresa un valor númerico.');
        return;
    }

    // Validar el tipo de préstamo antes de realizar el cálculo
    if (!validarTipoPrestamo()) {
        return;
    }
    // Deshabilita el botón una vez completado el cálculo
    btnConsultar.disabled = true;

    try {
        // Simulamos la demora en el cálculo de cuotas
        mostrarIndicadorDeCarga();
        await calcularCuotasAsincrono(monto.value, interes.value, cuotas.value);
        ocultarIndicadorDeCarga();
    } catch (error) {
        // Muestra Sweet Alert para informar al usuario sobre la cantidad de cuotas incorrecta
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'La cantidad de cuotas debe estar entre 12 y 60.',
        }).then(() => {
            btnConsultar.disabled = false; // Habilita nuevamente el botón "Consultar"
        });
    }     

});

// Creo evento de click
btnNuevaConsul.addEventListener('click', () => {
    formulario.reset();
    calcularValorCuota(monto.value, interes.value, cuotas.value);
    btnConsultar.disabled = false; // Habilita el botón al realizar una nueva consulta
})

// Creo evento de click para mensaje de agradecimiento y confirmación de envío
btnEnvio.addEventListener('click', (event) => {
    event.preventDefault(); // Previene el envío del formulario

    // Mostrar Sweet Alert de confirmación de envío
    Swal.fire({
        icon: 'success',
        title: '¡Correo enviado!',
        text: 'En breve nos vamos a contactor con vos.¡Gracias por usar nuestro cotizador!',
        showConfirmButton: false,
    });
});

// Inicia el mapa de la api de google
window.addEventListener('load', iniciarMap);


