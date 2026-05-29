// Portal Vecinal Dr. Domagk 2 — Demo SPA (powered by Shire)
// Mock data + render + navigation + dark mode + charts + chat + wizards

// ===========================================================================
// MOCK DATA
// ===========================================================================

const HOY = new Date('2026-05-26T09:15:00');

const FINCA = {
  nombre: 'Comunidad Dr. Domagk 2',
  nombre_corto: 'Dr. Domagk 2',
  direccion: 'Calle Doctor Domagk 2, 28036 Madrid',
  cif: 'H-85412309',
  plantas: 6,
  viviendas: 24,
  administrador: 'Fincas Hernández & Asoc.',
};

const USUARIO_ACTUAL = {
  nombre: 'Miguel Fortes Ramírez',
  email: 'miguel.fortes@dinagram.es',
  rol: 'Administrador',
  vivienda: 'Despacho administración',
  avatar: 'MF',
  from: '#1d639b',
  to: '#2e78a9',
};

// Roles y permisos (selector en topbar)
const ROLES = {
  admin: {
    label: 'Administrador',
    sub: 'Despacho administración',
    desc: 'Acceso total a la comunidad',
    color: '#1d639b',
    dot: 'bg-brand-500',
    icon: 'shield-check',
    persona: USUARIO_ACTUAL,
    allow: ['dashboard','incidencias','votaciones','notificaciones','directorio','presupuesto','documentos'],
  },
  junta: {
    label: 'Miembro de Junta',
    sub: 'María Fernández · 1ºB',
    desc: 'Co-gestión e incidencias',
    color: '#7c3aed',
    dot: 'bg-violet-500',
    icon: 'users',
    persona: { nombre: 'María Fernández Gómez', email: 'maria.fernandez@email.es', avatar: 'MF', from: '#7c3aed', to: '#a855f7' },
    allow: ['dashboard','incidencias','votaciones','notificaciones','directorio','presupuesto','documentos'],
  },
  propietario: {
    label: 'Propietario',
    sub: 'Carlos Martínez · 0ºA',
    desc: 'Participa, consulta y vota',
    color: '#0891b2',
    dot: 'bg-cyan-500',
    icon: 'user',
    persona: { nombre: 'Carlos Martínez Ruiz', email: 'carlos.martinez@email.es', avatar: 'CM', from: '#0891b2', to: '#06b6d4' },
    allow: ['dashboard','incidencias','votaciones','notificaciones','presupuesto','documentos'],
  },
  inquilino: {
    label: 'Inquilino',
    sub: 'Javier López · 1ºC',
    desc: 'Acceso limitado · sin votos',
    color: '#ea580c',
    dot: 'bg-orange-500',
    icon: 'key-round',
    persona: { nombre: 'Javier López Pérez', email: 'javier.lopez@email.es', avatar: 'JL', from: '#ea580c', to: '#f97316' },
    allow: ['dashboard','incidencias','notificaciones','documentos'],
  },
};

// 6 plantas × 4 puertas = 24 unidades. 17 propietarios habitando, 5 inquilinos, 2 vacías.
const PROPIETARIOS = [
  { id: 1,  nombre: 'Carlos Martínez Ruiz',      planta: 0, puerta: 'A', tipo: 'propietario', estado: 'ocupada', desde: '2018', email: 'carlos.martinez@email.es',    telefono: '+34 612 045 109', tags: ['Junta'],                   cuota: 195, ultimo_pago: '2026-04-01', moroso: false, avatar: 'CM', from: '#ec4899', to: '#f43f5e' },
  { id: 2,  nombre: 'Local — Farmacia Dr. Domagk', planta: 0, puerta: 'B', tipo: 'inquilino',  estado: 'ocupada', desde: '2015', email: 'farmacia.domagk@gmail.com',   telefono: '+34 913 442 870', tags: ['Comercial'],               cuota: 320, ultimo_pago: '2026-04-01', moroso: false, avatar: 'FD', from: '#10b981', to: '#059669' },
  { id: 3,  nombre: 'Ana García López',          planta: 0, puerta: 'C', tipo: 'propietario', estado: 'ocupada', desde: '2020', email: 'ana.garcia@email.es',         telefono: '+34 666 102 388', tags: ['Mascotas'],                cuota: 187, ultimo_pago: '2026-04-01', moroso: false, avatar: 'AG', from: '#8b5cf6', to: '#6366f1' },
  { id: 4,  nombre: '— Vacía',                   planta: 0, puerta: 'D', tipo: 'propietario', estado: 'vacia',   desde: null,   email: null,                          telefono: null,              tags: [],                          cuota: 187, ultimo_pago: null,         moroso: false, avatar: '··', from: '#94a3b8', to: '#64748b' },
  { id: 5,  nombre: 'Pedro Sánchez Hernández',   planta: 1, puerta: 'A', tipo: 'propietario', estado: 'ocupada', desde: '2012', email: 'pedro.sanchez@email.es',      telefono: '+34 615 220 471', tags: [],                          cuota: 187, ultimo_pago: '2026-04-01', moroso: false, avatar: 'PS', from: '#10b981', to: '#059669' },
  { id: 6,  nombre: 'María Fernández Gómez',     planta: 1, puerta: 'B', tipo: 'propietario', estado: 'ocupada', desde: '2019', email: 'maria.fernandez@email.es',    telefono: '+34 678 901 245', tags: ['Junta','Presidenta'],      cuota: 187, ultimo_pago: '2026-04-01', moroso: false, avatar: 'MF', from: '#7c3aed', to: '#a855f7' },
  { id: 7,  nombre: 'Javier López Pérez',        planta: 1, puerta: 'C', tipo: 'inquilino',   estado: 'ocupada', desde: '2024', email: 'javier.lopez@email.es',       telefono: '+34 622 580 144', tags: [],                          cuota: 187, ultimo_pago: '2026-04-01', moroso: false, avatar: 'JL', from: '#06b6d4', to: '#0891b2' },
  { id: 8,  nombre: 'Lucía Romero Castillo',     planta: 1, puerta: 'D', tipo: 'propietario', estado: 'ocupada', desde: '2017', email: 'lucia.romero@email.es',       telefono: '+34 660 412 880', tags: ['Mascotas'],                cuota: 187, ultimo_pago: '2026-04-01', moroso: false, avatar: 'LR', from: '#a855f7', to: '#7c3aed' },
  { id: 9,  nombre: 'Antonio Jiménez Moreno',    planta: 2, puerta: 'A', tipo: 'propietario', estado: 'ocupada', desde: '2011', email: 'antonio.jimenez@email.es',    telefono: '+34 611 290 770', tags: ['Movilidad reducida'],      cuota: 187, ultimo_pago: '2026-04-01', moroso: false, avatar: 'AJ', from: '#3b82f6', to: '#1d4ed8' },
  { id: 10, nombre: 'Carmen Ortega Vázquez',     planta: 2, puerta: 'B', tipo: 'propietario', estado: 'ocupada', desde: '2014', email: 'carmen.ortega@email.es',      telefono: '+34 651 047 312', tags: [],                          cuota: 187, ultimo_pago: '2026-04-01', moroso: false, avatar: 'CO', from: '#ec4899', to: '#db2777' },
  { id: 11, nombre: 'Diego Navarro Iglesias',    planta: 2, puerta: 'C', tipo: 'inquilino',   estado: 'ocupada', desde: '2023', email: 'diego.navarro@email.es',      telefono: '+34 634 102 558', tags: [],                          cuota: 187, ultimo_pago: '2026-04-01', moroso: false, avatar: 'DN', from: '#14b8a6', to: '#0d9488' },
  { id: 12, nombre: 'Isabel Torres Domínguez',   planta: 2, puerta: 'D', tipo: 'propietario', estado: 'ocupada', desde: '2016', email: 'isabel.torres@email.es',      telefono: '+34 649 880 207', tags: ['Padre/Madre menor'],       cuota: 187, ultimo_pago: '2026-04-01', moroso: false, avatar: 'IT', from: '#f97316', to: '#ea580c' },
  { id: 13, nombre: 'Rafael Castro Vidal',       planta: 3, puerta: 'A', tipo: 'propietario', estado: 'ocupada', desde: '2010', email: 'rafael.castro@email.es',      telefono: '+34 617 320 198', tags: [],                          cuota: 187, ultimo_pago: '2026-04-01', moroso: false, avatar: 'RC', from: '#6366f1', to: '#4f46e5' },
  { id: 14, nombre: 'Elena Ramos Aguilar',       planta: 3, puerta: 'B', tipo: 'propietario', estado: 'ocupada', desde: '2021', email: 'elena.ramos@email.es',        telefono: '+34 627 991 045', tags: ['Junta','Secretaria'],      cuota: 187, ultimo_pago: '2026-04-01', moroso: false, avatar: 'ER', from: '#84cc16', to: '#65a30d' },
  { id: 15, nombre: '— Vacía',                   planta: 3, puerta: 'C', tipo: 'propietario', estado: 'vacia',   desde: null,   email: null,                          telefono: null,              tags: [],                          cuota: 187, ultimo_pago: null,         moroso: false, avatar: '··', from: '#94a3b8', to: '#64748b' },
  { id: 16, nombre: 'Marta Delgado Soler',       planta: 3, puerta: 'D', tipo: 'propietario', estado: 'ocupada', desde: '2013', email: 'marta.delgado@email.es',      telefono: '+34 639 412 770', tags: [],                          cuota: 187, ultimo_pago: '2026-04-01', moroso: false, avatar: 'MD', from: '#d946ef', to: '#c026d3' },
  { id: 17, nombre: 'Francisco Molina Ortiz',    planta: 4, puerta: 'A', tipo: 'propietario', estado: 'ocupada', desde: '2009', email: 'francisco.molina@email.es',   telefono: '+34 614 087 233', tags: [],                          cuota: 187, ultimo_pago: '2026-04-01', moroso: false, avatar: 'FM', from: '#0ea5e9', to: '#0284c7' },
  { id: 18, nombre: 'Patricia Gil Romero',       planta: 4, puerta: 'B', tipo: 'inquilino',   estado: 'ocupada', desde: '2025', email: 'patricia.gil@email.es',       telefono: '+34 678 230 451', tags: [],                          cuota: 187, ultimo_pago: '2026-04-01', moroso: false, avatar: 'PG', from: '#f43f5e', to: '#e11d48' },
  { id: 19, nombre: 'Sergio Vargas Méndez',      planta: 4, puerta: 'C', tipo: 'propietario', estado: 'ocupada', desde: '2018', email: 'sergio.vargas@email.es',      telefono: '+34 692 410 887', tags: ['Mascotas'],                cuota: 187, ultimo_pago: '2026-01-01', moroso: true,  avatar: 'SV', from: '#8b5cf6', to: '#7c3aed' },
  { id: 20, nombre: 'Cristina Herrero Blanco',   planta: 4, puerta: 'D', tipo: 'propietario', estado: 'ocupada', desde: '2020', email: 'cristina.herrero@email.es',   telefono: '+34 645 110 392', tags: [],                          cuota: 187, ultimo_pago: '2026-04-01', moroso: false, avatar: 'CH', from: '#10b981', to: '#059669' },
  { id: 21, nombre: 'Manuel Cano Reyes',         planta: 5, puerta: 'A', tipo: 'propietario', estado: 'ocupada', desde: '2007', email: 'manuel.cano@email.es',        telefono: '+34 613 220 770', tags: ['Junta','Tesorero'],        cuota: 187, ultimo_pago: '2026-04-01', moroso: false, avatar: 'MC', from: '#f59e0b', to: '#d97706' },
  { id: 22, nombre: 'Beatriz Serrano Crespo',    planta: 5, puerta: 'B', tipo: 'propietario', estado: 'ocupada', desde: '2015', email: 'beatriz.serrano@email.es',    telefono: '+34 622 980 144', tags: [],                          cuota: 187, ultimo_pago: '2026-04-01', moroso: false, avatar: 'BS', from: '#06b6d4', to: '#0891b2' },
  { id: 23, nombre: 'Andrés Pascual Reina',      planta: 5, puerta: 'C', tipo: 'propietario', estado: 'ocupada', desde: '2019', email: 'andres.pascual@email.es',     telefono: '+34 637 014 580', tags: [],                          cuota: 187, ultimo_pago: '2026-04-01', moroso: false, avatar: 'AP', from: '#a855f7', to: '#9333ea' },
  { id: 24, nombre: 'Nuria Esteban Calvo',       planta: 5, puerta: 'D', tipo: 'inquilino',   estado: 'ocupada', desde: '2024', email: 'nuria.esteban@email.es',      telefono: '+34 681 477 290', tags: [],                          cuota: 187, ultimo_pago: '2026-04-01', moroso: false, avatar: 'NE', from: '#ec4899', to: '#db2777' },
];

const CATEGORIAS_INCIDENCIA = {
  ascensor:    { label: 'Ascensor',    icon: 'chevrons-up' },
  fontaneria:  { label: 'Fontanería',  icon: 'droplet' },
  ruido:       { label: 'Ruido',       icon: 'volume-2' },
  iluminacion: { label: 'Iluminación', icon: 'lightbulb' },
  seguridad:   { label: 'Seguridad',   icon: 'shield' },
  limpieza:    { label: 'Limpieza',    icon: 'sparkles' },
  electricidad:{ label: 'Electricidad',icon: 'zap' },
  jardineria:  { label: 'Jardinería',  icon: 'leaf' },
  general:     { label: 'General',     icon: 'wrench' },
};

// Funnel de 7 estados (orden lógico del flujo)
const ESTADOS_INCIDENCIA = {
  nueva:               { label: 'Nueva',                color: 'slate',   icon: 'circle-dot' },
  validada:            { label: 'Validada',             color: 'blue',    icon: 'check-circle' },
  en_progreso:         { label: 'En progreso',          color: 'indigo',  icon: 'loader' },
  pendiente_proveedor: { label: 'Pendiente proveedor',  color: 'amber',   icon: 'truck' },
  pendiente_vecino:    { label: 'Pendiente vecino',     color: 'orange',  icon: 'user-check' },
  resuelta:            { label: 'Resuelta',             color: 'emerald', icon: 'check' },
  cerrada:             { label: 'Cerrada',              color: 'zinc',    icon: 'archive' },
};
const ESTADO_ORDER = ['nueva','validada','en_progreso','pendiente_proveedor','pendiente_vecino','resuelta','cerrada'];

const INCIDENCIAS = [
  { id: 1,  titulo: 'Ascensor parado en planta 4 desde el martes',     descripcion: 'El ascensor lleva sin funcionar desde el martes por la mañana. Aviso ya enviado al servicio técnico de Otis.',
    categoria: 'ascensor',  prioridad: 'alta',  estado: 'pendiente_proveedor', autor: 17, fecha: '2026-05-23T08:15:00', votos: 14, comentarios: 8, ubicacion: 'Portal Dr. Domagk 2 · Ascensor principal',
    actualizaciones: [
      { fecha:'2026-05-23T08:15:00', autor:17, estado:'nueva',               accion:'creó la incidencia' },
      { fecha:'2026-05-23T09:42:00', autor:'USUARIO_ACTUAL', estado:'validada',  accion:'validó la incidencia y subió prioridad a Alta' },
      { fecha:'2026-05-23T11:10:00', autor:'USUARIO_ACTUAL', estado:'en_progreso', accion:'contactó con Ascensores Otis (servicio técnico)' },
      { fecha:'2026-05-24T11:20:00', autor:'USUARIO_ACTUAL', estado:'pendiente_proveedor', accion:'pasó a Pendiente proveedor — técnico viene el lunes 27' },
    ] },
  { id: 2,  titulo: 'Gotera recurrente en garaje nivel -2',             descripcion: 'Aparece humedad en el techo cerca de la plaza 47 después de cada lluvia. Empieza a oler.',
    categoria: 'fontaneria',prioridad: 'alta',  estado: 'en_progreso', autor: 22, fecha: '2026-05-21T19:30:00', votos: 9, comentarios: 5, ubicacion: 'Garaje Dr. Domagk 2 · Nivel −2, plaza 47',
    actualizaciones: [
      { fecha:'2026-05-21T19:30:00', autor:22, estado:'nueva',       accion:'creó la incidencia' },
      { fecha:'2026-05-22T08:30:00', autor:'USUARIO_ACTUAL', estado:'validada',   accion:'validó y abrió parte al seguro' },
      { fecha:'2026-05-24T14:00:00', autor:'USUARIO_ACTUAL', estado:'en_progreso', accion:'fontanero localizó la fuga, repara mañana' },
    ] },
  { id: 3,  titulo: 'Ruido nocturno en 3ºB, fines de semana',           descripcion: 'Música alta y conversaciones a partir de las 2 AM viernes y sábado. Ya he hablado con ellos pero no cambia.',
    categoria: 'ruido',     prioridad: 'media', estado: 'pendiente_vecino', autor: 16, fecha: '2026-05-19T23:45:00', votos: 6, comentarios: 12, ubicacion: 'Planta 3, puerta B',
    actualizaciones: [
      { fecha:'2026-05-19T23:45:00', autor:16, estado:'nueva',     accion:'creó la incidencia' },
      { fecha:'2026-05-20T18:00:00', autor:'USUARIO_ACTUAL', estado:'validada', accion:'validó y propuso mediación' },
      { fecha:'2026-05-22T10:15:00', autor:'USUARIO_ACTUAL', estado:'pendiente_vecino', accion:'esperando confirmación del 3ºB para reunión' },
    ] },
  { id: 4,  titulo: 'Iluminación portal averiada hace 3 días',          descripcion: 'La luz de entrada parpadea y a veces no enciende. Por la noche da mala impresión a quien viene de visita.',
    categoria: 'iluminacion',prioridad:'media', estado: 'pendiente_proveedor', autor: 9, fecha: '2026-05-22T07:10:00', votos: 11, comentarios: 3, ubicacion: 'Portal Dr. Domagk 2 · Hall',
    actualizaciones: [
      { fecha:'2026-05-22T07:10:00', autor:9, estado:'nueva',          accion:'creó la incidencia' },
      { fecha:'2026-05-22T09:30:00', autor:'USUARIO_ACTUAL', estado:'validada',          accion:'validó la incidencia' },
      { fecha:'2026-05-23T10:00:00', autor:'USUARIO_ACTUAL', estado:'pendiente_proveedor', accion:'presupuesto pedido a Electricidad Madrid Centro' },
    ] },
  { id: 5,  titulo: 'Cerradura del portal floja',                       descripcion: 'Hay que dar varios golpes para que cierre bien. Posible problema de seguridad.',
    categoria: 'seguridad', prioridad: 'alta',  estado: 'validada', autor: 14, fecha: '2026-05-24T16:22:00', votos: 5, comentarios: 2, ubicacion: 'Portal Dr. Domagk 2 · Puerta principal',
    actualizaciones: [
      { fecha:'2026-05-24T16:22:00', autor:14, estado:'nueva',    accion:'creó la incidencia' },
      { fecha:'2026-05-25T09:00:00', autor:'USUARIO_ACTUAL', estado:'validada', accion:'validó · pendiente programar cerrajero' },
    ] },
  { id: 6,  titulo: 'Buzón 2ºB forzado, no cierra',                     descripcion: 'Buzón 2ºB forzado. Aparece doblado y no cierra. Llevo días sin poder coger el correo bien.',
    categoria: 'seguridad', prioridad: 'media', estado: 'nueva', autor: 10, fecha: '2026-05-25T18:00:00', votos: 3, comentarios: 1, ubicacion: 'Hall · Buzones',
    actualizaciones: [
      { fecha:'2026-05-25T18:00:00', autor:10, estado:'nueva', accion:'creó la incidencia' },
    ] },
  { id: 7,  titulo: 'Antena TV sin señal en plantas altas',             descripcion: 'Desde el corte de luz del miércoles, en las plantas 4 y 5 no llega señal de la antena comunitaria.',
    categoria: 'electricidad',prioridad:'media',estado: 'en_progreso', autor: 21, fecha: '2026-05-20T20:30:00', votos: 8, comentarios: 6, ubicacion: 'Cubierta · Antena comunitaria',
    actualizaciones: [
      { fecha:'2026-05-20T20:30:00', autor:21, estado:'nueva',       accion:'creó la incidencia' },
      { fecha:'2026-05-21T11:00:00', autor:'USUARIO_ACTUAL', estado:'validada',     accion:'validó la incidencia' },
      { fecha:'2026-05-23T09:00:00', autor:'USUARIO_ACTUAL', estado:'en_progreso',  accion:'TVCom revisa el amplificador hoy' },
    ] },
  { id: 8,  titulo: 'Setos del patio interior sin podar',               descripcion: 'Los setos llevan meses sin podar. Empiezan a tapar las ventanas de planta baja.',
    categoria: 'jardineria',prioridad: 'baja',  estado: 'validada', autor: 3, fecha: '2026-05-18T11:00:00', votos: 4, comentarios: 2, ubicacion: 'Patio interior',
    actualizaciones: [
      { fecha:'2026-05-18T11:00:00', autor:3,  estado:'nueva',    accion:'creó la incidencia' },
      { fecha:'2026-05-19T16:30:00', autor:'USUARIO_ACTUAL', estado:'validada', accion:'validó · esperando a junio para reagrupar' },
    ] },
  { id: 9,  titulo: 'Filtración bajo el lavadero del 5ºA',              descripcion: 'Mancha de humedad en el techo de Manuel Cano. La fuga venía del 6ºA — corregida.',
    categoria: 'fontaneria',prioridad: 'alta',  estado: 'resuelta', autor: 21, fecha: '2026-05-10T14:00:00', votos: 7, comentarios: 9, ubicacion: 'Planta 5, puerta A',
    actualizaciones: [
      { fecha:'2026-05-10T14:00:00', autor:21, estado:'nueva',                accion:'creó la incidencia' },
      { fecha:'2026-05-11T09:30:00', autor:'USUARIO_ACTUAL', estado:'validada',                accion:'validó y abrió parte al seguro' },
      { fecha:'2026-05-13T15:00:00', autor:'USUARIO_ACTUAL', estado:'pendiente_proveedor',     accion:'fontanero asignado por Mapfre' },
      { fecha:'2026-05-16T18:00:00', autor:'USUARIO_ACTUAL', estado:'resuelta',                accion:'fuga corregida · pintura pendiente, asume seguro' },
    ] },
  { id: 10, titulo: 'Felpudo desaparecido en el 2ºB',                   descripcion: 'Alguien se ha llevado mi felpudo. Era nuevo, costó 35 €.',
    categoria: 'general',   prioridad: 'baja',  estado: 'cerrada', autor: 10, fecha: '2026-05-12T09:30:00', votos: 1, comentarios: 4, ubicacion: 'Planta 2, puerta B',
    actualizaciones: [
      { fecha:'2026-05-12T09:30:00', autor:10, estado:'nueva',    accion:'creó la incidencia' },
      { fecha:'2026-05-14T11:00:00', autor:'USUARIO_ACTUAL', estado:'cerrada', accion:'cerrada — apareció en el descansillo del 1ºB' },
    ] },
  { id: 11, titulo: 'Empresa limpieza no vino jueves',                  descripcion: 'Las escaleras están sin barrer desde el miércoles. La empresa nueva no ha pasado.',
    categoria: 'limpieza',  prioridad: 'media', estado: 'pendiente_vecino', autor: 13, fecha: '2026-05-22T08:00:00', votos: 12, comentarios: 7, ubicacion: 'Escaleras comunitarias',
    actualizaciones: [
      { fecha:'2026-05-22T08:00:00', autor:13, estado:'nueva',             accion:'creó la incidencia' },
      { fecha:'2026-05-22T12:00:00', autor:'USUARIO_ACTUAL', estado:'validada',             accion:'validó y reclamó a Limpiezas Galán' },
      { fecha:'2026-05-25T16:00:00', autor:'USUARIO_ACTUAL', estado:'pendiente_vecino',     accion:'esperando confirmación de Rafael (3ºA) de paso por escaleras' },
    ] },
  { id: 12, titulo: 'Goteo en grifo comunitario terraza',               descripcion: 'El grifo de la terraza comunitaria gotea constantemente. Imagino que el consumo se suma a la comunidad.',
    categoria: 'fontaneria',prioridad: 'baja',  estado: 'nueva', autor: 22, fecha: '2026-05-25T17:45:00', votos: 2, comentarios: 0, ubicacion: 'Terraza comunitaria',
    actualizaciones: [
      { fecha:'2026-05-25T17:45:00', autor:22, estado:'nueva', accion:'creó la incidencia' },
    ] },
  { id: 13, titulo: 'Cables sueltos en cuarto contadores',              descripcion: 'He visto cables colgando en el cuarto de contadores de la planta baja. Parecen recientes.',
    categoria: 'electricidad',prioridad:'alta', estado: 'cerrada', autor: 1, fecha: '2026-05-08T12:15:00', votos: 6, comentarios: 3, ubicacion: 'Cuarto contadores planta baja',
    actualizaciones: [
      { fecha:'2026-05-08T12:15:00', autor:1,  estado:'nueva',    accion:'creó la incidencia' },
      { fecha:'2026-05-09T10:00:00', autor:'USUARIO_ACTUAL', estado:'validada', accion:'validó · electricista de urgencia' },
      { fecha:'2026-05-09T17:00:00', autor:'USUARIO_ACTUAL', estado:'resuelta', accion:'cables fijados y aislados' },
      { fecha:'2026-05-11T09:00:00', autor:'USUARIO_ACTUAL', estado:'cerrada',  accion:'cerrada tras revisión' },
    ] },
  { id: 14, titulo: 'Olor a basura en cuarto contenedores',             descripcion: 'El cuarto de los contenedores huele mal sobre todo los lunes. Quizás haga falta una limpieza más frecuente.',
    categoria: 'limpieza',  prioridad: 'media', estado: 'resuelta', autor: 6, fecha: '2026-05-05T19:00:00', votos: 9, comentarios: 5, ubicacion: 'Cuarto contenedores planta baja',
    actualizaciones: [
      { fecha:'2026-05-05T19:00:00', autor:6, estado:'nueva',    accion:'creó la incidencia' },
      { fecha:'2026-05-06T09:00:00', autor:'USUARIO_ACTUAL', estado:'validada', accion:'validó · revisión de frecuencia' },
      { fecha:'2026-05-08T14:00:00', autor:'USUARIO_ACTUAL', estado:'resuelta', accion:'añadida limpieza extra los lunes con Limpiezas Galán' },
    ] },
];

