const Service = require ('node-windows').Service;

// Configuración del servicio
const svc = new Service ({
    name: 'Monitoreo Tablets',
    description: 'Servicio para el monitoreo de tablets apagadas.',
    script: 'C:\\inetpub\\wwwroot\\MonitoreoIpadsLocal\\index.js',
    nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
    ]
});

svc.on ('install', function () {
  svc.start ();
});

svc.install ();