const express = require ('express');
const app =     express ();

class ErrorServicio {
    constructor (error, ubicacion) {

        // Definir mensaje de error
        switch (typeof error) {
            case 'object': 
                if (error !== null && 'message' in error) this.error = error.message;
                if ('toString' in error)                  this.error = error.toString ();
            break;
            case 'string':  this.error = error; break;
            default:        this.error = 'Formato de error desconocido';
        }
        
        this.ubicacion = ubicacion;
    }

    obtenerError ()     { return this.error }
    obtenerUbicacion () { return this.ubicacion }
}

let CONFIGURACION = {
    PUERTO:         3001,
    CONSULTA_IPADS: null, // URL de API para cosulta del estado de las tablets
    CORREOS_LOG:    null, // Email al cual se enviarán los logs
    URL_EMAIL_LOG:  null, // URL para el envío de emails 
    URL_PUSH:       null, // URL para el envío de las notificaciones
    INTERVALO:      600000 // Intervalo de tiempo en el que se realizará la revisión (10 min)
};

function EnviarNotificacion (iPads_apagadas) {
    return new Promise (async (resolve, reject) => {
        const data = {
            titulo: 'Se detectaron apagadas las siguientes iPads',
            mensaje: iPads_apagadas.join (', ')
        };

        await fetch (CONFIGURACION.URL_PUSH, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify (data)
        })
        .then ((resp) => resp.json ())
        .then ((respuesta) => {

            if (!respuesta.resultado.match (/Notificación enviada/g)) {
                // Posible problema en el servidor
                throw new Error ('Hubo un error en el servidor al enviar la notificación');
            }
            // Notificación enviada correctamente
            resolve ();
        })
        .catch ((error) => {
            reject (error);
        });
    });
}

function RealizarMonitoreo () {
    return new Promise (async (resolve, reject) => {
        let iPads_apagadas = null;

        await fetch (CONFIGURACION.CONSULTA_IPADS)
        .then ((resp) => resp.json ())
        .then (async (iPads) => {
            const iPadsArray = Array.from (iPads);

            // Obtener iPads apagadas
            iPads_apagadas = iPadsArray.filter ((iPad) => iPad.Estado_conexion != 1)
            .map ((iPad) => iPad.Id);
            
            if (iPads_apagadas.length) {

                // Notificar en caso de que haya más de una iPad apagada
                await EnviarNotificacion (iPads_apagadas)
                .catch ((error) => {
                    console.error (error);
                    reject (new ErrorServicio (error, 'EnviarNotificacion')); return;
                });
            }
            // Monitoreo completado
            resolve ();
        })
        .catch ((error) => {
            reject (new ErrorServicio (error,'RealizarMonitoreo'));
        });

    });
}

async function NotificarErrorEmail (error) {
    const formData = new FormData ();

    formData.append ('asunto', 'Error al enviar notificación de iPads apagadas');
    formData.append ('mensaje', `
        <h3>Se presentó el siguiente error al realizar el monitoreo de iPads:</h3>
        <p> ${ error.obtenerError () }</p>
        <h3>Error generado en:</h3>
        <p>${ error.obtenerUbicacion () }</p>
    `);
    formData.append ('destinatarios', CONFIGURACION.CORREOS_LOG);

    // Enviar correo notificando algún error
    await fetch (CONFIGURACION.URL_EMAIL_LOG, {
        method: 'POST',
        body: formData
    })
    .catch (() => {});
}

app.listen (CONFIGURACION.PUERTO, async () => {
    console.log (`Aplicación de monitoreo iniciada en el puerto ${ CONFIGURACION.PUERTO }`);

    setInterval (async () => {
        // Realizar monitoreo periódico de las iPads desconectadas
        await RealizarMonitoreo ()
        .catch ((error) => {
            NotificarErrorEmail (error);
        });
    }, CONFIGURACION.INTERVALO);
});