// Mensajes de chat por incidencia (los 5-6 más activos tienen conversación completa)
const MENSAJES_INCIDENCIA = {
  1: [
    { id:1, autor:17, fecha:'2026-05-23T08:16:00', tipo:'usuario', texto:'Llevo desde el martes bajando 4 plantas con la compra. ¿Alguien sabe algo?' },
    { id:2, autor:21, fecha:'2026-05-23T08:45:00', tipo:'usuario', texto:'Confirmo que no funciona. Esta mañana también lo he intentado.' },
    { id:3, autor:'USUARIO_ACTUAL', fecha:'2026-05-23T09:42:00', tipo:'admin', texto:'Ya he contactado con Otis. Mañana viernes envían técnico. Os mantengo al tanto.' },
    { id:4, autor:'SYSTEM', fecha:'2026-05-23T11:10:00', tipo:'sistema', texto:'cambió estado a En progreso' },
    { id:5, autor:9,  fecha:'2026-05-23T13:20:00', tipo:'usuario', texto:'¿No podríamos exigir una compensación al servicio? Es la segunda vez este año.' },
    { id:6, autor:'USUARIO_ACTUAL', fecha:'2026-05-24T10:45:00', tipo:'admin', texto:'El técnico de Otis ha venido pero necesita una pieza. Llega el lunes. Lamento mucho la espera.', adjunto:{ nombre:'Parte_otis_24-05.pdf', tipo:'pdf', tamano:'124 KB' } },
    { id:7, autor:'SYSTEM', fecha:'2026-05-24T11:20:00', tipo:'sistema', texto:'cambió estado a Pendiente proveedor' },
    { id:8, autor:17, fecha:'2026-05-24T19:30:00', tipo:'usuario', texto:'Gracias Miguel. Si alguno de planta baja necesita ayuda con compras pesadas, avisad.', reacciones:'👍 4' },
  ],
  2: [
    { id:1, autor:22, fecha:'2026-05-21T19:32:00', tipo:'usuario', texto:'Adjunto foto. Está cada vez peor.', adjunto:{ nombre:'gotera_garaje.jpg', tipo:'image', tamano:'2.1 MB' } },
    { id:2, autor:'USUARIO_ACTUAL', fecha:'2026-05-22T08:35:00', tipo:'admin', texto:'Gracias por la foto Beatriz. Esto es del bajante de la 4ºA, lo abro al seguro hoy mismo.' },
    { id:3, autor:'SYSTEM', fecha:'2026-05-22T08:36:00', tipo:'sistema', texto:'cambió estado a Validada' },
    { id:4, autor:5, fecha:'2026-05-23T11:00:00', tipo:'usuario', texto:'Yo lo vi también ayer. Cada vez que llueve aparece la mancha.' },
    { id:5, autor:'USUARIO_ACTUAL', fecha:'2026-05-24T14:05:00', tipo:'admin', texto:'Fontanero ha localizado la fuga. Repara mañana por la mañana. No es necesario sacar el coche.' },
    { id:6, autor:'SYSTEM', fecha:'2026-05-24T14:05:00', tipo:'sistema', texto:'cambió estado a En progreso' },
  ],
  3: [
    { id:1, autor:16, fecha:'2026-05-19T23:50:00', tipo:'usuario', texto:'Otra vez el ático. Son las 3 AM y no puedo dormir. Esto es insostenible.' },
    { id:2, autor:8,  fecha:'2026-05-20T08:10:00', tipo:'usuario', texto:'Yo también lo escuché. Vivo justo debajo y se nota mucho.' },
    { id:3, autor:'USUARIO_ACTUAL', fecha:'2026-05-20T18:05:00', tipo:'admin', texto:'Marta, hablo con los del 3ºB esta semana. Propondré mediación formal si no cambia.' },
    { id:4, autor:'SYSTEM', fecha:'2026-05-22T10:15:00', tipo:'sistema', texto:'cambió estado a Pendiente vecino' },
    { id:5, autor:'USUARIO_ACTUAL', fecha:'2026-05-22T10:16:00', tipo:'admin', texto:'He dejado mensaje en el buzón del 3ºB para una reunión de mediación. Espero confirmación.' },
  ],
  4: [
    { id:1, autor:9, fecha:'2026-05-22T07:15:00', tipo:'usuario', texto:'No es solo estético, da inseguridad por la noche.' },
    { id:2, autor:'USUARIO_ACTUAL', fecha:'2026-05-22T09:32:00', tipo:'admin', texto:'Confirmado Antonio. Pido presupuesto al electricista de confianza hoy.' },
    { id:3, autor:'SYSTEM', fecha:'2026-05-23T10:00:00', tipo:'sistema', texto:'cambió estado a Pendiente proveedor' },
    { id:4, autor:'USUARIO_ACTUAL', fecha:'2026-05-23T10:02:00', tipo:'admin', texto:'Electricidad Madrid Centro viene el martes 26 a hacer presupuesto. Os comparto cuando lo tenga.' },
  ],
  9: [
    { id:1, autor:21, fecha:'2026-05-10T14:05:00', tipo:'usuario', texto:'Apareció una mancha grande en el lavadero. Lo dejo aquí por si afecta a más vecinos.' },
    { id:2, autor:'USUARIO_ACTUAL', fecha:'2026-05-11T09:35:00', tipo:'admin', texto:'Manuel, abro parte a Mapfre. La fuga viene del 6ºA según las primeras inspecciones.' },
    { id:3, autor:'SYSTEM', fecha:'2026-05-13T15:00:00', tipo:'sistema', texto:'cambió estado a Pendiente proveedor' },
    { id:4, autor:'USUARIO_ACTUAL', fecha:'2026-05-16T18:00:00', tipo:'admin', texto:'Fuga corregida. La pintura del techo la cubre el seguro, programan repaso la próxima semana.' },
    { id:5, autor:'SYSTEM', fecha:'2026-05-16T18:00:00', tipo:'sistema', texto:'cambió estado a Resuelta' },
    { id:6, autor:21, fecha:'2026-05-17T10:00:00', tipo:'usuario', texto:'Gracias por la gestión. Todo perfecto.', reacciones:'❤️ 2' },
  ],
  11: [
    { id:1, autor:13, fecha:'2026-05-22T08:05:00', tipo:'usuario', texto:'Llevan dos días sin pasar. ¿Habéis hablado con la empresa nueva?' },
    { id:2, autor:'USUARIO_ACTUAL', fecha:'2026-05-22T12:10:00', tipo:'admin', texto:'Rafael, he llamado a Limpiezas Galán. Vienen mañana sin falta y compensan con limpieza extra el sábado.' },
    { id:3, autor:13, fecha:'2026-05-25T15:40:00', tipo:'usuario', texto:'Hoy lunes tampoco han pasado por escaleras 2-3. Confirmadme y reclamamos.' },
    { id:4, autor:'SYSTEM', fecha:'2026-05-25T16:00:00', tipo:'sistema', texto:'cambió estado a Pendiente vecino' },
  ],
  5: [
    { id:1, autor:14, fecha:'2026-05-24T16:24:00', tipo:'usuario', texto:'Cierra mal. Doy 3 portazos cada noche. Mejor cambiar la cerradura entera.' },
    { id:2, autor:'USUARIO_ACTUAL', fecha:'2026-05-25T09:02:00', tipo:'admin', texto:'Elena, validado. Programo cerrajero esta misma semana.' },
  ],
  6: [
    { id:1, autor:10, fecha:'2026-05-25T18:02:00', tipo:'usuario', texto:'Mi buzón estaba forzado al volver del fin de semana. Adjunto foto.', adjunto:{ nombre:'buzon_2B.jpg', tipo:'image', tamano:'1.4 MB' } },
  ],
  7: [
    { id:1, autor:21, fecha:'2026-05-20T20:35:00', tipo:'usuario', texto:'En 5ºA no hay señal desde el corte. ¿Algún vecino más afectado?' },
    { id:2, autor:18, fecha:'2026-05-20T21:15:00', tipo:'usuario', texto:'Nosotros en 4ºB tampoco vemos los canales TDT.' },
    { id:3, autor:'USUARIO_ACTUAL', fecha:'2026-05-21T11:05:00', tipo:'admin', texto:'TVCom revisa hoy el amplificador. Si es la fuente, sustituyen sin coste.' },
    { id:4, autor:'SYSTEM', fecha:'2026-05-23T09:00:00', tipo:'sistema', texto:'cambió estado a En progreso' },
  ],
  8: [
    { id:1, autor:3,  fecha:'2026-05-18T11:05:00', tipo:'usuario', texto:'Los setos llegan a la altura de mi ventana. Difícil tener intimidad.' },
    { id:2, autor:'USUARIO_ACTUAL', fecha:'2026-05-19T16:32:00', tipo:'admin', texto:'Ana, lo agrupo con la poda trimestral de junio para abaratar coste.' },
  ],
};

const TIPOS_NOTIFICACION = {
  convocatoria: { label: 'Convocatoria', color: 'brand',   icon: 'calendar-days' },
  aviso:        { label: 'Aviso',        color: 'slate',   icon: 'megaphone' },
  resolucion:   { label: 'Resolución',   color: 'emerald', icon: 'check-circle-2' },
  urgente:      { label: 'Urgente',      color: 'red',     icon: 'alert-triangle' },
};

const NOTIFICACIONES = [
  { id: 1,  tipo:'urgente',      prioridad:'urgente', titulo:'Corte de agua programado: lunes 25/05 de 10:00 a 14:00',
    contenido:'Por mantenimiento de la red de abastecimiento, Canal de Isabel II nos ha confirmado un corte de agua programado para el lunes 25 de mayo entre las 10:00 y las 14:00. Recomendamos llenar recipientes con antelación.',
    fecha:'2026-05-23T17:00:00', autor:'USUARIO_ACTUAL', leido:false, requiere_acuse:false, destinatarios:'Todos los vecinos de Dr. Domagk 2' },
  { id: 2,  tipo:'convocatoria', prioridad:'alta',    titulo:'Convocatoria Junta Ordinaria Dr. Domagk 2 — 15 de junio 2026, 19:00',
    contenido:'Convoca: Junta Ordinaria de Propietarios de la Comunidad Dr. Domagk 2. Lugar: Sala comunitaria, planta baja. Hora: 19:00 en primera convocatoria, 19:30 en segunda. Orden del día disponible en Documentos. Es obligatorio acusar recibo antes del 10 de junio.',
    fecha:'2026-05-22T10:00:00', autor:'USUARIO_ACTUAL', leido:false, requiere_acuse:true, destinatarios:'Propietarios' },
  { id: 3,  tipo:'aviso',        prioridad:'normal',  titulo:'Nueva empresa de limpieza desde el 1 de junio',
    contenido:'A partir del 1 de junio, la empresa Limpiezas Galán & Hijos pasará a cubrir las labores de limpieza tras la votación aprobada el mes pasado. Pasarán lunes, miércoles y viernes.',
    fecha:'2026-05-20T12:30:00', autor:'USUARIO_ACTUAL', leido:false, requiere_acuse:false, destinatarios:'Todos los vecinos' },
  { id: 4,  tipo:'resolucion',   prioridad:'normal',  titulo:'Aprobada la reforma del portal Dr. Domagk 2 — Acta disponible',
    contenido:'La votación para la reforma del portal cerró el 18 de mayo con un 82% de votos a favor. Las obras se programarán para julio. El acta completa está en Documentos.',
    fecha:'2026-05-18T20:15:00', autor:'USUARIO_ACTUAL', leido:true, requiere_acuse:false, destinatarios:'Todos los vecinos' },
  { id: 5,  tipo:'aviso',        prioridad:'normal',  titulo:'Cierre de cuentas del ejercicio 2025 disponible',
    contenido:'Ya está disponible en Documentos > Actas el cierre de cuentas del ejercicio 2025 firmado por el administrador y revisado por la comisión de cuentas.',
    fecha:'2026-05-15T11:00:00', autor:'USUARIO_ACTUAL', leido:true, requiere_acuse:false, destinatarios:'Propietarios' },
  { id: 6,  tipo:'aviso',        prioridad:'normal',  titulo:'Recordatorio: pago cuota trimestral',
    contenido:'Recordatorio del cargo del segundo trimestre de 2026 que se emitirá el 1 de junio. Importe: 187,50 €. Si necesitas modificar el IBAN, escribe antes del 28 de mayo.',
    fecha:'2026-05-14T09:00:00', autor:'USUARIO_ACTUAL', leido:true, requiere_acuse:false, destinatarios:'Propietarios' },
  { id: 7,  tipo:'convocatoria', prioridad:'normal',  titulo:'Comisión de obras: reunión informal sábado 31',
    contenido:'Antes de la junta del 15, convocamos a la comisión de obras a una reunión informal el sábado 31 a las 11:00 en la sala comunitaria para revisar presupuestos de la reforma de fachada norte.',
    fecha:'2026-05-13T16:40:00', autor:'USUARIO_ACTUAL', leido:true, requiere_acuse:false, destinatarios:'Comisión de obras' },
  { id: 8,  tipo:'resolucion',   prioridad:'normal',  titulo:'Resuelta incidencia de filtración planta 5',
    contenido:'La filtración bajo el lavadero del 5ºA se resolvió la semana pasada. Se localizó el origen en una junta defectuosa del 6ºA. Coste asumido por el seguro de comunidad.',
    fecha:'2026-05-12T18:20:00', autor:'USUARIO_ACTUAL', leido:true, requiere_acuse:false, destinatarios:'Todos los vecinos' },
  { id: 9,  tipo:'aviso',        prioridad:'normal',  titulo:'Revisión anual del ascensor — 5 de junio',
    contenido:'Otis realizará la revisión anual obligatoria del ascensor el viernes 5 de junio entre las 09:00 y las 13:00. El ascensor estará fuera de servicio durante ese intervalo.',
    fecha:'2026-05-10T10:15:00', autor:'USUARIO_ACTUAL', leido:true, requiere_acuse:false, destinatarios:'Todos los vecinos' },
  { id: 10, tipo:'urgente',      prioridad:'urgente', titulo:'Aviso de seguridad Dr. Domagk 2: cerrar siempre el portal',
    contenido:'Se han detectado intentos de acceso no autorizado a varios portales del barrio. Os pedimos cerrar siempre la puerta principal con llave al entrar y salir, especialmente por la noche.',
    fecha:'2026-05-08T22:00:00', autor:'USUARIO_ACTUAL', leido:true, requiere_acuse:true, destinatarios:'Todos los vecinos' },
  { id: 11, tipo:'convocatoria', prioridad:'normal',  titulo:'Asamblea extraordinaria placas solares — fecha por confirmar',
    contenido:'En las próximas semanas convocaremos una asamblea extraordinaria para presentar el proyecto técnico de instalación de placas solares en la cubierta y abrir votación.',
    fecha:'2026-05-05T13:00:00', autor:'USUARIO_ACTUAL', leido:true, requiere_acuse:false, destinatarios:'Propietarios' },
  { id: 12, tipo:'aviso',        prioridad:'normal',  titulo:'Bienvenidos al Portal Vecinal Dr. Domagk 2',
    contenido:'Os recordamos que la nueva plataforma de gestión está activa. Cualquier incidencia o consulta podéis abrirla directamente aquí sin necesidad de WhatsApp o emails.',
    fecha:'2026-05-01T09:00:00', autor:'USUARIO_ACTUAL', leido:true, requiere_acuse:false, destinatarios:'Todos los vecinos' },
  { id: 13, tipo:'resolucion',   prioridad:'normal',  titulo:'Reglamento interno Dr. Domagk 2 (v. 2026) actualizado',
    contenido:'Se ha publicado en Documentos la nueva versión del reglamento interno aprobada el 18 de mayo. Por obligación legal, es necesario acusar recibo antes del 10 de junio.',
    fecha:'2026-05-19T11:00:00', autor:'USUARIO_ACTUAL', leido:false, requiere_acuse:true, destinatarios:'Todos los vecinos' },
  { id: 14, tipo:'convocatoria', prioridad:'alta',    titulo:'Aprobación cuentas 2025 — Votación abierta del 1 al 14 de junio',
    contenido:'Se abrirá la votación electrónica para la aprobación de las cuentas del ejercicio 2025 desde el 1 al 14 de junio. Encontrarás el detalle en Votaciones cuando arranque.',
    fecha:'2026-05-24T17:30:00', autor:'USUARIO_ACTUAL', leido:false, requiere_acuse:true, destinatarios:'Propietarios' },
];

const VOTACIONES = [
  { id: 1, titulo:'Reforma fachada norte Dr. Domagk 2 (28.500 €)',
    descripcion:'Aprobar el presupuesto y la ejecución de la reforma de la fachada norte: impermeabilización, pintura y reparación de balcones. Plazo estimado de obra: 6 semanas en agosto-septiembre 2026.',
    estado:'activa', tipo_junta:'extraordinaria', fecha_inicio:'2026-05-15T00:00:00', fecha_fin:'2026-05-30T23:59:00',
    favor:13, contra:4, abstencion:2, elegibles:24, importe:28500, participantes:[1,3,5,6,8,9,10,12,13,14,16,17,19,20,21,22,23,24,2] },
  { id: 2, titulo:'Instalación de placas solares en cubierta',
    descripcion:'Estudio de viabilidad y aprobación inicial para la instalación de placas solares fotovoltaicas en la cubierta. Coste inicial estimado 38.000 €, retorno previsto 7-8 años.',
    estado:'activa', tipo_junta:'extraordinaria', fecha_inicio:'2026-05-10T00:00:00', fecha_fin:'2026-06-05T23:59:00',
    favor:8, contra:3, abstencion:2, elegibles:24, importe:38000, participantes:[1,3,5,8,9,12,13,14,16,17,21,22,23] },
  { id: 3, titulo:'Pintura y barnizado del rellano de escalera',
    descripcion:'Trabajos menores: pintar paredes blancas y barnizar barandilla. Presupuesto cerrado con Pinturas Madrid Centro.',
    estado:'activa', tipo_junta:'ordinaria', fecha_inicio:'2026-05-20T00:00:00', fecha_fin:'2026-06-10T23:59:00',
    favor:5, contra:1, abstencion:1, elegibles:24, importe:3200, participantes:[1,5,9,13,14,17,21] },
  { id: 7, titulo:'Aprobación cuentas ejercicio 2025',
    descripcion:'Aprobación formal del cierre de cuentas del ejercicio 2025 firmado por el administrador y la comisión de cuentas. Se abre el 1 de junio.',
    estado:'proxima', tipo_junta:'ordinaria', fecha_inicio:'2026-06-01T00:00:00', fecha_fin:'2026-06-14T23:59:00',
    favor:0, contra:0, abstencion:0, elegibles:24, importe:null, participantes:[] },
  { id: 8, titulo:'Auditoría energética del edificio',
    descripcion:'Aprobar la contratación de una auditoría energética para detectar mejoras antes de la instalación de placas solares. Coste estimado 1.800 €.',
    estado:'proxima', tipo_junta:'extraordinaria', fecha_inicio:'2026-06-08T00:00:00', fecha_fin:'2026-06-25T23:59:00',
    favor:0, contra:0, abstencion:0, elegibles:24, importe:1800, participantes:[] },
  { id: 4, titulo:'Cambio de empresa de limpieza',
    descripcion:'Aprobada por mayoría. Limpiezas Galán & Hijos sustituye a Limpiezas Sol desde el 1 de junio. Ahorro anual estimado 1.200 €.',
    estado:'cerrada_aprobada', tipo_junta:'ordinaria', fecha_inicio:'2026-04-15T00:00:00', fecha_fin:'2026-05-05T23:59:00',
    favor:17, contra:2, abstencion:2, elegibles:24, importe:null, participantes:[1,3,5,6,8,9,10,12,13,14,16,17,19,20,21,22,23,24,2,15,11] },
  { id: 5, titulo:'Reforma integral del portal Dr. Domagk 2',
    descripcion:'Aprobada con un 82%. Las obras se realizarán en julio. Presupuesto 14.800 €.',
    estado:'cerrada_aprobada', tipo_junta:'extraordinaria', fecha_inicio:'2026-04-25T00:00:00', fecha_fin:'2026-05-18T23:59:00',
    favor:16, contra:3, abstencion:1, elegibles:24, importe:14800, participantes:[1,3,5,6,8,9,10,12,13,14,16,17,19,20,21,22,23,24,2,11] },
  { id: 6, titulo:'Subida de cuota trimestral a 210 €',
    descripcion:'Rechazada. La propuesta de subir la cuota trimestral de 187,50 € a 210 € no obtuvo la mayoría necesaria.',
    estado:'cerrada_rechazada', tipo_junta:'ordinaria', fecha_inicio:'2026-03-20T00:00:00', fecha_fin:'2026-04-10T23:59:00',
    favor:8, contra:13, abstencion:3, elegibles:24, importe:null, participantes:[1,3,5,6,8,9,10,12,13,14,16,17,19,20,21,22,23,24] },
];

