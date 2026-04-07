## Descripción del proyecto

El proyecto MonitoreoTablets es un servicio de monitorización basado en Node.js diseñado para rastrear el estado de conectividad de los dispositivos iPad. Consulta periódicamente una API central para identificar las tabletas sin conexión y envía notificaciones push a los administradores cuando se detecta que un dispositivo está desconectado. Para garantizar una alta disponibilidad en un entorno de producción, la aplicación está diseñada para ejecutarse como un servicio persistente de Windows.

## Arquitectura del sistema

El proyecto consiste en un bucle de monitorización que se ejecuta a intervalos configurables. Interactúa con tres puntos finales externos: uno para obtener el estado del dispositivo, otro para enviar notificaciones push a dispositivos móviles y otro para informar de errores internos del servicio por correo electrónico.

## Características principales

* **Sondeo automatizado:** Utiliza un intervalo estándar para comprobar el estado del dispositivo sin intervención manual.
* **Filtrado de estado:** Se dirige específicamente a dispositivos donde Estado_conexion no está activo.
* **Alertas push:** Envía alertas inmediatas que contienen los identificadores de todos los iPads sin conexión.
* **Registro de errores resiliente:** si el proceso de monitoreo falla (por ejemplo, la API no está disponible), el sistema captura la excepción y envía un registro detallado por correo electrónico.
* **Integración con Windows:** Incluye scripts para instalarse como un demonio en segundo plano que se inicia automáticamente con el sistema operativo.