const PRESUPUESTO = {
  anual: 58000,
  ejecutado: 42300,
  ultima_importacion: '2026-05-22',
  ultima_importacion_movs: 26,
  ultima_importacion_autor: 'Miguel Fortes',
  categorias: [
    { nombre:'Mantenimiento',  importe:11800, pct:28, color:'#1d639b' },
    { nombre:'Limpieza',       importe:9300,  pct:22, color:'#10b981' },
    { nombre:'Suministros',    importe:7600,  pct:18, color:'#f59e0b' },
    { nombre:'Seguros',        importe:5100,  pct:12, color:'#8b5cf6' },
    { nombre:'Administración', importe:4200,  pct:10, color:'#ec4899' },
    { nombre:'Reformas',       importe:4300,  pct:10, color:'#06b6d4' },
  ],
  mensual: [
    { mes:'Ene', importe:4100 }, { mes:'Feb', importe:4500 }, { mes:'Mar', importe:5200 },
    { mes:'Abr', importe:6400 }, { mes:'May', importe:7300 }, { mes:'Jun', importe:0 },
    { mes:'Jul', importe:0 }, { mes:'Ago', importe:0 }, { mes:'Sep', importe:0 },
    { mes:'Oct', importe:0 }, { mes:'Nov', importe:0 }, { mes:'Dic', importe:0 },
  ],
  movimientos: [
    { fecha:'2026-05-22', concepto:'Mantenimiento ascensor — Otis',         categoria:'Mantenimiento',  importe:-340 },
    { fecha:'2026-05-20', concepto:'Limpieza mayo (Limpiezas Galán)',        categoria:'Limpieza',       importe:-780 },
    { fecha:'2026-05-19', concepto:'Cuotas trimestrales 2T (24 viviendas)',  categoria:'Ingreso',        importe:4500 },
    { fecha:'2026-05-15', concepto:'Recibo luz comunidad (Iberdrola)',       categoria:'Suministros',    importe:-412 },
    { fecha:'2026-05-12', concepto:'Seguro multirriesgo — Mapfre (anual)',   categoria:'Seguros',        importe:-1380 },
    { fecha:'2026-05-08', concepto:'Reparación filtración 5ºA (siniestro)',  categoria:'Reformas',       importe:-890 },
    { fecha:'2026-05-05', concepto:'Honorarios administrador (mensual)',     categoria:'Administración', importe:-350 },
    { fecha:'2026-05-02', concepto:'Cuota agua (Canal Isabel II)',           categoria:'Suministros',    importe:-290 },
  ],
};

// Datos simulados que aparecerán en el wizard de importación Excel de gastos.
const GASTOS_IMPORT_PREVIEW = [
  { fecha:'2026-05-23', concepto:'BIZUM Limpiezas Galán mayo extra',    importe:-180, categoria:'Limpieza',       confianza:'alta',   revisar:false },
  { fecha:'2026-05-22', concepto:'OTIS mant ascensor mayo',             importe:-340, categoria:'Mantenimiento',  confianza:'alta',   revisar:false },
  { fecha:'2026-05-21', concepto:'PINTURAS MADRID CENTRO anticipo',     importe:-640, categoria:'Reformas',       confianza:'alta',   revisar:false },
  { fecha:'2026-05-21', concepto:'CARGO BANCO Comisión mantenimiento',  importe:-22,  categoria:'Administración', confianza:'media',  revisar:true  },
  { fecha:'2026-05-20', concepto:'LIMPIEZAS GALAN mayo',                importe:-780, categoria:'Limpieza',       confianza:'alta',   revisar:false },
  { fecha:'2026-05-19', concepto:'TRF CUOTAS 2T 24 propietarios',       importe:4500, categoria:'Ingreso',        confianza:'alta',   revisar:false },
  { fecha:'2026-05-18', concepto:'IBERDROLA luz portal y rellanos',     importe:-412, categoria:'Suministros',    confianza:'alta',   revisar:false },
  { fecha:'2026-05-17', concepto:'JARDINERIA RIVERA poda urgente',      importe:-220, categoria:'Mantenimiento',  confianza:'alta',   revisar:false },
  { fecha:'2026-05-16', concepto:'PEDIDO Amazon — bombillas LED hall',  importe:-58,  categoria:'Suministros',    confianza:'baja',   revisar:true  },
  { fecha:'2026-05-15', concepto:'AGUA CANAL ISABEL II',                importe:-290, categoria:'Suministros',    confianza:'alta',   revisar:false },
  { fecha:'2026-05-14', concepto:'COBRO derrama portal — 4 vecinos',    importe:1200, categoria:'Ingreso',        confianza:'alta',   revisar:false },
  { fecha:'2026-05-13', concepto:'MAPFRE seguro multirriesgo anual',    importe:-1380,categoria:'Seguros',        confianza:'alta',   revisar:false },
  { fecha:'2026-05-12', concepto:'TVCOM amplificador antena',            importe:-180, categoria:'Mantenimiento',  confianza:'alta',   revisar:false },
  { fecha:'2026-05-11', concepto:'CERRAJERIA URGENTE 24h portal',        importe:-95,  categoria:'Mantenimiento',  confianza:'alta',   revisar:false },
  { fecha:'2026-05-10', concepto:'ELECTRICIDAD MADRID CENTRO',           importe:-340, categoria:'Reformas',       confianza:'alta',   revisar:false },
  { fecha:'2026-05-09', concepto:'FONTANERO Pérez urgencia 5ºA',         importe:-220, categoria:'Reformas',       confianza:'alta',   revisar:false },
  { fecha:'2026-05-08', concepto:'REPARACION filtración 5ºA siniestro',  importe:-890, categoria:'Reformas',       confianza:'alta',   revisar:false },
  { fecha:'2026-05-07', concepto:'AMAZON pack productos limpieza',       importe:-62,  categoria:'Limpieza',       confianza:'media',  revisar:false },
  { fecha:'2026-05-06', concepto:'TRF Junta sub. proyecto solar',        importe:-260, categoria:'Reformas',       confianza:'media',  revisar:true  },
  { fecha:'2026-05-05', concepto:'TRF HONORARIOS administrador mayo',    importe:-350, categoria:'Administración', confianza:'alta',   revisar:false },
  { fecha:'2026-05-04', concepto:'IBERDROLA factura aire ascensor',      importe:-78,  categoria:'Suministros',    confianza:'alta',   revisar:false },
  { fecha:'2026-05-03', concepto:'GASTOS BANCO mantenimiento cuenta',    importe:-12,  categoria:'Administración', confianza:'alta',   revisar:false },
  { fecha:'2026-05-02', concepto:'CANAL ISABEL II cuota agua',           importe:-290, categoria:'Suministros',    confianza:'alta',   revisar:false },
  { fecha:'2026-05-01', concepto:'BIZUM jardinero poda extra',           importe:-90,  categoria:'Mantenimiento',  confianza:'alta',   revisar:false },
  { fecha:'2026-04-30', concepto:'COBRO derrama Junta abril',            importe:850,  categoria:'Ingreso',        confianza:'alta',   revisar:false },
  { fecha:'2026-04-29', concepto:'ENDESA luz parking subterráneo',       importe:-145, categoria:'Suministros',    confianza:'alta',   revisar:false },
];

// Datos simulados que aparecerán en el wizard de carga inicial de vecinos.
const VECINOS_IMPORT_PREVIEW = PROPIETARIOS.map(p => {
  const base = { planta:p.planta, puerta:p.puerta, nombre:p.nombre, email:p.email, telefono:p.telefono, tipo:p.tipo, cuota:p.cuota };
  if (p.id === 19) return { ...base, validacion:'revisar',  motivo:'Cuota fuera de rango habitual (×0.8)' };
  if (p.id === 18) return { ...base, validacion:'revisar',  motivo:'Email previamente asociado a otra vivienda' };
  if (p.id === 24) return { ...base, validacion:'revisar',  motivo:'Teléfono con formato no estándar' };
  if (p.id === 4 || p.id === 15) return { ...base, validacion:'correcta', motivo:null };
  return { ...base, validacion:'correcta', motivo:null };
}).concat([
  { planta:7, puerta:'A', nombre:'Pablo Estévez Ortiz',  email:'pablo.estevez@email.es', telefono:'+34 612 800 111', tipo:'propietario', cuota:187, validacion:'bloqueada', motivo:'Planta 7 inexistente — Dr. Domagk 2 tiene 6 plantas' },
]);

const DOCUMENTOS = {
  actas: [
    { id:1, nombre:'Acta Junta Ordinaria Dr. Domagk 2 — 2025-12-18.pdf',  tipo:'pdf', tamano:'342 KB', fecha:'2025-12-19', autor:1 },
    { id:2, nombre:'Acta Junta Extraordinaria Dr. Domagk 2 — 2025-09-22.pdf', tipo:'pdf', tamano:'218 KB', fecha:'2025-09-23', autor:1 },
    { id:3, nombre:'Cierre de cuentas 2025 — Dr. Domagk 2.pdf',           tipo:'pdf', tamano:'1.2 MB', fecha:'2026-05-15', autor:1 },
    { id:4, nombre:'Presupuesto 2026 Dr. Domagk 2 aprobado.pdf',          tipo:'pdf', tamano:'512 KB', fecha:'2025-12-20', autor:1 },
    { id:5, nombre:'Acta votación cambio limpieza.pdf',                   tipo:'pdf', tamano:'156 KB', fecha:'2026-05-06', autor:1 },
    { id:6, nombre:'Acta votación reforma portal Dr. Domagk 2.pdf',       tipo:'pdf', tamano:'198 KB', fecha:'2026-05-19', autor:1 },
  ],
  estatutos: [
    { id:7, nombre:'Estatutos Comunidad Dr. Domagk 2 (vigente 2024).pdf', tipo:'pdf', tamano:'480 KB', fecha:'2024-03-15', autor:1 },
    { id:8, nombre:'Reglamento interno Dr. Domagk 2 v.2026.pdf',          tipo:'pdf', tamano:'214 KB', fecha:'2026-05-19', autor:1 },
    { id:9, nombre:'Modificación estatutos 2022.pdf',                     tipo:'pdf', tamano:'92 KB',  fecha:'2022-06-10', autor:1 },
  ],
  seguros: [
    { id:10, nombre:'Póliza multirriesgo Mapfre 2026.pdf',                tipo:'pdf', tamano:'624 KB', fecha:'2026-01-12', autor:1 },
    { id:11, nombre:'Cobertura ascensor Otis 2026.pdf',                   tipo:'pdf', tamano:'188 KB', fecha:'2026-01-12', autor:1 },
    { id:12, nombre:'Parte siniestro filtración 5ºA.pdf',                  tipo:'pdf', tamano:'724 KB', fecha:'2026-05-09', autor:1 },
  ],
  contratos: [
    { id:13, nombre:'Contrato Limpiezas Galán & Hijos.pdf',                tipo:'pdf', tamano:'298 KB', fecha:'2026-05-08', autor:1 },
    { id:14, nombre:'Contrato mantenimiento ascensor Otis.pdf',            tipo:'pdf', tamano:'402 KB', fecha:'2024-11-01', autor:1 },
    { id:15, nombre:'Contrato administración fincas Dr. Domagk 2.pdf',     tipo:'pdf', tamano:'156 KB', fecha:'2023-01-15', autor:1 },
  ],
  certificados: [
    { id:16, nombre:'Certificado eficiencia energética Dr. Domagk 2.pdf',  tipo:'pdf', tamano:'892 KB', fecha:'2024-09-30', autor:1 },
    { id:17, nombre:'Inspección técnica edificio (ITE).pdf',               tipo:'pdf', tamano:'1.4 MB', fecha:'2023-11-08', autor:1 },
    { id:18, nombre:'Boletín eléctrico 2025.pdf',                          tipo:'pdf', tamano:'320 KB', fecha:'2025-04-22', autor:1 },
  ],
};

const CARPETAS_DOC = [
  { key:'actas',        nombre:'Actas Junta Dr. Domagk 2',  icon:'file-text',       color:'brand'   },
  { key:'estatutos',    nombre:'Estatutos y reglamento',     icon:'book-open',       color:'purple'  },
  { key:'seguros',      nombre:'Seguros',                    icon:'shield-check',    color:'emerald' },
  { key:'contratos',    nombre:'Contratos',                  icon:'file-signature',  color:'amber'   },
  { key:'certificados', nombre:'Certificados',               icon:'award',           color:'rose'    },
];

// ===========================================================================
// STATE
// ===========================================================================

const STATE = {
  currentView: 'dashboard',
  darkMode: false,
  sidebarOpen: false,
  rol: 'admin',
  rolDropdownOpen: false,
  incidenciasFilter: { estado: 'todas', categoria: null, prioridad: null },
  notifFilter: 'todas',
  votFilter: 'abiertas',
  docsFolder: null,
  notifReadIds: new Set(NOTIFICACIONES.filter(n => n.leido).map(n => n.id)),
  notifAcusados: new Map(), // id -> timestamp
  incidenciaEstadoOverride: new Map(), // id -> nuevoEstado (sesión)
  mensajesExtra: new Map(),  // incidenciaId -> [mensaje, ...]
  onboardingDismissed: false,
  directorioVista: 'tabla', // 'tabla' | 'plano'
  directorioFiltro: 'todos',
  directorioBusqueda: '',
  wizardVecinos: null,
  wizardGastos: null,
};

// ===========================================================================
// UTILITIES
// ===========================================================================

function getPropietario(id) {
  if (id === 'USUARIO_ACTUAL') return USUARIO_ACTUAL;
  if (id === 'SYSTEM') return { nombre:'Sistema', avatar:'··', from:'#94a3b8', to:'#64748b' };
  return PROPIETARIOS.find(p => p.id === id) || { nombre:'—', avatar:'··', from:'#94a3b8', to:'#64748b' };
}

function isAdmin()        { return STATE.rol === 'admin'; }
function isJunta()        { return STATE.rol === 'junta'; }
function isAdminOrJunta() { return STATE.rol === 'admin' || STATE.rol === 'junta'; }
function canSeeView(key)  { return ROLES[STATE.rol].allow.includes(key); }

function formatCurrency(n) {
  return new Intl.NumberFormat('es-ES', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(n);
}
function formatNumber(n) { return new Intl.NumberFormat('es-ES').format(n); }
function formatDateLong(iso) {
  return new Date(iso).toLocaleDateString('es-ES', { day:'numeric', month:'short', year:'numeric' });
}
function formatDateShort(iso) {
  return new Date(iso).toLocaleDateString('es-ES', { day:'2-digit', month:'2-digit', year:'2-digit' });
}
function formatDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', { day:'2-digit', month:'short', year:'numeric' }) + ' · ' + d.toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit' });
}

function relativeTime(iso) {
  const d = new Date(iso);
  const diff = (HOY - d) / 1000;
  if (diff < 60) return 'hace unos segundos';
  if (diff < 3600) return `hace ${Math.floor(diff/60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff/3600)} h`;
  if (diff < 172800) return 'ayer';
  if (diff < 604800) return `hace ${Math.floor(diff/86400)} días`;
  return formatDateLong(iso);
}

function diasRestantes(isoFin) {
  const diff = (new Date(isoFin) - HOY) / 1000 / 86400;
  if (diff < 0) return 0;
  return Math.ceil(diff);
}

// Devuelve "en 4d 12h" o "hace 6d 5h" para la fecha indicada.
// Combínalo con un prefijo: `Cierra ${formatCountdown(fecha)}` → "Cierra en 4d 12h".
function formatCountdown(targetISO) {
  const diffSec = (new Date(targetISO) - HOY) / 1000;
  if (Math.abs(diffSec) < 60) return diffSec >= 0 ? 'ahora' : 'hace instantes';
  const total = Math.abs(diffSec);
  const days  = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const mins  = Math.floor((total % 3600) / 60);
  let txt;
  if (days  > 0) txt = `${days}d ${hours}h`;
  else if (hours > 0) txt = `${hours}h ${mins}m`;
  else txt = `${mins}m`;
  return diffSec >= 0 ? `en ${txt}` : `hace ${txt}`;
}

function saludo() {
  const h = HOY.getHours();
  if (h < 12)  return 'Buenos días';
  if (h < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

function avatar(persona, size = 'md', extraClass = '') {
  const sizes = {
    xs:'w-6 h-6 text-[10px]',
    sm:'w-8 h-8 text-xs',
    md:'w-10 h-10 text-sm',
    lg:'w-12 h-12 text-base',
    xl:'w-16 h-16 text-lg',
  };
  return `<div class="avatar rounded-full ${sizes[size]} ${extraClass}" style="--avatar-from:${persona.from||'#6366f1'};--avatar-to:${persona.to||'#8b5cf6'}" aria-hidden="true">${persona.avatar||'??'}</div>`;
}

function estadoEffective(incidencia) {
  return STATE.incidenciaEstadoOverride.get(incidencia.id) || incidencia.estado;
}

function estadoBadge(estado) {
  const e = ESTADOS_INCIDENCIA[estado];
  if (!e) return '';
  const palette = {
    slate:   { bg:'bg-slate-100 dark:bg-slate-700/50',         text:'text-slate-700 dark:text-slate-300',     dot:'bg-slate-500' },
    blue:    { bg:'bg-blue-100 dark:bg-blue-500/20',           text:'text-blue-700 dark:text-blue-300',       dot:'bg-blue-500' },
    indigo:  { bg:'bg-indigo-100 dark:bg-indigo-500/20',       text:'text-indigo-700 dark:text-indigo-300',   dot:'bg-indigo-500' },
    amber:   { bg:'bg-amber-100 dark:bg-amber-500/20',         text:'text-amber-700 dark:text-amber-300',     dot:'bg-amber-500' },
    orange:  { bg:'bg-orange-100 dark:bg-orange-500/20',       text:'text-orange-700 dark:text-orange-300',   dot:'bg-orange-500' },
    emerald: { bg:'bg-emerald-100 dark:bg-emerald-500/20',     text:'text-emerald-700 dark:text-emerald-300', dot:'bg-emerald-500' },
    zinc:    { bg:'bg-zinc-100 dark:bg-zinc-700/50',           text:'text-zinc-700 dark:text-zinc-300',       dot:'bg-zinc-500' },
  };
  const c = palette[e.color] || palette.slate;
  return `<span class="badge ${c.bg} ${c.text}"><span class="inline-block w-1.5 h-1.5 rounded-full ${c.dot}"></span>${e.label}</span>`;
}

function prioridadBadge(p) {
  const map = {
    alta:  { label:'Alta',  bg:'bg-red-100 dark:bg-red-500/20',    text:'text-red-700 dark:text-red-300' },
    media: { label:'Media', bg:'bg-amber-100 dark:bg-amber-500/20',text:'text-amber-700 dark:text-amber-300' },
    baja:  { label:'Baja',  bg:'bg-slate-100 dark:bg-slate-700',   text:'text-slate-600 dark:text-slate-300' },
  };
  const e = map[p] || map.media;
  return `<span class="badge ${e.bg} ${e.text}">${e.label}</span>`;
}

function categoriaBadge(catKey) {
  const cat = CATEGORIAS_INCIDENCIA[catKey];
  if (!cat) return '';
  return `<span class="badge bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"><i data-lucide="${cat.icon}" class="w-3 h-3"></i>${cat.label}</span>`;
}

function notifTipoBadge(tipo) {
  const t = TIPOS_NOTIFICACION[tipo];
  if (!t) return '';
  const colors = {
    brand:  { bg:'bg-brand-100 dark:bg-brand-500/20',    text:'text-brand-700 dark:text-brand-300' },
    slate:  { bg:'bg-slate-100 dark:bg-slate-800',        text:'text-slate-700 dark:text-slate-300' },
    emerald:{ bg:'bg-emerald-100 dark:bg-emerald-500/20',text:'text-emerald-700 dark:text-emerald-300' },
    red:    { bg:'bg-red-100 dark:bg-red-500/20',        text:'text-red-700 dark:text-red-300' },
  };
  const c = colors[t.color];
  return `<span class="badge ${c.bg} ${c.text}"><i data-lucide="${t.icon}" class="w-3 h-3"></i>${t.label}</span>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

function plantaLabel(p) {
  if (p === 0) return 'Planta baja';
  if (p === 1) return '1ª planta';
  return `${p}ª planta`;
}

function unidadCorta(p) {
  if (p.planta === 0) return `0º${p.puerta}`;
  return `${p.planta}º${p.puerta}`;
}

// ===========================================================================
// CHART RENDERERS (SVG)
// ===========================================================================

function renderBarChart(data, opts = {}) {
  const { height = 200, color = '#1d639b', showLabels = true, formatY = formatNumber } = opts;
  const max = Math.max(...data.map(d => d.value), 1);
  const barW = 70 / data.length;
  let bars = '', labels = '';
  data.forEach((d, i) => {
    const barH = (d.value / max) * 75;
    const xAdj = (100 / data.length) * i + (100 / data.length - barW) / 2;
    const y = 85 - barH;
    bars += `<rect class="chart-bar" x="${xAdj}" y="${y}" width="${barW}" height="${barH}" rx="1.2" fill="${d.color || color}"><title>${escapeHtml(d.label)}: ${formatY(d.value)}</title></rect>`;
    if (showLabels) labels += `<text x="${xAdj + barW/2}" y="95" text-anchor="middle" font-size="4.2" class="fill-slate-500 dark:fill-slate-400" font-weight="500">${escapeHtml(d.label)}</text>`;
  });
  let gridlines = '';
  for (let i = 0; i <= 3; i++) {
    const y = 10 + (i * 25);
    gridlines += `<line x1="0" x2="100" y1="${y}" y2="${y}" stroke="currentColor" stroke-opacity="0.08" stroke-width="0.3"/>`;
  }
  return `<svg viewBox="0 0 100 100" class="w-full" style="height:${height}px" preserveAspectRatio="none" role="img" aria-label="Gráfico de barras">${gridlines}${bars}${labels}</svg>`;
}

function renderDonutChart(data, opts = {}) {
  const { size = 200, strokeWidth = 22, centerLabel = '', centerSubLabel = '' } = opts;
  const r = 42, cx = 50, cy = 50;
  const circumference = 2 * Math.PI * r;
  const total = data.reduce((s, d) => s + d.value, 0);
  let segments = '', offset = 0;
  data.forEach(d => {
    const pct = d.value / total;
    const len = pct * circumference;
    segments += `<circle class="donut-segment" cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${d.color}" stroke-width="${strokeWidth/2.5}" stroke-dasharray="${len} ${circumference-len}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})"><title>${escapeHtml(d.label)}: ${d.value} (${(pct*100).toFixed(0)}%)</title></circle>`;
    offset += len;
  });
  const labelHtml = centerLabel
    ? `<text x="50" y="48" text-anchor="middle" font-size="14" font-weight="700" class="fill-slate-900 dark:fill-slate-100">${escapeHtml(centerLabel)}</text>
       <text x="50" y="58" text-anchor="middle" font-size="5.5" class="fill-slate-500 dark:fill-slate-400">${escapeHtml(centerSubLabel)}</text>`
    : '';
  return `<svg viewBox="0 0 100 100" style="width:${size}px;height:${size}px;max-width:100%" role="img" aria-label="Gráfico circular">${segments}${labelHtml}</svg>`;
}

function renderLineChart(data, opts = {}) {
  const { height = 220, color = '#1d639b', area = true } = opts;
  const values = data.map(d => d.value);
  const max = Math.max(...values, 1);
  const step = 100 / (data.length - 1);
  const points = values.map((v, i) => ({ x: i * step, y: 85 - (v / max) * 70 }));
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${path} L ${points[points.length - 1].x} 85 L 0 85 Z`;
  let gridlines = '';
  for (let i = 0; i <= 3; i++) {
    const y = 15 + (i * 23);
    gridlines += `<line x1="0" x2="100" y1="${y}" y2="${y}" stroke="currentColor" stroke-opacity="0.08" stroke-width="0.3"/>`;
  }
  const labels = data.map((d, i) => `<text x="${i*step}" y="95" text-anchor="middle" font-size="3.6" class="fill-slate-500 dark:fill-slate-400">${escapeHtml(d.label)}</text>`).join('');
  const dots = points.map((p, i) => p.y < 85
    ? `<circle class="line-point" cx="${p.x}" cy="${p.y}" r="1.4" fill="${color}" stroke="white" stroke-width="0.5"><title>${escapeHtml(data[i].label)}: ${formatNumber(data[i].value)}</title></circle>`
    : ''
  ).join('');
  return `<svg viewBox="0 0 100 100" class="w-full" style="height:${height}px" preserveAspectRatio="none" role="img" aria-label="Gráfico de línea">
    ${gridlines}
    ${area ? `<path d="${areaPath}" fill="${color}" fill-opacity="0.12"/>` : ''}
    <path d="${path}" fill="none" stroke="${color}" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
    ${dots}${labels}
  </svg>`;
}

function renderStackedBar(favor, contra, abstencion) {
  const total = favor + contra + abstencion;
  if (total === 0) return '<div class="h-2 bg-slate-100 dark:bg-slate-800 rounded-full"></div>';
  const fPct = (favor / total) * 100;
  const cPct = (contra / total) * 100;
  const aPct = (abstencion / total) * 100;
  return `
    <div class="flex h-2 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
      <div class="bar-segment bg-emerald-500" style="width:${fPct}%" title="A favor: ${favor}"></div>
      <div class="bar-segment bg-red-500" style="width:${cPct}%" title="En contra: ${contra}"></div>
      <div class="bar-segment bg-slate-400 dark:bg-slate-500" style="width:${aPct}%" title="Abstención: ${abstencion}"></div>
    </div>
  `;
}

// ===========================================================================
// RENDER VIEWS
// ===========================================================================

function renderDashboard() {
  const incidenciasAbiertas = INCIDENCIAS.filter(i => !['resuelta','cerrada'].includes(estadoEffective(i))).length;
  const notifSinLeer = NOTIFICACIONES.filter(n => !STATE.notifReadIds.has(n.id)).length;
  const votacionesActivas = VOTACIONES.filter(v => v.estado === 'activa').length;
  const pctEjecutado = Math.round(PRESUPUESTO.ejecutado / PRESUPUESTO.anual * 100);
  const persona = ROLES[STATE.rol].persona;
  const nombreCorto = persona.nombre.split(' ')[0];

  const ultimasIncidencias = [...INCIDENCIAS]
    .filter(i => !['resuelta','cerrada'].includes(estadoEffective(i)))
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 5);

  const actividad = [
    { iso:'2026-05-26T08:42:00', persona:USUARIO_ACTUAL,        accion:'importó 26 movimientos al',     target:'Presupuesto 2026' },
    { iso:'2026-05-25T18:00:00', persona:getPropietario(10),    accion:'abrió incidencia',              target:'Buzón 2ºB forzado, no cierra' },
    { iso:'2026-05-25T17:45:00', persona:getPropietario(22),    accion:'abrió incidencia',              target:'Goteo grifo terraza comunitaria' },
    { iso:'2026-05-25T16:00:00', persona:USUARIO_ACTUAL,        accion:'pasó a Pendiente vecino',       target:'Empresa limpieza no vino jueves' },
    { iso:'2026-05-24T19:30:00', persona:getPropietario(17),    accion:'comentó en',                    target:'Ascensor parado en planta 4' },
    { iso:'2026-05-24T17:30:00', persona:USUARIO_ACTUAL,        accion:'publicó convocatoria',          target:'Aprobación cuentas 2025' },
    { iso:'2026-05-24T11:20:00', persona:USUARIO_ACTUAL,        accion:'cambió a Pendiente proveedor',  target:'Ascensor parado en planta 4' },
    { iso:'2026-05-23T17:00:00', persona:USUARIO_ACTUAL,        accion:'publicó notificación urgente',  target:'Corte de agua programado' },
  ];

  const votacionesAct = VOTACIONES.filter(v => v.estado === 'activa');

  const onboarding = !STATE.onboardingDismissed && isAdmin() ? `
    <div class="onboarding-banner rounded-xl px-5 py-4 mb-6 flex items-start gap-4">
      <div class="w-10 h-10 rounded-lg bg-brand-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
        <i data-lucide="sparkles" class="w-5 h-5"></i>
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-slate-900 dark:text-slate-100 mb-0.5">Bienvenido a la Comunidad Dr. Domagk 2</p>
        <p class="text-sm text-slate-600 dark:text-slate-300">¿Quieres importar tu lista de vecinos y unidades desde Excel? La plataforma envía las invitaciones por ti.</p>
      </div>
      <div class="flex items-center gap-2 flex-shrink-0">
        <button onclick="abrirWizardVecinos()" class="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
          <i data-lucide="upload-cloud" class="w-4 h-4"></i> Iniciar carga inicial
        </button>
        <button onclick="dismissOnboarding()" class="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100" aria-label="Cerrar">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>
    </div>
  ` : '';

  return `
    <div class="px-6 lg:px-10 py-8 max-w-[1400px] mx-auto">
      ${onboarding}
      <div class="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-1">${formatDateLong(HOY.toISOString())} · ${FINCA.nombre}</p>
          <h1 class="text-3xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">${saludo()}, ${nombreCorto}</h1>
          <p class="text-slate-600 dark:text-slate-400 mt-1">Esto es lo que necesita tu atención hoy en ${FINCA.nombre_corto}.</p>
        </div>
        <button class="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-lg text-sm transition-colors shadow-sm">
          <i data-lucide="plus" class="w-4 h-4"></i> Nueva incidencia
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        ${kpiCard({ label:'Incidencias sin cerrar', value:incidenciasAbiertas, icon:'alert-circle', trend:'+3 esta semana',                        trendColor:'text-amber-600 dark:text-amber-400',   accent:'brand',   view:'incidencias' })}
        ${kpiCard({ label:'Comunicados sin leer',   value:notifSinLeer,        icon:'megaphone',    trend:'Última hace 2 días',                   trendColor:'text-slate-500 dark:text-slate-400', accent:'red',     view:'notificaciones' })}
        ${kpiCard({ label:'Votaciones activas',     value:votacionesActivas,   icon:'vote',         trend:isAdminOrJunta()?'Quórum alcanzado · 79%':'Tu voto pendiente', trendColor:'text-brand-600 dark:text-brand-400', accent:'emerald', view:'votaciones' })}
        ${kpiCard({ label:'Presupuesto ejecutado',  value:pctEjecutado+'%',    icon:'trending-up',  trend:formatCurrency(PRESUPUESTO.ejecutado)+' de '+formatCurrency(PRESUPUESTO.anual), trendColor:'text-slate-500 dark:text-slate-400', accent:'amber', view:'presupuesto' })}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div class="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100">Actividad reciente</h2>
            <button class="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline">Ver toda</button>
          </div>
          <div class="space-y-4">
            ${actividad.map(a => `
              <div class="timeline-item flex gap-3 items-start">
                ${avatar(a.persona, 'sm')}
                <div class="flex-1 min-w-0 pb-1">
                  <p class="text-sm text-slate-900 dark:text-slate-100 leading-snug">
                    <span class="font-medium">${a.persona.nombre.split(' ').slice(0,2).join(' ')}</span>
                    <span class="text-slate-600 dark:text-slate-400"> ${a.accion} </span>
                    <span class="font-medium">${a.target}</span>
                  </p>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">${relativeTime(a.iso)}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100">Votaciones activas</h2>
            ${canSeeView('votaciones') ? `<button onclick="navigateTo('votaciones')" class="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline">Ver todas</button>` : ''}
          </div>
          <div class="space-y-5">
            ${votacionesAct.slice(0,2).map(v => {
              const part = v.favor + v.contra + v.abstencion;
              const pctPart = Math.round(part / v.elegibles * 100);
              return `
                <div>
                  <p class="font-medium text-sm text-slate-900 dark:text-slate-100 line-clamp-2 mb-1">${v.titulo}</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mb-2">Cierra ${formatCountdown(v.fecha_fin)}</p>
                  ${renderStackedBar(v.favor, v.contra, v.abstencion)}
                  <div class="flex items-center justify-between mt-2 text-xs">
                    <span class="text-slate-600 dark:text-slate-400">${part}/${v.elegibles} votos · ${pctPart}%</span>
                    ${canSeeView('votaciones') ? `<button onclick="navigateTo('votaciones')" class="font-medium text-brand-600 dark:text-brand-400">Votar →</button>` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div class="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div class="px-6 py-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
            <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100">Últimas incidencias</h2>
            <button onclick="navigateTo('incidencias')" class="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline">Ver todas</button>
          </div>
          <div class="divide-y divide-slate-100 dark:divide-slate-800">
            ${ultimasIncidencias.map(i => {
              const autor = getPropietario(i.autor);
              return `
                <button onclick="openIncidencia(${i.id})" class="w-full text-left px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center gap-4">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1 flex-wrap">
                      ${prioridadBadge(i.prioridad)}
                      ${estadoBadge(estadoEffective(i))}
                    </div>
                    <p class="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">${i.titulo}</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${autor.nombre.split(' ').slice(0,2).join(' ')} · ${relativeTime(i.fecha)} · ${(MENSAJES_INCIDENCIA[i.id]||[]).length+ (STATE.mensajesExtra.get(i.id)||[]).length} mensajes</p>
                  </div>
                  <i data-lucide="chevron-right" class="w-4 h-4 text-slate-400 flex-shrink-0"></i>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">Gasto por categoría</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">Ejecución 2026 acumulada</p>
          <div class="flex justify-center mb-4">
            ${renderDonutChart(
              PRESUPUESTO.categorias.map(c => ({ label:c.nombre, value:c.importe, color:c.color })),
              { size:180, centerLabel:formatCurrency(PRESUPUESTO.ejecutado), centerSubLabel:'ejecutado' }
            )}
          </div>
          <ul class="space-y-2">
            ${PRESUPUESTO.categorias.slice(0,4).map(c => `
              <li class="flex items-center justify-between text-xs">
                <span class="flex items-center gap-2 text-slate-700 dark:text-slate-300"><span class="w-2 h-2 rounded-full" style="background:${c.color}"></span>${c.nombre}</span>
                <span class="font-medium text-slate-900 dark:text-slate-100 tabular-nums">${formatCurrency(c.importe)}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100">Ejecución mensual 2026</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">Gasto acumulado mes a mes</p>
          </div>
          <div class="flex items-center gap-4 text-xs">
            <span class="flex items-center gap-1.5 text-slate-600 dark:text-slate-400"><span class="w-2 h-2 rounded-full bg-brand-500"></span>Gasto mensual</span>
          </div>
        </div>
        ${renderLineChart(PRESUPUESTO.mensual.slice(0,5).map(m => ({ label:m.mes, value:m.importe })), { height:200 })}
      </div>
    </div>
  `;
}

function kpiCard({ label, value, icon, trend, trendColor, accent, view }) {
  const accents = {
    brand:   { bg:'bg-brand-50 dark:bg-brand-500/10',     text:'text-brand-600 dark:text-brand-400' },
    red:     { bg:'bg-red-50 dark:bg-red-500/10',         text:'text-red-600 dark:text-red-400' },
    emerald: { bg:'bg-emerald-50 dark:bg-emerald-500/10', text:'text-emerald-600 dark:text-emerald-400' },
    amber:   { bg:'bg-amber-50 dark:bg-amber-500/10',     text:'text-amber-600 dark:text-amber-400' },
  };
  const a = accents[accent];
  const clickable = canSeeView(view);
  return `
    <${clickable ? `button onclick="navigateTo('${view}')"` : 'div'} class="kpi-card card-hover text-left bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 ${clickable ? 'hover:border-slate-300 dark:hover:border-slate-700' : 'opacity-90'}">
      <div class="flex items-start justify-between mb-3">
        <span class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">${label}</span>
        <div class="w-9 h-9 rounded-lg ${a.bg} flex items-center justify-center">
          <i data-lucide="${icon}" class="w-4 h-4 ${a.text}"></i>
        </div>
      </div>
      <p class="text-3xl font-semibold text-slate-900 dark:text-slate-50 tabular-nums tracking-tight">${value}</p>
      <p class="text-xs ${trendColor} mt-2">${trend}</p>
    </${clickable ? 'button' : 'div'}>
  `;
}

function renderIncidencias() {
  const filtros = STATE.incidenciasFilter;
  let lista = INCIDENCIAS.map(i => ({ ...i, _estado: estadoEffective(i) }));
  if (filtros.estado !== 'todas') {
    if (filtros.estado === 'sin_cerrar') lista = lista.filter(i => i._estado !== 'cerrada');
    else lista = lista.filter(i => i._estado === filtros.estado);
  }
  if (filtros.categoria) lista = lista.filter(i => i.categoria === filtros.categoria);
  if (filtros.prioridad) lista = lista.filter(i => i.prioridad === filtros.prioridad);
  lista.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  const filtroBtn = (key, label, count) => {
    const active = filtros.estado === key;
    return `<button onclick="filterIncidencias('${key}')" class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${active ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}">${label}${count !== undefined ? ` <span class="${active ? 'opacity-80' : 'text-slate-400'} tabular-nums">${count}</span>` : ''}</button>`;
  };

  const counts = {};
  ESTADO_ORDER.forEach(e => { counts[e] = INCIDENCIAS.filter(i => estadoEffective(i) === e).length; });
  const totalSinCerrar = INCIDENCIAS.filter(i => estadoEffective(i) !== 'cerrada').length;

  return `
    <div class="px-6 lg:px-10 py-8 max-w-[1400px] mx-auto">
      <div class="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 class="text-3xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">Incidencias</h1>
          <p class="text-slate-600 dark:text-slate-400 mt-1">${INCIDENCIAS.length} incidencias · ${totalSinCerrar} sin cerrar · Comunidad ${FINCA.nombre_corto}</p>
        </div>
        <button class="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-lg text-sm transition-colors shadow-sm">
          <i data-lucide="plus" class="w-4 h-4"></i> Nueva incidencia
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-6">
        <div>
          <div class="flex items-center gap-1 mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 overflow-x-auto">
            ${filtroBtn('todas', 'Todas', INCIDENCIAS.length)}
            ${filtroBtn('sin_cerrar', 'Sin cerrar', totalSinCerrar)}
            ${ESTADO_ORDER.map(e => filtroBtn(e, ESTADOS_INCIDENCIA[e].label, counts[e])).join('')}
          </div>

          <div class="space-y-3">
            ${lista.length === 0 ? `
              <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center">
                <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <i data-lucide="inbox" class="w-5 h-5 text-slate-400"></i>
                </div>
                <p class="font-medium text-slate-900 dark:text-slate-100">Sin incidencias con estos filtros</p>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Prueba a cambiar los filtros o crea una nueva incidencia.</p>
              </div>
            ` : lista.map(i => {
              const autor = getPropietario(i.autor);
              const msgsTotal = (MENSAJES_INCIDENCIA[i.id]||[]).length + (STATE.mensajesExtra.get(i.id)||[]).length;
              return `
                <button onclick="openIncidencia(${i.id})" class="card-hover w-full text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm">
                  <div class="flex items-start gap-4">
                    <div class="flex-shrink-0 w-1 self-stretch rounded-full ${i.prioridad === 'alta' ? 'bg-red-500' : i.prioridad === 'media' ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'}"></div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-2 flex-wrap">
                        ${estadoBadge(i._estado)}
                        ${categoriaBadge(i.categoria)}
                        ${prioridadBadge(i.prioridad)}
                      </div>
                      <h3 class="font-semibold text-slate-900 dark:text-slate-100 mb-1">${i.titulo}</h3>
                      <p class="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">${i.descripcion}</p>
                      <div class="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                        <span class="flex items-center gap-1.5">${avatar(autor,'xs')} ${autor.nombre.split(' ').slice(0,2).join(' ')}</span>
                        <span class="flex items-center gap-1"><i data-lucide="map-pin" class="w-3 h-3"></i>${i.ubicacion||''}</span>
                        <span class="flex items-center gap-1"><i data-lucide="clock" class="w-3 h-3"></i>${relativeTime(i.fecha)}</span>
                        <span class="flex items-center gap-1"><i data-lucide="thumbs-up" class="w-3 h-3"></i>${i.votos}</span>
                        <span class="flex items-center gap-1"><i data-lucide="message-circle" class="w-3 h-3"></i>${msgsTotal}</span>
                      </div>
                    </div>
                  </div>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <aside class="space-y-6">
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <h3 class="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-4">Categoría</h3>
            <ul class="space-y-1">
              <li><button onclick="filterCategoria(null)" class="w-full text-left text-sm px-2 py-1.5 rounded-md ${!filtros.categoria ? 'bg-slate-100 dark:bg-slate-800 font-medium text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}">Todas las categorías</button></li>
              ${Object.entries(CATEGORIAS_INCIDENCIA).filter(([k]) => k !== 'general').map(([k, c]) => {
                const count = INCIDENCIAS.filter(i => i.categoria === k).length;
                if (count === 0) return '';
                return `<li><button onclick="filterCategoria('${k}')" class="w-full flex items-center justify-between text-sm px-2 py-1.5 rounded-md ${filtros.categoria === k ? 'bg-slate-100 dark:bg-slate-800 font-medium text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}">
                  <span class="flex items-center gap-2"><i data-lucide="${c.icon}" class="w-3.5 h-3.5"></i>${c.label}</span>
                  <span class="text-xs text-slate-400 dark:text-slate-500">${count}</span>
                </button></li>`;
              }).join('')}
            </ul>
          </div>

          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <h3 class="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-4">Prioridad</h3>
            <ul class="space-y-1">
              <li><button onclick="filterPrioridad(null)" class="w-full text-left text-sm px-2 py-1.5 rounded-md ${!filtros.prioridad ? 'bg-slate-100 dark:bg-slate-800 font-medium text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}">Todas</button></li>
              ${['alta','media','baja'].map(p => {
                const count = INCIDENCIAS.filter(i => i.prioridad === p).length;
                const dot = p === 'alta' ? 'bg-red-500' : p === 'media' ? 'bg-amber-500' : 'bg-slate-400';
                return `<li><button onclick="filterPrioridad('${p}')" class="w-full flex items-center justify-between text-sm px-2 py-1.5 rounded-md ${filtros.prioridad === p ? 'bg-slate-100 dark:bg-slate-800 font-medium text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}">
                  <span class="flex items-center gap-2"><span class="w-2 h-2 rounded-full ${dot}"></span>${p.charAt(0).toUpperCase()+p.slice(1)}</span>
                  <span class="text-xs text-slate-400 dark:text-slate-500">${count}</span>
                </button></li>`;
              }).join('')}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  `;
}

function renderVotaciones() {
  const todas = VOTACIONES.map(v => ({ ...v }));
  const conteo = {
    abiertas: todas.filter(v => v.estado === 'activa').length,
    proximas: todas.filter(v => v.estado === 'proxima').length,
    cerradas: todas.filter(v => v.estado.startsWith('cerrada')).length,
  };
  conteo.todas = todas.length;

  let lista = todas;
  if (STATE.votFilter === 'abiertas') lista = todas.filter(v => v.estado === 'activa');
  else if (STATE.votFilter === 'proximas') lista = todas.filter(v => v.estado === 'proxima');
  else if (STATE.votFilter === 'cerradas') lista = todas.filter(v => v.estado.startsWith('cerrada'));

  const filtroBtn = (key, label) => {
    const active = STATE.votFilter === key;
    return `<button onclick="filterVotaciones('${key}')" class="px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${active ? 'border-brand-600 dark:border-brand-400 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'}">${label} <span class="text-xs ${active ? 'opacity-70' : 'text-slate-400'} tabular-nums">${conteo[key]}</span></button>`;
  };

  function cardVotacion(v) {
    const part = v.favor + v.contra + v.abstencion;
    const pctPart = Math.round(part / v.elegibles * 100);
    const pctFavor = part > 0 ? Math.round(v.favor / part * 100) : 0;
    const isActive = v.estado === 'activa';
    const isProx = v.estado === 'proxima';
    const isClosed = v.estado.startsWith('cerrada');
    const quorum = part / v.elegibles >= 0.5;
    const tipoJunta = v.tipo_junta === 'extraordinaria' ? 'Junta Extraordinaria' : 'Junta Ordinaria';

    // Marca "ahora" sobre la barra temporal
    const inicio = new Date(v.fecha_inicio).getTime();
    const fin    = new Date(v.fecha_fin).getTime();
    const ahora  = HOY.getTime();
    let progressPct = 0;
    if (isClosed) progressPct = 100;
    else if (isProx) progressPct = 0;
    else progressPct = Math.max(0, Math.min(100, Math.round(((ahora-inicio)/(fin-inicio))*100)));

    const estadoBlock = isActive
      ? '<span class="badge bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300"><span class="status-dot inline-block w-1.5 h-1.5 rounded-full bg-brand-500 text-brand-500"></span>Activa</span>'
      : isProx
        ? '<span class="badge bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300"><i data-lucide="calendar-clock" class="w-3 h-3"></i>Próxima</span>'
        : v.estado === 'cerrada_aprobada'
          ? '<span class="badge bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"><i data-lucide="check-circle-2" class="w-3 h-3"></i>Aprobada</span>'
          : '<span class="badge bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300"><i data-lucide="x-circle" class="w-3 h-3"></i>Rechazada</span>';

    const countdownText = isActive ? `Cierra ${formatCountdown(v.fecha_fin)}` : isProx ? `Abre ${formatCountdown(v.fecha_inicio)}` : `Cerrada ${formatCountdown(v.fecha_fin)}`;

    return `
      <div class="card-hover bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
        <div class="flex items-start justify-between mb-3 flex-wrap gap-2">
          <div class="flex items-center gap-2 flex-wrap">
            ${estadoBlock}
            <span class="badge bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"><i data-lucide="gavel" class="w-3 h-3"></i>${tipoJunta}</span>
            ${v.importe ? `<span class="badge bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"><i data-lucide="euro" class="w-3 h-3"></i>${formatCurrency(v.importe)}</span>` : ''}
          </div>
          <span class="text-xs font-medium ${isActive ? 'text-brand-700 dark:text-brand-300' : isProx ? 'text-slate-600 dark:text-slate-400' : 'text-slate-500 dark:text-slate-500'}">${countdownText}</span>
        </div>

        <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1.5">${v.titulo}</h3>
        <p class="text-sm text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">${v.descripcion}</p>

        <div class="grid grid-cols-3 gap-3 mb-4 text-xs">
          <div class="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2">
            <p class="text-slate-500 dark:text-slate-400 mb-0.5">Apertura</p>
            <p class="font-semibold text-slate-900 dark:text-slate-100">${formatDateShort(v.fecha_inicio)}</p>
          </div>
          <div class="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2">
            <p class="text-slate-500 dark:text-slate-400 mb-0.5">Cierre</p>
            <p class="font-semibold text-slate-900 dark:text-slate-100">${formatDateShort(v.fecha_fin)}</p>
          </div>
          <div class="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2">
            <p class="text-slate-500 dark:text-slate-400 mb-0.5">Plazo</p>
            <p class="font-semibold text-slate-900 dark:text-slate-100">${Math.round((fin-inicio)/86400000)} días</p>
          </div>
        </div>

        <div class="mb-4 relative">
          <p class="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5 font-medium">Plazo de votación</p>
          <div class="vote-timeline">
            <div class="vote-timeline-progress ${v.estado === 'cerrada_aprobada' ? 'cerrada-aprobada' : v.estado === 'cerrada_rechazada' ? 'cerrada-rechazada' : ''}" style="width:${progressPct}%"></div>
            ${isActive ? `<div class="vote-timeline-now" style="left:${progressPct}%"></div>` : ''}
          </div>
        </div>

        ${!isProx ? `
          <div class="mb-4">
            <div class="flex items-center justify-between text-xs mb-2">
              <span class="text-slate-600 dark:text-slate-400">
                <strong class="text-slate-900 dark:text-slate-100 tabular-nums">${part} de ${v.elegibles}</strong> unidades han votado (${pctPart}%)
              </span>
              <span class="badge ${quorum ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'}">
                <i data-lucide="${quorum ? 'check-circle-2' : 'alert-triangle'}" class="w-3 h-3"></i>
                ${quorum ? 'Quórum alcanzado' : `Quórum no alcanzado (faltan ${Math.max(0, Math.ceil(v.elegibles/2) - part)})`}
              </span>
            </div>
            <div class="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
              <div class="bar-segment bg-brand-500 h-full" style="width:${pctPart}%"></div>
            </div>
            ${renderStackedBar(v.favor, v.contra, v.abstencion)}
            <div class="grid grid-cols-3 gap-3 mt-3 text-xs">
              <div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-500"></span><span class="text-slate-600 dark:text-slate-400">A favor</span><span class="font-medium text-slate-900 dark:text-slate-100 ml-auto">${v.favor}</span></div>
              <div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-red-500"></span><span class="text-slate-600 dark:text-slate-400">En contra</span><span class="font-medium text-slate-900 dark:text-slate-100 ml-auto">${v.contra}</span></div>
              <div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500"></span><span class="text-slate-600 dark:text-slate-400">Abstención</span><span class="font-medium text-slate-900 dark:text-slate-100 ml-auto">${v.abstencion}</span></div>
            </div>
          </div>
        ` : `
          <div class="mb-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg px-4 py-3 text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <i data-lucide="info" class="w-4 h-4 flex-shrink-0"></i>
            La votación se abre el <strong class="text-slate-900 dark:text-slate-100">${formatDateLong(v.fecha_inicio)}</strong>. Recibirás un aviso cuando empiece.
          </div>
        `}

        ${isClosed ? `<p class="text-xs text-slate-500 dark:text-slate-400 mb-2"><i data-lucide="file-check" class="inline w-3 h-3 align-text-bottom"></i> Resultado final certificado el ${formatDateLong(v.fecha_fin)}</p>` : ''}

        <div class="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 gap-3 flex-wrap">
          <span class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400" title="Tu voto es anónimo">
            <i data-lucide="lock" class="w-3 h-3"></i> Voto anónimo
          </span>
          ${isAdminOrJunta() && !isProx ? `<button onclick="openParticipantesVotacion(${v.id})" class="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"><i data-lucide="users" class="w-3 h-3"></i>Ver quién ha votado</button>` : ''}
        </div>

        ${isActive && (STATE.rol === 'admin' || STATE.rol === 'junta' || STATE.rol === 'propietario') ? `
          <div class="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2">
            <button onclick="emitirVoto(${v.id}, 'favor')" class="px-3 py-2 text-sm font-medium rounded-lg bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-500/25 transition-colors">A favor</button>
            <button onclick="emitirVoto(${v.id}, 'contra')" class="px-3 py-2 text-sm font-medium rounded-lg bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-500/25 transition-colors">En contra</button>
            <button onclick="emitirVoto(${v.id}, 'abstencion')" class="px-3 py-2 text-sm font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Abstención</button>
          </div>
        ` : ''}
      </div>
    `;
  }

  return `
    <div class="px-6 lg:px-10 py-8 max-w-[1300px] mx-auto">
      <div class="mb-6">
        <h1 class="text-3xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">Votaciones</h1>
        <p class="text-slate-600 dark:text-slate-400 mt-1">Comunidad ${FINCA.nombre_corto} · ${conteo.abiertas} abiertas · ${conteo.proximas} próximas · ${conteo.cerradas} cerradas</p>
      </div>

      <div class="border-b border-slate-200 dark:border-slate-800 mb-6 flex gap-1 overflow-x-auto">
        ${filtroBtn('abiertas', 'Abiertas')}
        ${filtroBtn('proximas', 'Próximas')}
        ${filtroBtn('cerradas', 'Cerradas')}
        ${filtroBtn('todas', 'Todas')}
      </div>

      ${lista.length === 0 ? `
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center">
          <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <i data-lucide="vote" class="w-5 h-5 text-slate-400"></i>
          </div>
          <p class="font-medium text-slate-900 dark:text-slate-100">No hay votaciones en esta categoría</p>
        </div>
      ` : `<div class="grid grid-cols-1 lg:grid-cols-2 gap-5">${lista.map(cardVotacion).join('')}</div>`}
    </div>
  `;
}

function renderNotificaciones() {
  const filter = STATE.notifFilter;
  let lista = NOTIFICACIONES.map(n => ({ ...n, _leido: STATE.notifReadIds.has(n.id), _acusado: STATE.notifAcusados.has(n.id) }));
  if (filter === 'sin_leer') lista = lista.filter(n => !n._leido);
  else if (filter === 'urgente') lista = lista.filter(n => n.tipo === 'urgente');
  else if (filter === 'acuse') lista = lista.filter(n => n.requiere_acuse && !n._acusado);
  else if (filter !== 'todas') lista = lista.filter(n => n.tipo === filter);
  lista.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  const tabBtn = (key, label, count) => {
    const active = filter === key;
    return `<button onclick="filterNotif('${key}')" class="px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${active ? 'border-brand-600 dark:border-brand-400 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'}">${label} <span class="text-xs ${active ? 'opacity-70' : 'text-slate-400'} tabular-nums">${count}</span></button>`;
  };

  const totales = {
    todas: NOTIFICACIONES.length,
    sin_leer: NOTIFICACIONES.filter(n => !STATE.notifReadIds.has(n.id)).length,
    urgente: NOTIFICACIONES.filter(n => n.tipo === 'urgente').length,
    aviso:        NOTIFICACIONES.filter(n => n.tipo === 'aviso').length,
    convocatoria: NOTIFICACIONES.filter(n => n.tipo === 'convocatoria').length,
    resolucion:   NOTIFICACIONES.filter(n => n.tipo === 'resolucion').length,
    acuse: NOTIFICACIONES.filter(n => n.requiere_acuse && !STATE.notifAcusados.has(n.id)).length,
  };

  return `
    <div class="px-6 lg:px-10 py-8 max-w-[1100px] mx-auto">
      <div class="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 class="text-3xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">Notificaciones y Comunicados</h1>
          <p class="text-slate-600 dark:text-slate-400 mt-1">Centro oficial de comunicaciones de la Comunidad ${FINCA.nombre_corto}</p>
        </div>
        <button onclick="marcarTodasLeidas()" class="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 inline-flex items-center gap-2">
          <i data-lucide="check-check" class="w-4 h-4"></i> Marcar todas como leídas
        </button>
      </div>

      <div class="bg-brand-50/60 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/30 rounded-lg px-4 py-3 mb-6 flex items-center gap-3 text-sm">
        <i data-lucide="megaphone" class="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0"></i>
        <p class="text-slate-700 dark:text-slate-300">
          <strong>${totales.todas}</strong> comunicados oficiales ·
          <strong class="text-brand-700 dark:text-brand-300">${totales.sin_leer}</strong> sin leer ·
          <strong class="text-amber-700 dark:text-amber-300">${totales.acuse}</strong> requieren acuse de recibo
        </p>
      </div>

      <div class="border-b border-slate-200 dark:border-slate-800 mb-6 flex gap-1 overflow-x-auto">
        ${tabBtn('todas',        'Todas',           totales.todas)}
        ${tabBtn('sin_leer',     'Sin leer',        totales.sin_leer)}
        ${tabBtn('urgente',      'Urgentes',        totales.urgente)}
        ${tabBtn('aviso',        'Avisos',          totales.aviso)}
        ${tabBtn('convocatoria', 'Convocatorias',   totales.convocatoria)}
        ${tabBtn('resolucion',   'Resoluciones',    totales.resolucion)}
        ${tabBtn('acuse',        'Acuse pendiente', totales.acuse)}
      </div>

      <div class="space-y-3">
        ${lista.length === 0 ? `
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center">
            <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><i data-lucide="inbox" class="w-5 h-5 text-slate-400"></i></div>
            <p class="font-medium text-slate-900 dark:text-slate-100">No hay comunicados en esta categoría</p>
          </div>
        ` : lista.map(n => {
          const urgent = n.tipo === 'urgente';
          const borderColor = urgent ? 'border-l-red-500' : n.prioridad === 'alta' ? 'border-l-amber-500' : n.tipo === 'resolucion' ? 'border-l-emerald-500' : 'border-l-brand-500';
          const bg = urgent ? 'bg-red-50/40 dark:bg-red-500/10' : 'bg-white dark:bg-slate-900';
          const acusadoTs = STATE.notifAcusados.get(n.id);
          return `
            <div class="card-hover ${bg} border ${n._leido ? 'border-slate-200 dark:border-slate-800' : 'border-brand-300 dark:border-brand-500/40'} border-l-4 ${borderColor} rounded-xl p-5 flex items-start gap-4">
              ${!n._leido ? '<span class="status-dot inline-block w-2 h-2 rounded-full bg-brand-500 text-brand-500 mt-2 flex-shrink-0"></span>' : '<span class="inline-block w-2 h-2 mt-2 flex-shrink-0"></span>'}
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-2 flex-wrap">
                  ${notifTipoBadge(n.tipo)}
                  ${n.prioridad === 'urgente' ? '<span class="badge bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300"><i data-lucide="alert-octagon" class="w-3 h-3"></i>Urgente</span>' : n.prioridad === 'alta' ? '<span class="badge bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300">Alta</span>' : ''}
                  ${!n._leido ? '<span class="badge bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300">Sin leer</span>' : ''}
                  ${n.requiere_acuse ? `<span class="badge ${n._acusado ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'}"><i data-lucide="${n._acusado ? 'check-circle-2' : 'file-signature'}" class="w-3 h-3"></i>${n._acusado ? 'Acusado' : 'Acuse pendiente'}</span>` : ''}
                  <span class="text-xs text-slate-500 dark:text-slate-400">${formatDateLong(n.fecha)}</span>
                </div>
                <h3 class="${n._leido ? 'font-medium' : 'font-semibold'} text-slate-900 dark:text-slate-100 mb-1.5 text-base">${n.titulo}</h3>
                <p class="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-3">${n.contenido}</p>
                <div class="flex items-center justify-between flex-wrap gap-3 text-xs">
                  <span class="flex items-center gap-2 text-slate-500 dark:text-slate-400">${avatar(USUARIO_ACTUAL,'xs')} Administración Dr. Domagk 2 · Para: ${n.destinatarios}</span>
                  <div class="flex items-center gap-2">
                    ${n.requiere_acuse && !n._acusado ? `<button onclick="acuseRecibo(${n.id})" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-md font-medium text-xs"><i data-lucide="file-signature" class="w-3 h-3"></i>Acusar recibo</button>` : ''}
                    ${n.requiere_acuse && n._acusado ? `<span class="text-emerald-600 dark:text-emerald-400 font-medium">Acusado el ${formatDateTime(acusadoTs)}</span>` : ''}
                    <button onclick="openComunicado(${n.id})" class="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-md font-medium text-xs hover:bg-slate-50 dark:hover:bg-slate-800">Leer comunicado <i data-lucide="arrow-right" class="w-3 h-3"></i></button>
                    ${!n._leido ? `<button onclick="marcarLeida(${n.id})" class="text-brand-600 dark:text-brand-400 font-medium hover:underline">Marcar leído</button>` : ''}
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderDirectorio() {
  // Gating por rol — solo admin y junta
  if (!isAdminOrJunta()) {
    return `
      <div class="px-6 lg:px-10 py-16 max-w-2xl mx-auto text-center">
        <div class="w-16 h-16 mx-auto mb-5 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <i data-lucide="lock" class="w-7 h-7 text-slate-500 dark:text-slate-400"></i>
        </div>
        <h1 class="text-2xl font-semibold text-slate-900 dark:text-slate-50 mb-2">Acceso restringido</h1>
        <p class="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
          El directorio de vecinos solo es accesible para administradores y miembros de la Junta de la Comunidad ${FINCA.nombre_corto}. Esto protege la privacidad de los residentes.
        </p>
        <button onclick="navigateTo('dashboard')" class="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-lg text-sm">
          <i data-lucide="arrow-left" class="w-4 h-4"></i> Volver al dashboard
        </button>
      </div>
    `;
  }

  const ocupadas = PROPIETARIOS.filter(p => p.estado === 'ocupada').length;
  const vacias = PROPIETARIOS.filter(p => p.estado === 'vacia').length;
  const inquilinos = PROPIETARIOS.filter(p => p.tipo === 'inquilino' && p.estado === 'ocupada').length;
  const morosos = PROPIETARIOS.filter(p => p.moroso).length;

  // Filter + búsqueda
  const q = STATE.directorioBusqueda.trim().toLowerCase();
  let filtrado = PROPIETARIOS.filter(p => {
    if (STATE.directorioFiltro === 'propietarios' && (p.tipo !== 'propietario' || p.estado === 'vacia')) return false;
    if (STATE.directorioFiltro === 'inquilinos'   && (p.tipo !== 'inquilino' || p.estado === 'vacia')) return false;
    if (STATE.directorioFiltro === 'vacias'       && p.estado !== 'vacia') return false;
    if (STATE.directorioFiltro === 'morosos'      && !p.moroso) return false;
    if (q) {
      const hay = [p.nombre, p.email||'', p.telefono||'', unidadCorta(p)].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const kpis = `
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
        <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Unidades</p>
        <p class="text-2xl font-semibold text-slate-900 dark:text-slate-50 tabular-nums">${PROPIETARIOS.length}</p>
      </div>
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
        <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Ocupadas</p>
        <p class="text-2xl font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">${ocupadas}</p>
      </div>
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
        <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Inquilinos</p>
        <p class="text-2xl font-semibold text-brand-600 dark:text-brand-400 tabular-nums">${inquilinos}</p>
      </div>
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
        <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Morosos</p>
        <p class="text-2xl font-semibold ${morosos > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'} tabular-nums">${morosos}</p>
      </div>
    </div>
  `;

  const filtroOptions = [
    { key:'todos',         label:'Todos' },
    { key:'propietarios',  label:'Propietarios' },
    { key:'inquilinos',    label:'Inquilinos' },
    { key:'vacias',        label:'Vacías' },
    { key:'morosos',       label:'Morosos' },
  ];

  const actionBar = `
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-4 flex flex-wrap items-center gap-3">
      <div class="flex-1 min-w-[200px] relative">
        <i data-lucide="search" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
        <input id="dir-busqueda" type="search" value="${escapeHtml(STATE.directorioBusqueda)}" oninput="buscarDirectorio(this.value)" placeholder="Buscar nombre, planta, email o teléfono..." class="w-full h-9 pl-9 pr-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-brand-400 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400" />
      </div>
      <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
        ${filtroOptions.map(o => `<button onclick="setDirectorioFiltro('${o.key}')" class="px-3 py-1.5 rounded-md text-xs font-medium ${STATE.directorioFiltro === o.key ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'}">${o.label}</button>`).join('')}
      </div>
      <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
        <button onclick="setDirectorioVista('tabla')" class="px-3 py-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5 ${STATE.directorioVista === 'tabla' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-600 dark:text-slate-400'}"><i data-lucide="table-2" class="w-3.5 h-3.5"></i>Tabla</button>
        <button onclick="setDirectorioVista('plano')" class="px-3 py-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5 ${STATE.directorioVista === 'plano' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-600 dark:text-slate-400'}"><i data-lucide="building" class="w-3.5 h-3.5"></i>Plano</button>
      </div>
      <button class="hidden md:inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800">
        <i data-lucide="download" class="w-4 h-4"></i> Exportar
      </button>
      ${isAdmin() ? `<button onclick="abrirWizardVecinos()" class="inline-flex items-center gap-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-medium shadow-sm">
        <i data-lucide="user-plus" class="w-4 h-4"></i> Importar vecinos
      </button>` : ''}
    </div>
  `;

  let contenido = '';
  if (STATE.directorioVista === 'tabla') {
    contenido = `
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="crm-table w-full text-sm">
            <thead>
              <tr class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                <th class="px-5 py-3 text-left font-medium">Unidad</th>
                <th class="px-5 py-3 text-left font-medium">Vecino</th>
                <th class="px-5 py-3 text-left font-medium hidden md:table-cell">Contacto</th>
                <th class="px-5 py-3 text-left font-medium hidden lg:table-cell">Tipo</th>
                <th class="px-5 py-3 text-left font-medium hidden lg:table-cell">Tags</th>
                <th class="px-5 py-3 text-left font-medium hidden lg:table-cell">Cuota</th>
                <th class="px-5 py-3 text-left font-medium">Estado</th>
                <th class="px-5 py-3 text-right font-medium w-12"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              ${filtrado.length === 0 ? `<tr><td colspan="8" class="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">Sin resultados con esos filtros.</td></tr>` : filtrado.map(p => {
                const isVacia = p.estado === 'vacia';
                return `
                  <tr onclick="openPerfilVecino(${p.id})" class="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td class="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap">${unidadCorta(p)}</td>
                    <td class="px-5 py-3">
                      <div class="flex items-center gap-2.5">
                        ${avatar(p, 'sm')}
                        <div class="min-w-0">
                          <p class="font-medium ${isVacia ? 'italic text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'} truncate">${p.nombre}</p>
                          ${p.desde ? `<p class="text-[11px] text-slate-500 dark:text-slate-400">Desde ${p.desde}</p>` : ''}
                        </div>
                      </div>
                    </td>
                    <td class="px-5 py-3 hidden md:table-cell text-xs text-slate-600 dark:text-slate-400">
                      ${p.email ? `<p class="truncate max-w-[200px]">${p.email}</p>` : '—'}
                      ${p.telefono ? `<p class="text-slate-500 dark:text-slate-500 tabular-nums">${p.telefono}</p>` : ''}
                    </td>
                    <td class="px-5 py-3 hidden lg:table-cell">${isVacia ? '<span class="text-xs text-slate-400">—</span>' : `<span class="badge ${p.tipo === 'propietario' ? 'bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300' : 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300'}">${p.tipo === 'propietario' ? 'Propietario' : 'Inquilino'}</span>`}</td>
                    <td class="px-5 py-3 hidden lg:table-cell">
                      <div class="flex flex-wrap gap-1">
                        ${(p.tags||[]).slice(0,2).map(t => `<span class="badge bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">${t}</span>`).join('')}
                        ${(p.tags||[]).length > 2 ? `<span class="text-[11px] text-slate-400">+${p.tags.length-2}</span>` : ''}
                      </div>
                    </td>
                    <td class="px-5 py-3 hidden lg:table-cell text-xs text-slate-700 dark:text-slate-300 tabular-nums">${formatCurrency(p.cuota)}</td>
                    <td class="px-5 py-3">
                      ${isVacia
                        ? '<span class="badge bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Vacía</span>'
                        : p.moroso
                          ? '<span class="badge bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300"><i data-lucide="alert-triangle" class="w-3 h-3"></i>Moroso</span>'
                          : '<span class="badge bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Al día</span>'}
                    </td>
                    <td class="px-5 py-3 text-right"><i data-lucide="chevron-right" class="w-4 h-4 text-slate-400"></i></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } else {
    // Vista plano (por plantas) — compacta
    const plantas = [...new Set(PROPIETARIOS.map(p => p.planta))].sort((a,b) => b-a);
    contenido = `
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 lg:p-8">
        <div class="space-y-8 pl-4">
          ${plantas.map(planta => {
            const vivPlanta = filtrado.filter(p => p.planta === planta).sort((a,b) => a.puerta.localeCompare(b.puerta));
            if (vivPlanta.length === 0) return '';
            return `
              <div class="building-floor relative pl-6">
                <span class="building-floor-label absolute left-0 -translate-x-1/2 top-0 px-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">${plantaLabel(planta)}</span>
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mt-3">
                  ${vivPlanta.map(p => {
                    const isVacia = p.estado === 'vacia';
                    return `
                      <button onclick="openPerfilVecino(${p.id})" class="card-hover text-left flex items-center gap-3 p-3 rounded-lg border ${isVacia ? 'border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'} hover:border-slate-300 dark:hover:border-slate-700">
                        ${avatar(p, 'md')}
                        <div class="flex-1 min-w-0">
                          <p class="font-medium text-sm ${isVacia ? 'text-slate-400 dark:text-slate-500 italic' : 'text-slate-900 dark:text-slate-100'} truncate">${p.nombre}</p>
                          <p class="text-xs text-slate-500 dark:text-slate-400">Puerta ${p.puerta}${p.desde ? ` · desde ${p.desde}` : ''}</p>
                        </div>
                        ${!isVacia ? `<span class="badge ${p.tipo === 'propietario' ? 'bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300' : 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300'}">${p.tipo === 'propietario' ? 'Prop.' : 'Inq.'}</span>` : ''}
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  return `
    <div class="px-6 lg:px-10 py-8 max-w-[1400px] mx-auto">
      <div class="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <h1 class="text-3xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">Directorio de vecinos</h1>
            <span class="badge bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"><i data-lucide="lock" class="w-3 h-3"></i>Acceso interno</span>
          </div>
          <p class="text-slate-600 dark:text-slate-400">${FINCA.nombre} · ${FINCA.direccion}</p>
        </div>
      </div>
      ${kpis}
      ${actionBar}
      ${contenido}
    </div>
  `;
}

function renderPresupuesto() {
  const restante = PRESUPUESTO.anual - PRESUPUESTO.ejecutado;
  const pct = Math.round(PRESUPUESTO.ejecutado / PRESUPUESTO.anual * 100);
  const mesActualIdx = HOY.getMonth();
  const ejecutadoEsperado = PRESUPUESTO.anual * (mesActualIdx + 1) / 12;
  const desviacion = PRESUPUESTO.ejecutado - ejecutadoEsperado;

  return `
    <div class="px-6 lg:px-10 py-8 max-w-[1400px] mx-auto">
      <div class="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 class="text-3xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">Presupuesto</h1>
          <p class="text-slate-600 dark:text-slate-400 mt-1">Comunidad ${FINCA.nombre_corto} · Ejercicio 2026 · aprobado en Junta Ordinaria de diciembre 2025</p>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <button class="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800">
            <i data-lucide="calendar" class="w-4 h-4"></i> Ejercicio 2026
            <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-slate-400"></i>
          </button>
          ${isAdminOrJunta() ? `<button onclick="abrirWizardGastos()" class="inline-flex items-center gap-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-medium shadow-sm">
            <i data-lucide="upload-cloud" class="w-4 h-4"></i> Importar Excel de gastos
          </button>` : ''}
        </div>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <p class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Presupuesto anual</p>
          <p class="text-2xl font-semibold text-slate-900 dark:text-slate-50 tabular-nums">${formatCurrency(PRESUPUESTO.anual)}</p>
        </div>
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <p class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Ejecutado</p>
          <p class="text-2xl font-semibold text-brand-600 dark:text-brand-400 tabular-nums">${formatCurrency(PRESUPUESTO.ejecutado)}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${pct}% del total</p>
        </div>
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <p class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Restante</p>
          <p class="text-2xl font-semibold text-slate-900 dark:text-slate-50 tabular-nums">${formatCurrency(restante)}</p>
        </div>
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <p class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Desviación</p>
          <p class="text-2xl font-semibold ${desviacion < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'} tabular-nums">${desviacion < 0 ? '−' : '+'}${formatCurrency(Math.abs(desviacion))}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${desviacion < 0 ? 'Por debajo' : 'Por encima'} de lo previsto</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">Gasto por categoría</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-6">Ejecución 2026 acumulada</p>
          ${renderBarChart(
            PRESUPUESTO.categorias.map(c => ({ label:c.nombre.slice(0,8), value:c.importe, color:c.color })),
            { height:240, formatY:formatCurrency }
          )}
          <ul class="mt-6 space-y-2.5">
            ${PRESUPUESTO.categorias.map(c => `
              <li class="flex items-center justify-between text-sm">
                <span class="flex items-center gap-2 text-slate-700 dark:text-slate-300"><span class="w-2.5 h-2.5 rounded-sm" style="background:${c.color}"></span>${c.nombre}</span>
                <span class="font-medium text-slate-900 dark:text-slate-100 tabular-nums">${formatCurrency(c.importe)} <span class="text-slate-400 dark:text-slate-500 text-xs ml-1">${c.pct}%</span></span>
              </li>
            `).join('')}
          </ul>
        </div>

        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">Ejecución mensual</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-6">Gasto mes a mes durante 2026</p>
          ${renderLineChart(PRESUPUESTO.mensual.map(m => ({ label:m.mes, value:m.importe })), { height:240 })}
        </div>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100">Últimos movimientos</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Cargos y abonos de las últimas 4 semanas</p>
          </div>
          <button class="text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline">Ver todos</button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide bg-slate-50 dark:bg-slate-800/50">
                <th class="px-6 py-3 text-left font-medium">Fecha</th>
                <th class="px-6 py-3 text-left font-medium">Concepto</th>
                <th class="px-6 py-3 text-left font-medium">Categoría</th>
                <th class="px-6 py-3 text-right font-medium">Importe</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              ${PRESUPUESTO.movimientos.map(m => `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td class="px-6 py-3.5 text-slate-600 dark:text-slate-400 tabular-nums whitespace-nowrap">${formatDateShort(m.fecha)}</td>
                  <td class="px-6 py-3.5 text-slate-900 dark:text-slate-100 font-medium">${m.concepto}</td>
                  <td class="px-6 py-3.5"><span class="badge bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">${m.categoria}</span></td>
                  <td class="px-6 py-3.5 text-right tabular-nums font-medium ${m.importe < 0 ? 'text-slate-900 dark:text-slate-100' : 'text-emerald-600 dark:text-emerald-400'}">${m.importe < 0 ? '−' : '+'}${formatCurrency(Math.abs(m.importe))}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div class="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 text-xs text-slate-500 dark:text-slate-400">
          <i data-lucide="upload-cloud" class="inline w-3 h-3 align-text-bottom"></i> Última importación: ${formatDateLong(PRESUPUESTO.ultima_importacion)} · ${PRESUPUESTO.ultima_importacion_movs} movimientos · Por ${PRESUPUESTO.ultima_importacion_autor}
        </div>
      </div>
    </div>
  `;
}

function renderDocumentos() {
  const folder = STATE.docsFolder;
  const colors = {
    brand:   { bg:'bg-brand-50 dark:bg-brand-500/15',     text:'text-brand-600 dark:text-brand-400' },
    purple:  { bg:'bg-purple-50 dark:bg-purple-500/15',   text:'text-purple-600 dark:text-purple-400' },
    emerald: { bg:'bg-emerald-50 dark:bg-emerald-500/15', text:'text-emerald-600 dark:text-emerald-400' },
    amber:   { bg:'bg-amber-50 dark:bg-amber-500/15',     text:'text-amber-600 dark:text-amber-400' },
    rose:    { bg:'bg-rose-50 dark:bg-rose-500/15',       text:'text-rose-600 dark:text-rose-400' },
  };

  if (folder) {
    const folderInfo = CARPETAS_DOC.find(c => c.key === folder);
    const files = DOCUMENTOS[folder] || [];
    return `
      <div class="px-6 lg:px-10 py-8 max-w-[1200px] mx-auto">
        <nav class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-3" aria-label="Breadcrumb">
          <button onclick="abrirCarpeta(null)" class="hover:text-slate-900 dark:hover:text-slate-100 font-medium">Documentos</button>
          <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
          <span class="text-slate-900 dark:text-slate-100 font-medium">${folderInfo.nombre}</span>
        </nav>
        <div class="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 class="text-3xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">${folderInfo.nombre}</h1>
            <p class="text-slate-600 dark:text-slate-400 mt-1">${files.length} archivos · Comunidad ${FINCA.nombre_corto}</p>
          </div>
          ${isAdminOrJunta() ? `<button class="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-lg text-sm transition-colors shadow-sm">
            <i data-lucide="upload" class="w-4 h-4"></i> Subir archivo
          </button>` : ''}
        </div>

        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide bg-slate-50 dark:bg-slate-800/50">
                <th class="px-6 py-3 text-left font-medium">Nombre</th>
                <th class="px-6 py-3 text-left font-medium hidden md:table-cell">Subido por</th>
                <th class="px-6 py-3 text-left font-medium hidden sm:table-cell">Fecha</th>
                <th class="px-6 py-3 text-right font-medium hidden sm:table-cell">Tamaño</th>
                <th class="px-6 py-3 text-right font-medium w-20"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              ${files.map(f => {
                const autor = getPropietario(f.autor);
                return `
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td class="px-6 py-3.5">
                      <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-500/15 flex items-center justify-center flex-shrink-0">
                          <i data-lucide="file-text" class="w-4 h-4 text-red-600 dark:text-red-400"></i>
                        </div>
                        <span class="font-medium text-slate-900 dark:text-slate-100">${f.nombre}</span>
                      </div>
                    </td>
                    <td class="px-6 py-3.5 hidden md:table-cell">
                      <div class="flex items-center gap-2">${avatar(autor,'xs')}<span class="text-slate-600 dark:text-slate-400">${autor.nombre.split(' ').slice(0,2).join(' ')}</span></div>
                    </td>
                    <td class="px-6 py-3.5 text-slate-600 dark:text-slate-400 tabular-nums hidden sm:table-cell">${formatDateLong(f.fecha)}</td>
                    <td class="px-6 py-3.5 text-right text-slate-600 dark:text-slate-400 tabular-nums hidden sm:table-cell">${f.tamano}</td>
                    <td class="px-6 py-3.5 text-right">
                      <button class="inline-flex items-center justify-center w-8 h-8 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Descargar"><i data-lucide="download" class="w-4 h-4"></i></button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  return `
    <div class="px-6 lg:px-10 py-8 max-w-[1200px] mx-auto">
      <div class="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 class="text-3xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">Documentos</h1>
          <p class="text-slate-600 dark:text-slate-400 mt-1">Repositorio oficial de la Comunidad ${FINCA.nombre_corto}</p>
        </div>
        ${isAdminOrJunta() ? `<button class="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-lg text-sm transition-colors shadow-sm">
          <i data-lucide="upload" class="w-4 h-4"></i> Subir archivo
        </button>` : ''}
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        ${CARPETAS_DOC.map(c => {
          const files = DOCUMENTOS[c.key] || [];
          const col = colors[c.color];
          return `
            <button onclick="abrirCarpeta('${c.key}')" class="card-hover text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm">
              <div class="flex items-start justify-between mb-5">
                <div class="w-11 h-11 rounded-lg ${col.bg} flex items-center justify-center"><i data-lucide="${c.icon}" class="w-5 h-5 ${col.text}"></i></div>
                <i data-lucide="chevron-right" class="w-4 h-4 text-slate-400 mt-2"></i>
              </div>
              <p class="font-semibold text-slate-900 dark:text-slate-100">${c.nombre}</p>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">${files.length} archivos</p>
            </button>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// ===========================================================================
// MODAL & ACTIONS
// ===========================================================================

const MODAL_SIZES = { md:'max-w-2xl', lg:'max-w-4xl', xl:'max-w-5xl', xxl:'max-w-6xl' };

function openModal(html, size = 'md') {
  const m = document.getElementById('modal');
  const panel = document.getElementById('modal-panel');
  const sizeClass = MODAL_SIZES[size] || MODAL_SIZES.md;
  panel.className = `modal-panel w-full ${sizeClass} bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden`;
  panel.querySelector('[data-modal-body]').innerHTML = html;
  m.classList.remove('hidden');
  document.body.classList.add('no-scroll');
  lucide.createIcons();
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  document.body.classList.remove('no-scroll');
}

// ---------- INCIDENCIA: modal con detalle, timeline y chat ----------

function getMensajesIncidencia(id) {
  const base = MENSAJES_INCIDENCIA[id] || [];
  const extra = STATE.mensajesExtra.get(id) || [];
  return [...base, ...extra].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
}

function openIncidencia(id) {
  const i = INCIDENCIAS.find(x => x.id === id);
  if (!i) return;
  const autor = getPropietario(i.autor);
  const estado = estadoEffective(i);
  const acts = i.actualizaciones || [{ fecha:i.fecha, autor:i.autor, accion:'creó la incidencia' }];
  const mensajes = getMensajesIncidencia(id);
  const participantes = new Set(mensajes.filter(m => m.tipo !== 'sistema').map(m => typeof m.autor === 'string' ? m.autor : m.autor));

  const detalleHtml = `
    <div class="flex items-start justify-between gap-4 mb-3">
      <div class="flex items-center gap-2 flex-wrap">
        ${estadoBadge(estado)}
        ${categoriaBadge(i.categoria)}
        ${prioridadBadge(i.prioridad)}
      </div>
      ${isAdminOrJunta() ? `<div class="relative">
        <button onclick="toggleEstadoMenu(event)" class="text-xs font-medium px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1">
          <i data-lucide="git-branch" class="w-3.5 h-3.5"></i> Cambiar estado <i data-lucide="chevron-down" class="w-3 h-3"></i>
        </button>
        <div id="estado-menu" class="hidden absolute right-0 top-full mt-1 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10 overflow-hidden">
          ${ESTADO_ORDER.map(e => `<button onclick="cambiarEstadoIncidencia(${i.id}, '${e}')" class="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 ${e === estado ? 'bg-slate-100 dark:bg-slate-800 font-medium' : ''}">${ESTADOS_INCIDENCIA[e].label}</button>`).join('')}
        </div>
      </div>` : ''}
    </div>

    <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-3 leading-tight">${i.titulo}</h2>

    <div class="space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-5">
      <p class="flex items-center gap-2">${avatar(autor,'xs')} <strong class="text-slate-900 dark:text-slate-100 font-medium">${autor.nombre}</strong></p>
      <p class="flex items-center gap-2"><i data-lucide="map-pin" class="w-3.5 h-3.5 flex-shrink-0"></i>${i.ubicacion||'—'}</p>
      <p class="flex items-center gap-2"><i data-lucide="clock" class="w-3.5 h-3.5 flex-shrink-0"></i>${formatDateTime(i.fecha)}</p>
      <p class="flex items-center gap-2"><i data-lucide="thumbs-up" class="w-3.5 h-3.5 flex-shrink-0"></i>${i.votos} apoyos · <i data-lucide="users" class="w-3.5 h-3.5"></i>${participantes.size} participantes</p>
    </div>

    <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-5">${i.descripcion}</p>

    <button class="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 mb-5">
      <i data-lucide="thumbs-up" class="w-4 h-4"></i> Apoyar (${i.votos})
    </button>

    <h3 class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">Historial de estados</h3>
    <div class="space-y-3">
      ${acts.map(a => {
        const pers = getPropietario(a.autor);
        const estadoLabel = a.estado ? ESTADOS_INCIDENCIA[a.estado]?.label || a.estado : null;
        return `
          <div class="timeline-item flex gap-3">
            ${avatar(pers,'sm')}
            <div class="flex-1 min-w-0 pb-2">
              <p class="text-sm text-slate-900 dark:text-slate-100 leading-snug">
                <strong class="font-medium">${pers.nombre.split(' ').slice(0,2).join(' ')}</strong>
                <span class="text-slate-600 dark:text-slate-400"> ${a.accion}</span>
              </p>
              ${estadoLabel ? `<div class="mt-1">${estadoBadge(a.estado)}</div>` : ''}
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${formatDateTime(a.fecha)}</p>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Chat columna derecha
  const adminMsgsCount = mensajes.filter(m => m.tipo === 'admin').length;

  const chatHtml = `
    <div class="flex flex-col h-full">
      <div class="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 flex-shrink-0">
        <div class="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-500/15 flex items-center justify-center">
          <i data-lucide="messages-square" class="w-4 h-4 text-brand-600 dark:text-brand-400"></i>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-sm text-slate-900 dark:text-slate-100">Conversación</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">${participantes.size} participantes · ${mensajes.filter(m => m.tipo !== 'sistema').length} mensajes${adminMsgsCount > 0 ? ` · ${adminMsgsCount} del admin` : ''}</p>
        </div>
      </div>

      <div id="chat-scroll" class="chat-scroll flex-1 overflow-y-auto px-5 py-4 space-y-3">
        ${mensajes.length === 0 ? `
          <div class="text-center py-10 text-sm text-slate-500 dark:text-slate-400">
            <i data-lucide="message-circle" class="w-8 h-8 mx-auto mb-3 text-slate-300 dark:text-slate-700"></i>
            <p>Aún no hay mensajes en esta incidencia.</p>
            <p class="text-xs mt-1">Sé el primero en comentar.</p>
          </div>
        ` : mensajes.map(m => renderChatMessage(m)).join('')}
      </div>

      <div class="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
        <div class="flex items-end gap-2">
          <div class="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 focus-within:border-brand-400">
            <textarea id="chat-input" rows="1" placeholder="Escribe un mensaje..." class="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none resize-none" onkeydown="chatComposerKey(event, ${i.id})"></textarea>
            <div class="flex items-center justify-between mt-1">
              <div class="flex items-center gap-1">
                <button class="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 rounded-md" aria-label="Adjuntar"><i data-lucide="paperclip" class="w-4 h-4"></i></button>
                <button class="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 rounded-md" aria-label="Emoji"><i data-lucide="smile" class="w-4 h-4"></i></button>
              </div>
              <button onclick="sendChatMessage(${i.id})" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium rounded-md transition-colors">
                <i data-lucide="send" class="w-3.5 h-3.5"></i> Enviar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const html = `
    <div class="flex flex-col lg:flex-row h-[85vh] max-h-[85vh]">
      <div class="lg:w-[42%] flex-shrink-0 overflow-y-auto p-6 lg:border-r border-slate-100 dark:border-slate-800">
        <div class="flex justify-end mb-2 lg:mb-0">
          <button onclick="closeModal()" class="lg:hidden text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" aria-label="Cerrar">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>
        ${detalleHtml}
      </div>
      <div class="flex-1 flex flex-col min-h-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
        <div class="hidden lg:flex justify-end p-3 absolute right-3 top-3 z-10">
          <button onclick="closeModal()" class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-white/80 dark:bg-slate-900/80 rounded-full p-1.5" aria-label="Cerrar">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>
        ${chatHtml}
      </div>
    </div>
  `;
  openModal(html, 'xl');
  // scroll chat al final
  setTimeout(() => {
    const sc = document.getElementById('chat-scroll');
    if (sc) sc.scrollTop = sc.scrollHeight;
  }, 50);
}

function renderChatMessage(m) {
  if (m.tipo === 'sistema') {
    return `<div class="chat-system-event"><i data-lucide="git-branch" class="w-3 h-3"></i><span>${escapeHtml(m.texto)} · ${relativeTime(m.fecha)}</span></div>`;
  }
  const persona = getPropietario(m.autor);
  const isMine = m.autor === 'USUARIO_ACTUAL' && (STATE.rol === 'admin' || STATE.rol === 'junta');
  const isAdminMsg = m.tipo === 'admin';
  const bubbleClass = isMine ? 'chat-bubble-mine ml-auto' : isAdminMsg ? 'chat-bubble-admin' : 'chat-bubble-other';

  const adjuntoHtml = m.adjunto ? `
    <div class="chat-attachment">
      <div class="w-9 h-9 rounded-md ${m.adjunto.tipo === 'image' ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-red-100 dark:bg-red-500/20'} flex items-center justify-center flex-shrink-0">
        <i data-lucide="${m.adjunto.tipo === 'image' ? 'image' : 'file-text'}" class="w-4 h-4 ${m.adjunto.tipo === 'image' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}"></i>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-xs font-medium truncate ${isMine ? 'text-white' : 'text-slate-900 dark:text-slate-100'}">${m.adjunto.nombre}</p>
        <p class="text-[11px] ${isMine ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}">${m.adjunto.tamano}</p>
      </div>
      <button class="${isMine ? 'text-white/80' : 'text-slate-400'} hover:opacity-80"><i data-lucide="download" class="w-3.5 h-3.5"></i></button>
    </div>
  ` : '';

  return `
    <div class="flex items-start gap-2 ${isMine ? 'flex-row-reverse' : ''}">
      ${avatar(persona, 'xs')}
      <div class="flex flex-col gap-0.5 ${isMine ? 'items-end' : 'items-start'} max-w-[78%]">
        <p class="text-[11px] text-slate-500 dark:text-slate-400 px-1">
          <strong class="text-slate-700 dark:text-slate-300 font-medium">${persona.nombre.split(' ').slice(0,2).join(' ')}</strong>${isAdminMsg ? ' <span class="text-brand-600 dark:text-brand-400 font-semibold">· Administrador</span>' : ''} · ${relativeTime(m.fecha)}
        </p>
        <div class="chat-bubble ${bubbleClass}">${escapeHtml(m.texto)}${adjuntoHtml}</div>
        ${m.reacciones ? `<span class="chat-reactions">${escapeHtml(m.reacciones)}</span>` : ''}
      </div>
    </div>
  `;
}

function chatComposerKey(e, incidenciaId) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChatMessage(incidenciaId);
  }
}

function sendChatMessage(incidenciaId) {
  const input = document.getElementById('chat-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  const persona = ROLES[STATE.rol].persona;
  const newMsg = {
    id: Date.now(),
    autor: STATE.rol === 'admin' ? 'USUARIO_ACTUAL' : (PROPIETARIOS.find(p => p.nombre === persona.nombre) || { id:'USUARIO_ACTUAL' }).id,
    fecha: new Date().toISOString(),
    tipo: STATE.rol === 'admin' ? 'admin' : 'usuario',
    texto: text,
  };
  const extras = STATE.mensajesExtra.get(incidenciaId) || [];
  extras.push(newMsg);
  STATE.mensajesExtra.set(incidenciaId, extras);
  input.value = '';
  // Re-render del chat
  const scroll = document.getElementById('chat-scroll');
  if (scroll) {
    scroll.innerHTML = getMensajesIncidencia(incidenciaId).map(renderChatMessage).join('');
    lucide.createIcons();
    scroll.scrollTop = scroll.scrollHeight;
  }
  toast('Mensaje enviado');
}

function toggleEstadoMenu(e) {
  e.stopPropagation();
  const menu = document.getElementById('estado-menu');
  if (menu) menu.classList.toggle('hidden');
}

function cambiarEstadoIncidencia(id, nuevoEstado) {
  STATE.incidenciaEstadoOverride.set(id, nuevoEstado);
  // Inyectar evento de sistema en el chat
  const extras = STATE.mensajesExtra.get(id) || [];
  extras.push({
    id: Date.now(),
    autor: 'SYSTEM',
    fecha: new Date().toISOString(),
    tipo: 'sistema',
    texto: `cambió estado a ${ESTADOS_INCIDENCIA[nuevoEstado].label}`,
  });
  STATE.mensajesExtra.set(id, extras);
  toast(`Estado actualizado: ${ESTADOS_INCIDENCIA[nuevoEstado].label}`);
  // Re-abrir el modal para reflejar el cambio (mantiene estado de chat extra)
  openIncidencia(id);
  renderSidebar();
}

// ---------- VOTACIONES: participantes (admin) ----------

function openParticipantesVotacion(id) {
  const v = VOTACIONES.find(x => x.id === id);
  if (!v) return;
  const participantesSet = new Set(v.participantes);
  const html = `
    <div class="p-6">
      <div class="flex items-start justify-between gap-4 mb-4">
        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Participación detallada</p>
          <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-50">${v.titulo}</h2>
        </div>
        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" aria-label="Cerrar"><i data-lucide="x" class="w-5 h-5"></i></button>
      </div>
      <div class="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg px-4 py-3 mb-5 flex items-start gap-3 text-sm">
        <i data-lucide="lock" class="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"></i>
        <div class="flex-1">
          <p class="font-medium text-slate-900 dark:text-slate-100">Por privacidad, el sentido del voto es anónimo incluso para el administrador.</p>
          <p class="text-slate-600 dark:text-slate-400 text-xs mt-0.5">Solo se muestra si cada unidad ha participado, no qué ha votado.</p>
        </div>
      </div>
      <div class="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg max-h-[55vh] overflow-y-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 dark:bg-slate-800/50 sticky top-0">
            <tr class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              <th class="px-4 py-2.5 text-left font-medium">Unidad</th>
              <th class="px-4 py-2.5 text-left font-medium">Vecino</th>
              <th class="px-4 py-2.5 text-left font-medium">Tipo</th>
              <th class="px-4 py-2.5 text-right font-medium">Participación</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            ${PROPIETARIOS.map(p => {
              const participo = participantesSet.has(p.id);
              return `
                <tr class="${participo ? '' : 'opacity-70'}">
                  <td class="px-4 py-2.5 font-semibold text-xs text-slate-500 dark:text-slate-400 tabular-nums">${unidadCorta(p)}</td>
                  <td class="px-4 py-2.5">
                    <div class="flex items-center gap-2">${avatar(p,'xs')}<span class="text-slate-900 dark:text-slate-100">${p.nombre}</span></div>
                  </td>
                  <td class="px-4 py-2.5 text-xs text-slate-600 dark:text-slate-400">${p.estado === 'vacia' ? '<span class="text-slate-400">Vacía</span>' : (p.tipo === 'propietario' ? 'Propietario' : 'Inquilino')}</td>
                  <td class="px-4 py-2.5 text-right">
                    ${p.estado === 'vacia'
                      ? '<span class="text-xs text-slate-400">N/A</span>'
                      : participo
                        ? '<span class="badge bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"><i data-lucide="check" class="w-3 h-3"></i>Ha votado</span>'
                        : '<span class="badge bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Pendiente</span>'}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-3">${v.participantes.length} de ${v.elegibles} unidades han participado · ${Math.round(v.participantes.length / v.elegibles * 100)}%</p>
    </div>
  `;
  openModal(html, 'lg');
}

// ---------- COMUNICADOS: lectura completa ----------

function openComunicado(id) {
  const n = NOTIFICACIONES.find(x => x.id === id);
  if (!n) return;
  STATE.notifReadIds.add(id);
  const acusadoTs = STATE.notifAcusados.get(id);
  const html = `
    <div class="p-6">
      <div class="flex items-start justify-between gap-4 mb-4">
        <div class="flex items-center gap-2 flex-wrap">
          ${notifTipoBadge(n.tipo)}
          ${n.prioridad === 'urgente' ? '<span class="badge bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300">Urgente</span>' : ''}
          ${n.requiere_acuse ? `<span class="badge ${acusadoTs ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'}"><i data-lucide="file-signature" class="w-3 h-3"></i>${acusadoTs ? 'Acusado' : 'Acuse pendiente'}</span>` : ''}
        </div>
        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" aria-label="Cerrar"><i data-lucide="x" class="w-5 h-5"></i></button>
      </div>
      <h2 class="text-2xl font-semibold text-slate-900 dark:text-slate-50 mb-2 leading-tight">${n.titulo}</h2>
      <div class="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-5">
        <span class="flex items-center gap-1.5">${avatar(USUARIO_ACTUAL,'xs')} Administración Dr. Domagk 2</span>
        <span>·</span>
        <span>${formatDateTime(n.fecha)}</span>
        <span>·</span>
        <span>Para: ${n.destinatarios}</span>
      </div>
      <div class="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed mb-6">${n.contenido}</div>
      ${n.requiere_acuse ? (acusadoTs ? `
        <div class="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-lg px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <i data-lucide="check-circle-2" class="w-4 h-4"></i>
          Acuse de recibo registrado el ${formatDateTime(acusadoTs)}
        </div>
      ` : `
        <div class="border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-between gap-3 flex-wrap">
          <p class="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2"><i data-lucide="file-signature" class="w-4 h-4 text-amber-600 dark:text-amber-400"></i>Este comunicado requiere acuse de recibo.</p>
          <button onclick="acuseRecibo(${n.id}); closeModal();" class="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-medium text-sm">
            <i data-lucide="check" class="w-4 h-4"></i> Acusar recibo
          </button>
        </div>
      `) : ''}
    </div>
  `;
  openModal(html, 'lg');
  updateNotifBadge();
  renderSidebar();
}

function acuseRecibo(id) {
  STATE.notifAcusados.set(id, new Date().toISOString());
  STATE.notifReadIds.add(id);
  toast('Acuse de recibo registrado');
  renderCurrentView();
  updateNotifBadge();
}

// ---------- PERFIL VECINO ----------

function openPerfilVecino(id) {
  const p = PROPIETARIOS.find(x => x.id === id);
  if (!p) return;
  if (p.estado === 'vacia') {
    return openModal(`
      <div class="p-6 text-center">
        <div class="flex justify-end mb-2"><button onclick="closeModal()" class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"><i data-lucide="x" class="w-5 h-5"></i></button></div>
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><i data-lucide="home" class="w-7 h-7 text-slate-400"></i></div>
        <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-1">Unidad ${unidadCorta(p)} · Vacía</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">No hay vecino asignado actualmente a esta vivienda.</p>
      </div>
    `, 'md');
  }
  const incs = INCIDENCIAS.filter(i => i.autor === p.id).slice(0, 3);
  openModal(`
    <div class="p-6">
      <div class="flex items-start justify-between gap-4 mb-5">
        <div class="flex items-center gap-3">
          ${avatar(p, 'lg')}
          <div>
            <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-50">${p.nombre}</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">Unidad ${unidadCorta(p)} · ${p.tipo === 'propietario' ? 'Propietario' : 'Inquilino'} · Desde ${p.desde}</p>
          </div>
        </div>
        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"><i data-lucide="x" class="w-5 h-5"></i></button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="space-y-2 text-sm">
          <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-medium">Contacto</p>
          <p class="flex items-center gap-2 text-slate-700 dark:text-slate-300"><i data-lucide="mail" class="w-4 h-4 text-slate-400"></i>${p.email || '—'}</p>
          <p class="flex items-center gap-2 text-slate-700 dark:text-slate-300"><i data-lucide="phone" class="w-4 h-4 text-slate-400"></i>${p.telefono || '—'}</p>
        </div>
        <div class="space-y-2 text-sm">
          <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-medium">Cuota y pagos</p>
          <p class="flex items-center gap-2 text-slate-700 dark:text-slate-300"><i data-lucide="banknote" class="w-4 h-4 text-slate-400"></i>${formatCurrency(p.cuota)} / mes</p>
          <p class="flex items-center gap-2 text-slate-700 dark:text-slate-300"><i data-lucide="calendar-check" class="w-4 h-4 text-slate-400"></i>Último pago: ${p.ultimo_pago ? formatDateLong(p.ultimo_pago) : '—'}</p>
          ${p.moroso ? '<p class="badge bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 mt-1"><i data-lucide="alert-triangle" class="w-3 h-3"></i>Cuota pendiente</p>' : ''}
        </div>
      </div>
      ${(p.tags || []).length > 0 ? `
        <div class="mb-6">
          <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-medium mb-2">Etiquetas</p>
          <div class="flex flex-wrap gap-1.5">
            ${p.tags.map(t => `<span class="badge bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">${t}</span>`).join('')}
          </div>
        </div>
      ` : ''}
      <div>
        <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-medium mb-2">Incidencias abiertas por este vecino</p>
        ${incs.length === 0 ? '<p class="text-sm text-slate-500 dark:text-slate-400 italic">No ha abierto incidencias recientes.</p>' : incs.map(i => `
          <button onclick="closeModal(); openIncidencia(${i.id});" class="card-hover w-full text-left bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg p-3 mb-2 flex items-start gap-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-0.5">${estadoBadge(estadoEffective(i))}</div>
              <p class="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">${i.titulo}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">${relativeTime(i.fecha)}</p>
            </div>
            <i data-lucide="chevron-right" class="w-4 h-4 text-slate-400 mt-1"></i>
          </button>
        `).join('')}
      </div>
    </div>
  `, 'lg');
}

// ---------- WIZARD: CARGA INICIAL DE VECINOS (4 pasos) ----------

function abrirWizardVecinos() {
  STATE.wizardVecinos = { step: 1, archivo: null, procesando: false, asignaciones: {} };
  renderWizardVecinos();
}

function renderWizardVecinos() {
  const w = STATE.wizardVecinos;
  if (!w) return;
  const stepLabels = ['Subir Excel', 'Validación', 'Invitaciones', 'Resumen'];

  const stepper = `
    <div class="flex items-center gap-3 mb-6 px-1">
      ${stepLabels.map((label, idx) => {
        const n = idx + 1;
        const cls = w.step === n ? 'active' : w.step > n ? 'done' : '';
        return `
          <div class="wizard-step ${cls}">
            <span class="wizard-step-circle">${w.step > n ? '<i data-lucide="check" class="w-3.5 h-3.5"></i>' : n}</span>
            <span class="text-xs font-medium ${w.step >= n ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'} hidden md:inline">${label}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;

  let body = '';
  if (w.step === 1) {
    body = w.procesando ? `
      <div class="wizard-dropzone">
        <div class="w-14 h-14 mx-auto mb-3 rounded-full bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center"><i data-lucide="loader" class="w-6 h-6 text-brand-600 dark:text-brand-400 animate-spin"></i></div>
        <p class="font-medium text-slate-900 dark:text-slate-100">Procesando archivo…</p>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">vecinos_dr_domagk_2.xlsx</p>
        <div class="mt-4 max-w-xs mx-auto h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div class="shimmer-bg h-full"></div>
        </div>
      </div>
    ` : w.archivo ? `
      <div class="wizard-dropzone" style="border-style:solid; border-color:rgb(16 185 129);">
        <div class="w-14 h-14 mx-auto mb-3 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center"><i data-lucide="file-check" class="w-6 h-6 text-emerald-600 dark:text-emerald-400"></i></div>
        <p class="font-medium text-slate-900 dark:text-slate-100">Archivo procesado correctamente</p>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">vecinos_dr_domagk_2.xlsx · ${VECINOS_IMPORT_PREVIEW.length} filas detectadas</p>
      </div>
    ` : `
      <div class="wizard-dropzone" onclick="procesarArchivoVecinos()">
        <div class="w-14 h-14 mx-auto mb-3 rounded-full bg-brand-50 dark:bg-brand-500/20 flex items-center justify-center"><i data-lucide="upload-cloud" class="w-6 h-6 text-brand-600 dark:text-brand-400"></i></div>
        <p class="font-medium text-slate-900 dark:text-slate-100 mb-1">Arrastra tu Excel aquí o haz clic para seleccionar</p>
        <p class="text-sm text-slate-500 dark:text-slate-400">Columnas esperadas: Planta, Puerta, Nombre, Apellidos, Email, Teléfono, Tipo, Cuota</p>
        <button class="mt-4 text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"><i data-lucide="download" class="w-3 h-3"></i>Descargar plantilla</button>
      </div>
    `;
  } else if (w.step === 2) {
    const correctas = VECINOS_IMPORT_PREVIEW.filter(v => v.validacion === 'correcta').length;
    const revisar = VECINOS_IMPORT_PREVIEW.filter(v => v.validacion === 'revisar').length;
    const bloqueadas = VECINOS_IMPORT_PREVIEW.filter(v => v.validacion === 'bloqueada').length;
    body = `
      <div class="grid grid-cols-3 gap-3 mb-4">
        <div class="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-lg px-3 py-2 text-center"><p class="text-2xl font-semibold text-emerald-700 dark:text-emerald-300 tabular-nums">${correctas}</p><p class="text-xs text-emerald-700 dark:text-emerald-300">Correctas</p></div>
        <div class="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg px-3 py-2 text-center"><p class="text-2xl font-semibold text-amber-700 dark:text-amber-300 tabular-nums">${revisar}</p><p class="text-xs text-amber-700 dark:text-amber-300">Revisar</p></div>
        <div class="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg px-3 py-2 text-center"><p class="text-2xl font-semibold text-red-700 dark:text-red-300 tabular-nums">${bloqueadas}</p><p class="text-xs text-red-700 dark:text-red-300">Bloqueadas</p></div>
      </div>
      <div class="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden max-h-[420px] overflow-y-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10">
            <tr class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              <th class="px-3 py-2 text-left font-medium">Unidad</th>
              <th class="px-3 py-2 text-left font-medium">Nombre</th>
              <th class="px-3 py-2 text-left font-medium hidden md:table-cell">Email</th>
              <th class="px-3 py-2 text-left font-medium">Validación</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            ${VECINOS_IMPORT_PREVIEW.map(v => {
              const planta = v.planta === 0 ? '0' : v.planta;
              return `
                <tr class="${v.validacion === 'bloqueada' ? 'bg-red-50/50 dark:bg-red-500/5' : v.validacion === 'revisar' ? 'bg-amber-50/40 dark:bg-amber-500/5' : ''}">
                  <td class="px-3 py-2 font-semibold text-xs tabular-nums text-slate-700 dark:text-slate-300">${planta}º${v.puerta}</td>
                  <td class="px-3 py-2 text-sm text-slate-900 dark:text-slate-100">${v.nombre}</td>
                  <td class="px-3 py-2 text-xs text-slate-600 dark:text-slate-400 hidden md:table-cell">${v.email || '<span class="text-slate-400">—</span>'}</td>
                  <td class="px-3 py-2">
                    ${v.validacion === 'correcta'
                      ? '<span class="badge bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"><i data-lucide="check-circle-2" class="w-3 h-3"></i>Correcta</span>'
                      : v.validacion === 'revisar'
                        ? `<span class="badge bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300" title="${escapeHtml(v.motivo||'')}"><i data-lucide="alert-triangle" class="w-3 h-3"></i>Revisar</span>`
                        : `<span class="badge bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300" title="${escapeHtml(v.motivo||'')}"><i data-lucide="x-circle" class="w-3 h-3"></i>Bloqueada</span>`}
                    ${v.motivo ? `<p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 italic">${v.motivo}</p>` : ''}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else if (w.step === 3) {
    const importables = VECINOS_IMPORT_PREVIEW.filter(v => v.validacion !== 'bloqueada' && v.nombre !== '— Vacía');
    body = `
      <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">Por defecto se enviará una invitación por email a cada vecino para activar su cuenta en el Portal Vecinal Dr. Domagk 2.</p>
      <div class="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden max-h-[420px] overflow-y-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10">
            <tr class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              <th class="px-3 py-2 text-left font-medium w-10"><input type="checkbox" checked disabled class="rounded"/></th>
              <th class="px-3 py-2 text-left font-medium">Vecino</th>
              <th class="px-3 py-2 text-left font-medium hidden md:table-cell">Email</th>
              <th class="px-3 py-2 text-left font-medium">Acción</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            ${importables.slice(0,12).map(v => `
              <tr>
                <td class="px-3 py-2"><input type="checkbox" checked class="rounded"/></td>
                <td class="px-3 py-2 text-sm text-slate-900 dark:text-slate-100">${v.nombre} <span class="text-xs text-slate-500 dark:text-slate-400">· ${v.planta === 0 ? '0' : v.planta}º${v.puerta}</span></td>
                <td class="px-3 py-2 text-xs text-slate-600 dark:text-slate-400 hidden md:table-cell">${v.email || '—'}</td>
                <td class="px-3 py-2">
                  <select class="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1">
                    <option selected>Crear + enviar invitación</option>
                    <option>Crear sin invitar</option>
                    <option>Saltar</option>
                  </select>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ${importables.length > 12 ? `<p class="text-xs text-center text-slate-500 dark:text-slate-400 py-2 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">+ ${importables.length - 12} vecinos más</p>` : ''}
      </div>
    `;
  } else {
    // Paso 4 — resumen
    const correctas = VECINOS_IMPORT_PREVIEW.filter(v => v.validacion === 'correcta').length;
    const revisar = VECINOS_IMPORT_PREVIEW.filter(v => v.validacion === 'revisar').length;
    const bloqueadas = VECINOS_IMPORT_PREVIEW.filter(v => v.validacion === 'bloqueada').length;
    const importadas = correctas + revisar;
    body = `
      <div class="text-center py-6">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center"><i data-lucide="party-popper" class="w-7 h-7 text-emerald-600 dark:text-emerald-400"></i></div>
        <h3 class="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-1">Carga inicial completada</h3>
        <p class="text-sm text-slate-600 dark:text-slate-400">La Comunidad ${FINCA.nombre_corto} ya está activa en el portal.</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div class="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-lg p-4">
          <p class="text-3xl font-semibold text-emerald-700 dark:text-emerald-300 tabular-nums">${importadas}</p>
          <p class="text-sm text-emerald-700 dark:text-emerald-300 mt-1">Vecinos importados</p>
        </div>
        <div class="bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/30 rounded-lg p-4">
          <p class="text-3xl font-semibold text-brand-700 dark:text-brand-300 tabular-nums">${importadas - 2}</p>
          <p class="text-sm text-brand-700 dark:text-brand-300 mt-1">Invitaciones enviadas por email</p>
        </div>
        <div class="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg p-4">
          <p class="text-3xl font-semibold text-amber-700 dark:text-amber-300 tabular-nums">${bloqueadas}</p>
          <p class="text-sm text-amber-700 dark:text-amber-300 mt-1">Filas descartadas</p>
        </div>
      </div>
      <details class="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm">
        <summary class="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2"><i data-lucide="chevron-down" class="w-4 h-4 transition-transform"></i>Ver detalles de la importación</summary>
        <ul class="mt-3 space-y-1 text-slate-700 dark:text-slate-300 text-xs">
          <li class="flex items-center gap-2"><i data-lucide="check" class="w-3 h-3 text-emerald-500"></i>${correctas} vecinos creados con datos correctos</li>
          <li class="flex items-center gap-2"><i data-lucide="alert-triangle" class="w-3 h-3 text-amber-500"></i>${revisar} creados con avisos (revisión recomendada)</li>
          <li class="flex items-center gap-2"><i data-lucide="x" class="w-3 h-3 text-red-500"></i>${bloqueadas} fila descartada (planta inexistente)</li>
        </ul>
      </details>
    `;
  }

  const footer = `
    <div class="flex items-center justify-between pt-5 mt-5 border-t border-slate-100 dark:border-slate-800">
      ${w.step > 1 && w.step < 4 ? `<button onclick="wizardVecinosBack()" class="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 inline-flex items-center gap-1"><i data-lucide="arrow-left" class="w-4 h-4"></i>Atrás</button>` : '<div></div>'}
      ${w.step === 1 && !w.archivo ? '<button class="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-500 rounded-lg text-sm font-medium" disabled>Continuar</button>' : ''}
      ${w.step === 1 && w.archivo ? `<button onclick="wizardVecinosNext()" class="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-medium inline-flex items-center gap-1.5">Continuar <i data-lucide="arrow-right" class="w-4 h-4"></i></button>` : ''}
      ${w.step === 2 ? `<button onclick="wizardVecinosNext()" class="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-medium inline-flex items-center gap-1.5">Continuar con ${VECINOS_IMPORT_PREVIEW.filter(v => v.validacion !== 'bloqueada').length} vecinos <i data-lucide="arrow-right" class="w-4 h-4"></i></button>` : ''}
      ${w.step === 3 ? `<button onclick="wizardVecinosNext()" class="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-medium inline-flex items-center gap-1.5">Importar y enviar <i data-lucide="check" class="w-4 h-4"></i></button>` : ''}
      ${w.step === 4 ? `<button onclick="cerrarWizardVecinos()" class="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-medium">Ir al directorio</button>` : ''}
    </div>
  `;

  const html = `
    <div class="p-6">
      <div class="flex items-start justify-between gap-4 mb-5">
        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-brand-600 dark:text-brand-400 mb-1">Carga inicial · Comunidad ${FINCA.nombre_corto}</p>
          <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-50">Importar vecinos y unidades</h2>
        </div>
        <button onclick="cerrarWizardVecinos()" class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"><i data-lucide="x" class="w-5 h-5"></i></button>
      </div>
      ${stepper}
      ${body}
      ${footer}
    </div>
  `;
  openModal(html, 'lg');
}

function procesarArchivoVecinos() {
  STATE.wizardVecinos.procesando = true;
  renderWizardVecinos();
  setTimeout(() => {
    STATE.wizardVecinos.procesando = false;
    STATE.wizardVecinos.archivo = 'vecinos_dr_domagk_2.xlsx';
    renderWizardVecinos();
  }, 1400);
}

function wizardVecinosNext() {
  STATE.wizardVecinos.step = Math.min(4, STATE.wizardVecinos.step + 1);
  renderWizardVecinos();
}
function wizardVecinosBack() {
  STATE.wizardVecinos.step = Math.max(1, STATE.wizardVecinos.step - 1);
  renderWizardVecinos();
}
function cerrarWizardVecinos() {
  const completed = STATE.wizardVecinos && STATE.wizardVecinos.step === 4;
  STATE.wizardVecinos = null;
  STATE.onboardingDismissed = true;
  closeModal();
  if (completed && STATE.currentView !== 'directorio' && isAdminOrJunta()) {
    navigateTo('directorio');
  } else {
    renderCurrentView();
  }
}

// ---------- WIZARD: IMPORT EXCEL GASTOS (3 pasos) ----------

function abrirWizardGastos() {
  STATE.wizardGastos = { step: 1, archivo: null, procesando: false };
  renderWizardGastos();
}

function renderWizardGastos() {
  const w = STATE.wizardGastos;
  if (!w) return;
  const stepLabels = ['Subir Excel', 'Revisar', 'Aplicar'];

  const stepper = `
    <div class="flex items-center gap-3 mb-6 px-1">
      ${stepLabels.map((label, idx) => {
        const n = idx + 1;
        const cls = w.step === n ? 'active' : w.step > n ? 'done' : '';
        return `
          <div class="wizard-step ${cls}">
            <span class="wizard-step-circle">${w.step > n ? '<i data-lucide="check" class="w-3.5 h-3.5"></i>' : n}</span>
            <span class="text-xs font-medium ${w.step >= n ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'} hidden md:inline">${label}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;

  let body = '';
  if (w.step === 1) {
    body = w.procesando ? `
      <div class="wizard-dropzone">
        <div class="w-14 h-14 mx-auto mb-3 rounded-full bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center"><i data-lucide="loader" class="w-6 h-6 text-brand-600 dark:text-brand-400 animate-spin"></i></div>
        <p class="font-medium text-slate-900 dark:text-slate-100">Analizando movimientos…</p>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">extracto_bancario_mayo_2026.xlsx · Categorización automática con IA</p>
        <div class="mt-4 max-w-xs mx-auto h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div class="shimmer-bg h-full"></div>
        </div>
      </div>
    ` : w.archivo ? `
      <div class="wizard-dropzone" style="border-style:solid; border-color:rgb(16 185 129);">
        <div class="w-14 h-14 mx-auto mb-3 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center"><i data-lucide="file-check" class="w-6 h-6 text-emerald-600 dark:text-emerald-400"></i></div>
        <p class="font-medium text-slate-900 dark:text-slate-100">${GASTOS_IMPORT_PREVIEW.length} movimientos detectados</p>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">extracto_bancario_mayo_2026.xlsx</p>
      </div>
    ` : `
      <div class="wizard-dropzone" onclick="procesarArchivoGastos()">
        <div class="w-14 h-14 mx-auto mb-3 rounded-full bg-brand-50 dark:bg-brand-500/20 flex items-center justify-center"><i data-lucide="upload-cloud" class="w-6 h-6 text-brand-600 dark:text-brand-400"></i></div>
        <p class="font-medium text-slate-900 dark:text-slate-100 mb-1">Sube el extracto bancario o Excel de gastos</p>
        <p class="text-sm text-slate-500 dark:text-slate-400">La plataforma categoriza automáticamente cada movimiento usando IA. Puedes revisar y editar antes de aplicar.</p>
        <button class="mt-4 text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"><i data-lucide="download" class="w-3 h-3"></i>Descargar plantilla</button>
      </div>
    `;
  } else if (w.step === 2) {
    const automaticos = GASTOS_IMPORT_PREVIEW.filter(g => !g.revisar).length;
    const revisar = GASTOS_IMPORT_PREVIEW.filter(g => g.revisar).length;
    body = `
      <div class="bg-brand-50/60 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/30 rounded-lg px-4 py-3 mb-4 text-sm flex items-start gap-3">
        <i data-lucide="sparkles" class="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5"></i>
        <p class="text-slate-700 dark:text-slate-300">
          <strong>${automaticos} movimientos</strong> procesados automáticamente con IA · <strong class="text-amber-700 dark:text-amber-300">${revisar} requieren revisión manual</strong>
        </p>
      </div>
      <div class="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden max-h-[420px] overflow-y-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10">
            <tr class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              <th class="px-3 py-2 text-left font-medium">Fecha</th>
              <th class="px-3 py-2 text-left font-medium">Concepto</th>
              <th class="px-3 py-2 text-left font-medium">Categoría</th>
              <th class="px-3 py-2 text-right font-medium">Importe</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            ${GASTOS_IMPORT_PREVIEW.map(g => `
              <tr class="${g.revisar ? 'bg-amber-50/40 dark:bg-amber-500/5' : ''}">
                <td class="px-3 py-2 text-xs text-slate-600 dark:text-slate-400 tabular-nums whitespace-nowrap">${formatDateShort(g.fecha)}</td>
                <td class="px-3 py-2 text-sm text-slate-900 dark:text-slate-100">${g.concepto}</td>
                <td class="px-3 py-2">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="badge bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">${g.categoria}</span>
                    ${g.revisar
                      ? '<span class="badge bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300"><i data-lucide="alert-triangle" class="w-3 h-3"></i>Revisar</span>'
                      : '<span class="badge bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"><i data-lucide="sparkles" class="w-3 h-3"></i>IA</span>'}
                  </div>
                </td>
                <td class="px-3 py-2 text-right tabular-nums font-medium ${g.importe < 0 ? 'text-slate-900 dark:text-slate-100' : 'text-emerald-600 dark:text-emerald-400'}">${g.importe < 0 ? '−' : '+'}${formatCurrency(Math.abs(g.importe))}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else {
    // Paso 3 — Resumen
    // Agregar por categoría
    const totales = {};
    GASTOS_IMPORT_PREVIEW.forEach(g => {
      if (g.categoria === 'Ingreso') return;
      totales[g.categoria] = (totales[g.categoria] || 0) + Math.abs(g.importe);
    });
    const ingresos = GASTOS_IMPORT_PREVIEW.filter(g => g.categoria === 'Ingreso').reduce((s, g) => s + g.importe, 0);
    body = `
      <div class="text-center py-4">
        <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center"><i data-lucide="check-circle-2" class="w-6 h-6 text-emerald-600 dark:text-emerald-400"></i></div>
        <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-1">Presupuesto actualizado correctamente</h3>
        <p class="text-sm text-slate-600 dark:text-slate-400">Se han incorporado ${GASTOS_IMPORT_PREVIEW.length} movimientos al ejercicio 2026.</p>
      </div>
      <div class="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg p-4 mb-3">
        <p class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">Reparto por categoría</p>
        <ul class="space-y-2">
          ${Object.entries(totales).map(([cat, importe]) => `
            <li class="flex items-center justify-between text-sm">
              <span class="text-slate-700 dark:text-slate-300">${cat}</span>
              <span class="font-medium text-slate-900 dark:text-slate-100 tabular-nums">+ ${formatCurrency(importe)}</span>
            </li>
          `).join('')}
          <li class="flex items-center justify-between text-sm pt-2 border-t border-slate-200 dark:border-slate-700">
            <span class="text-emerald-700 dark:text-emerald-300 font-medium">Ingresos del periodo</span>
            <span class="font-semibold text-emerald-700 dark:text-emerald-300 tabular-nums">+ ${formatCurrency(ingresos)}</span>
          </li>
        </ul>
      </div>
    `;
  }

  const footer = `
    <div class="flex items-center justify-between pt-5 mt-5 border-t border-slate-100 dark:border-slate-800">
      ${w.step > 1 && w.step < 3 ? `<button onclick="wizardGastosBack()" class="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 inline-flex items-center gap-1"><i data-lucide="arrow-left" class="w-4 h-4"></i>Atrás</button>` : '<div></div>'}
      ${w.step === 1 && !w.archivo ? '<button class="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-500 rounded-lg text-sm font-medium" disabled>Continuar</button>' : ''}
      ${w.step === 1 && w.archivo ? `<button onclick="wizardGastosNext()" class="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-medium inline-flex items-center gap-1.5">Continuar <i data-lucide="arrow-right" class="w-4 h-4"></i></button>` : ''}
      ${w.step === 2 ? `<button onclick="wizardGastosNext()" class="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-medium inline-flex items-center gap-1.5">Aplicar al presupuesto <i data-lucide="check" class="w-4 h-4"></i></button>` : ''}
      ${w.step === 3 ? `<button onclick="cerrarWizardGastos()" class="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-medium">Ver presupuesto actualizado</button>` : ''}
    </div>
  `;

  openModal(`
    <div class="p-6">
      <div class="flex items-start justify-between gap-4 mb-5">
        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-brand-600 dark:text-brand-400 mb-1">Presupuesto · Comunidad ${FINCA.nombre_corto}</p>
          <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-50">Importar Excel de gastos</h2>
        </div>
        <button onclick="cerrarWizardGastos()" class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"><i data-lucide="x" class="w-5 h-5"></i></button>
      </div>
      ${stepper}
      ${body}
      ${footer}
    </div>
  `, 'lg');
}

function procesarArchivoGastos() {
  STATE.wizardGastos.procesando = true;
  renderWizardGastos();
  setTimeout(() => {
    STATE.wizardGastos.procesando = false;
    STATE.wizardGastos.archivo = 'extracto_bancario_mayo_2026.xlsx';
    renderWizardGastos();
  }, 1400);
}

function wizardGastosNext() { STATE.wizardGastos.step = Math.min(3, STATE.wizardGastos.step + 1); renderWizardGastos(); }
function wizardGastosBack() { STATE.wizardGastos.step = Math.max(1, STATE.wizardGastos.step - 1); renderWizardGastos(); }
function cerrarWizardGastos() {
  STATE.wizardGastos = null;
  closeModal();
  toast('Movimientos importados al presupuesto');
  if (STATE.currentView !== 'presupuesto') navigateTo('presupuesto');
  else renderCurrentView();
}

// ---------- FILTERS / ACTIONS ----------

function filterIncidencias(estado) { STATE.incidenciasFilter.estado = estado; renderCurrentView(); }
function filterCategoria(cat)      { STATE.incidenciasFilter.categoria = cat; renderCurrentView(); }
function filterPrioridad(p)        { STATE.incidenciasFilter.prioridad = p; renderCurrentView(); }
function filterNotif(tipo)         { STATE.notifFilter = tipo; renderCurrentView(); }
function filterVotaciones(key)     { STATE.votFilter = key; renderCurrentView(); }
function setDirectorioVista(v)     { STATE.directorioVista = v; renderCurrentView(); }
function setDirectorioFiltro(f)    { STATE.directorioFiltro = f; renderCurrentView(); }

function buscarDirectorio(v) {
  STATE.directorioBusqueda = v;
  // Re-render solo el contenido sin perder focus del input
  const old = document.activeElement && document.activeElement.id === 'dir-busqueda' ? document.activeElement.selectionStart : null;
  renderCurrentView();
  if (old !== null) {
    const el = document.getElementById('dir-busqueda');
    if (el) { el.focus(); el.setSelectionRange(old, old); }
  }
}

function marcarLeida(id)   { STATE.notifReadIds.add(id); renderCurrentView(); updateNotifBadge(); }
function marcarTodasLeidas() {
  NOTIFICACIONES.forEach(n => STATE.notifReadIds.add(n.id));
  renderCurrentView(); updateNotifBadge();
  toast('Todos los comunicados marcados como leídos');
}

function emitirVoto(votId, tipo) {
  const v = VOTACIONES.find(x => x.id === votId);
  if (!v || v.estado !== 'activa') return;
  v[tipo] += 1;
  // Marca al rol actual como participante si aplica
  const persona = ROLES[STATE.rol].persona;
  const propietario = PROPIETARIOS.find(p => p.nombre === persona.nombre);
  if (propietario && !v.participantes.includes(propietario.id)) v.participantes.push(propietario.id);
  toast(`Voto registrado: ${tipo === 'favor' ? 'A favor' : tipo === 'contra' ? 'En contra' : 'Abstención'}`);
  renderCurrentView();
}

function abrirCarpeta(key) { STATE.docsFolder = key; renderCurrentView(); }

function dismissOnboarding() {
  STATE.onboardingDismissed = true;
  renderCurrentView();
}

function toast(msg) {
  const t = document.createElement('div');
  t.className = 'fixed bottom-6 right-6 z-[60] bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2';
  t.innerHTML = `<i data-lucide="check-circle-2" class="w-4 h-4"></i><span>${escapeHtml(msg)}</span>`;
  t.style.animation = 'fadeInUp 220ms ease-out';
  document.body.appendChild(t);
  lucide.createIcons();
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transition = 'opacity 200ms';
    setTimeout(() => t.remove(), 200);
  }, 2400);
}

// ===========================================================================
// NAVIGATION & APP SHELL
// ===========================================================================

const VIEWS = {
  dashboard:      { label:'Dashboard',                  shortLabel:'Dashboard',     icon:'layout-dashboard', render:renderDashboard },
  incidencias:    { label:'Incidencias',                shortLabel:'Incidencias',   icon:'alert-circle',     render:renderIncidencias },
  votaciones:     { label:'Votaciones',                 shortLabel:'Votaciones',    icon:'vote',             render:renderVotaciones },
  notificaciones: { label:'Notificaciones y Comunicados', shortLabel:'Comunicados', icon:'megaphone',        render:renderNotificaciones },
  directorio:     { label:'Directorio',                 shortLabel:'Directorio',    icon:'users',            render:renderDirectorio,    adminOnly:true },
  presupuesto:    { label:'Presupuesto',                shortLabel:'Presupuesto',   icon:'piggy-bank',       render:renderPresupuesto },
  documentos:     { label:'Documentos',                 shortLabel:'Documentos',    icon:'folder-open',      render:renderDocumentos },
};

function renderCurrentView() {
  const main = document.getElementById('view-container');
  if (!main) return;
  const view = VIEWS[STATE.currentView];
  main.innerHTML = view.render();
  main.classList.remove('view-active');
  void main.offsetWidth;
  main.classList.add('view-active');
  lucide.createIcons();
  main.scrollTop = 0;
  const tt = document.getElementById('topbar-title');
  if (tt) tt.textContent = view.shortLabel;
}

function navigateTo(view) {
  if (!VIEWS[view]) return;
  if (!canSeeView(view)) {
    toast('Vista no disponible para tu rol actual');
    return;
  }
  STATE.currentView = view;
  if (view !== 'documentos') STATE.docsFolder = null;
  renderSidebar();
  renderCurrentView();
  if (STATE.sidebarOpen) toggleSidebar();
}

function renderSidebar() {
  const nav = document.getElementById('sidebar-nav');
  if (!nav) return;
  const visibleViews = Object.entries(VIEWS).filter(([key]) => canSeeView(key));
  nav.innerHTML = visibleViews.map(([key, v]) => {
    const active = key === STATE.currentView;
    let badge = '';
    if (key === 'incidencias') {
      const n = INCIDENCIAS.filter(i => estadoEffective(i) !== 'cerrada').length;
      badge = `<span class="ml-auto text-[10px] font-semibold bg-brand-500/20 text-brand-300 px-1.5 py-0.5 rounded">${n}</span>`;
    } else if (key === 'notificaciones') {
      const n = NOTIFICACIONES.filter(x => !STATE.notifReadIds.has(x.id)).length;
      if (n > 0) badge = `<span class="ml-auto text-[10px] font-semibold bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded">${n}</span>`;
    } else if (key === 'votaciones') {
      const n = VOTACIONES.filter(v => v.estado === 'activa').length;
      badge = `<span class="ml-auto text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">${n}</span>`;
    }
    return `
      <button onclick="navigateTo('${key}')" aria-current="${active ? 'page' : 'false'}" class="${active ? 'sidebar-item-active text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'} w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors">
        <i data-lucide="${v.icon}" class="w-4 h-4 flex-shrink-0"></i>
        <span>${v.label}</span>
        ${badge}
      </button>
    `;
  }).join('');
  lucide.createIcons();
}

function updateNotifBadge() {
  const n = NOTIFICACIONES.filter(x => !STATE.notifReadIds.has(x.id)).length;
  const badge = document.getElementById('notif-badge');
  if (!badge) return;
  if (n > 0) {
    badge.textContent = n;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
  renderSidebar();
}

function toggleSidebar() {
  STATE.sidebarOpen = !STATE.sidebarOpen;
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (STATE.sidebarOpen) {
    sidebar.classList.remove('-translate-x-full');
    overlay.classList.remove('hidden');
    sidebar.classList.add('sidebar-mobile');
  } else {
    sidebar.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
    sidebar.classList.remove('sidebar-mobile');
  }
}

function toggleDarkMode() {
  STATE.darkMode = !STATE.darkMode;
  document.documentElement.classList.toggle('dark', STATE.darkMode);
  try { localStorage.setItem('gf-dark', STATE.darkMode ? '1' : '0'); } catch (e) {}
  document.getElementById('dark-icon-sun').classList.toggle('hidden', !STATE.darkMode);
  document.getElementById('dark-icon-moon').classList.toggle('hidden', STATE.darkMode);
}

// ---------- ROLE SELECTOR ----------

function renderRolSelector() {
  const r = ROLES[STATE.rol];
  // Chip activo
  const dot = document.getElementById('rol-dot');
  const label = document.getElementById('rol-label');
  const btn = document.getElementById('rol-selector-btn');
  if (dot)   dot.className = `w-2 h-2 rounded-full ${r.dot}`;
  if (label) label.textContent = r.label;
  if (btn)   btn.setAttribute('aria-expanded', STATE.rolDropdownOpen ? 'true' : 'false');

  // Sidebar user role line
  const sub = document.getElementById('sidebar-user-role');
  if (sub) sub.textContent = `${r.label} · Dr. Domagk 2`;

  // Dropdown options
  const opts = document.getElementById('rol-options');
  if (!opts) return;
  opts.innerHTML = Object.entries(ROLES).map(([key, ro]) => {
    const active = key === STATE.rol;
    return `
      <button onclick="setRol('${key}')" class="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 ${active ? 'bg-slate-50 dark:bg-slate-800/60' : ''}">
        <span class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style="background-color:${ro.color}22; color:${ro.color}">
          <i data-lucide="${ro.icon}" class="w-4 h-4"></i>
        </span>
        <span class="flex-1 min-w-0">
          <span class="block text-sm font-medium text-slate-900 dark:text-slate-100">${ro.label}</span>
          <span class="block text-xs text-slate-500 dark:text-slate-400 truncate">${ro.sub} · ${ro.desc}</span>
        </span>
        ${active ? '<i data-lucide="check" class="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0"></i>' : ''}
      </button>
    `;
  }).join('');
  lucide.createIcons();
}

function toggleRolDropdown(force) {
  const dd = document.getElementById('rol-dropdown');
  if (!dd) return;
  if (typeof force === 'boolean') {
    STATE.rolDropdownOpen = force;
  } else {
    STATE.rolDropdownOpen = !STATE.rolDropdownOpen;
  }
  dd.classList.toggle('hidden', !STATE.rolDropdownOpen);
  const btn = document.getElementById('rol-selector-btn');
  if (btn) btn.setAttribute('aria-expanded', STATE.rolDropdownOpen ? 'true' : 'false');
}

function setRol(key) {
  if (!ROLES[key]) return;
  STATE.rol = key;
  STATE.rolDropdownOpen = false;
  document.getElementById('rol-dropdown').classList.add('hidden');
  // Si la vista actual ya no está permitida, ir al dashboard
  if (!canSeeView(STATE.currentView)) STATE.currentView = 'dashboard';
  renderRolSelector();
  renderSidebar();
  renderCurrentView();
  toast(`Vista cambiada a ${ROLES[key].label}`);
}

// ===========================================================================
// INIT
// ===========================================================================

function init() {
  try {
    const saved = localStorage.getItem('gf-dark');
    if (saved === '1') {
      STATE.darkMode = true;
      document.documentElement.classList.add('dark');
      document.getElementById('dark-icon-sun').classList.remove('hidden');
      document.getElementById('dark-icon-moon').classList.add('hidden');
    }
  } catch (e) {}

  renderRolSelector();
  renderSidebar();
  renderCurrentView();
  updateNotifBadge();

  // Modal close on backdrop click
  document.getElementById('modal').addEventListener('click', e => {
    if (e.target.id === 'modal' || e.target.dataset.modalClose !== undefined) closeModal();
  });

  // Cerrar dropdown de rol al clicar fuera
  document.addEventListener('click', e => {
    if (STATE.rolDropdownOpen) {
      const wrap = document.getElementById('rol-selector-wrap');
      if (wrap && !wrap.contains(e.target)) toggleRolDropdown(false);
    }
    // Cerrar el menú de estado de incidencia al clicar fuera
    const eMenu = document.getElementById('estado-menu');
    if (eMenu && !eMenu.classList.contains('hidden')) {
      const closeBtn = e.target.closest('[onclick^="toggleEstadoMenu"]');
      const menuItem = e.target.closest('#estado-menu');
      if (!closeBtn && !menuItem) eMenu.classList.add('hidden');
    }
  });

  // Esc cierra modal o sidebar
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('modal');
      if (!modal.classList.contains('hidden')) closeModal();
      else if (STATE.sidebarOpen) toggleSidebar();
      else if (STATE.rolDropdownOpen) toggleRolDropdown(false);
    }
  });

  lucide.createIcons();
}

document.addEventListener('DOMContentLoaded', init);
