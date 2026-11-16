/* ===== CONFIGURACIÓN DEL PORTAFOLIO ===== */
const CONFIG = {
  EMAIL: 'tu-correo@ejemplo.com',
  CLAVE_EDITOR: 'david2026',
  CV_URL: 'cv.pdf'
};
/* Archivos PÚBLICOS. week: 1-16 · act: 0 = Actividad 1, 1 = Actividad 2
   Archivos grandes se sirven desde el repo original (portafolio-_final-) */
const RAW = 'https://raw.githubusercontent.com/dm3986012/portafolio-_final-/main/actividades';
const EVIDENCIAS = {
  1: [
    { act: 0, name: 'actividad-1.html', url: 'evidencias/semana-01/actividad-1.html' },
    { act: 1, name: 'actividad-2.html', url: 'evidencias/semana-01/actividad-2.html' }
  ],
  2: [
    { act: 0, name: 'actividad-1.html', url: 'evidencias/semana-02/actividad-1.html' },
    { act: 1, name: 'actividad-2.html', url: 'evidencias/semana-02/actividad-2.html' }
  ],
  3: [
    { act: 0, name: 'actividad-1.html', url: 'evidencias/semana-03/actividad-1.html' },
    { act: 0, name: '1_GradosTitulos.pdf', url: RAW + '/semana-03/1_GradosTitulos.pdf' },
    { act: 0, name: 'infografia_1_GradosTitulos.png', url: RAW + '/semana-03/infografia_1_GradosTitulos.png' },
    { act: 1, name: 'actividad-2.html', url: 'evidencias/semana-03/actividad-2.html' },
    { act: 1, name: '2_Actividad2_CadenaEditorial_EmpresaInformatica.pdf', url: RAW + '/semana-03/2_Actividad2_CadenaEditorial_EmpresaInformatica.pdf' },
    { act: 1, name: 'infografia_2_Actividad2.png', url: RAW + '/semana-03/infografia_2_Actividad2.png' }
  ],
  4: [
    { act: 0, name: 'actividad-1.html', url: 'evidencias/semana-04/actividad-1.html' },
    { act: 0, name: 'CadenaEditorial_10_datos.sql', url: 'evidencias/semana-04/CadenaEditorial_10_datos.sql' },
    { act: 0, name: 'Datos_Prueba_Grados_Titulos.sql', url: 'evidencias/semana-04/Datos_Prueba_Grados_Titulos.sql' },
    { act: 0, name: 'EmpresaMaterialInformatico_10_datos.sql', url: 'evidencias/semana-04/EmpresaMaterialInformatico_10_datos.sql' },
    { act: 0, name: 'cadena_editorial_cuestionario_v2.pdf', url: RAW + '/semana-04/cadena_editorial_cuestionario_v2.pdf' },
    { act: 1, name: 'actividad-2.html', url: 'evidencias/semana-04/actividad-2.html' }
  ],
  5: [
    { act: 0, name: 'actividad-1.html', url: 'evidencias/semana-05/actividad-1.html' },
    { act: 0, name: 'Manual_Azure_SQL_Semana05.pdf', url: RAW + '/semana-05/Manual_Azure_SQL_Semana05.pdf' },
    { act: 0, name: 'Grados_y_Titulos.sql', url: 'evidencias/semana-05/Grados_y_Titulos.sql' },
    { act: 0, name: 'Infografia_Azure_SQL_Semana05.pdf', url: RAW + '/semana-05/Infografia_Azure_SQL_Semana05.pdf' },
    { act: 1, name: 'actividad-2.html', url: 'evidencias/semana-05/actividad-2.html' }
  ],
  6: [
    { act: 0, name: 'actividad-1.html', url: 'evidencias/semana-06/actividad-1.html' },
    { act: 0, name: 'README-actividad-1.md', url: 'evidencias/semana-06/README-actividad-1.md' },
    { act: 0, name: 'Informe_sem6.pdf', url: RAW + '/semana-06/Informe_sem6.pdf' },
    { act: 0, name: 'Infografias_Semana_6_Unidas.pdf', url: RAW + '/semana-06/Infografias_Semana_6_Unidas.pdf' },
    { act: 1, name: 'actividad-2.html', url: 'evidencias/semana-06/actividad-2.html' }
  ],
  7: [
    { act: 0, name: 'actividad-1.html', url: 'evidencias/semana-07/actividad-1.html' },
    { act: 0, name: 'Guia laboratorio.pdf', url: RAW + '/semana-07/Guia%20laboratorio.pdf' },
    { act: 1, name: 'actividad-2.html', url: 'evidencias/semana-07/actividad-2.html' },
    { act: 1, name: 'Actividad_2_Guias_Semana_5_MEJORADO_CON_CAPTURAS.pdf', url: RAW + '/semana-07/Actividad_2_Guias_Semana_5_MEJORADO_CON_CAPTURAS.pdf' }
  ],
  8: [
    { act: 0, name: 'actividad-1.html', url: 'evidencias/semana-08/actividad-1.html' },
    { act: 0, name: 'Actividad_3_Infografias_Semana_5_REDISENO.pdf', url: RAW + '/semana-08/Actividad_3_Infografias_Semana_5_REDISENO.pdf' },
    { act: 0, name: 'infografias.pdf', url: RAW + '/semana-08/infografias.pdf' },
    { act: 1, name: 'actividad-2.html', url: 'evidencias/semana-08/actividad-2.html' },
    { act: 1, name: 'Guia laboratorio-3.pdf', url: RAW + '/semana-08/Guia%20laboratorio-3.pdf' }
  ]
};

const FRASES = ['Datos con estructura. Ideas con evidencia.', 'SELECT curiosidad FROM ingenieria_de_sistemas;', 'Primero entender el modelo. Después, escribir la consulta.', 'Modelar · Consultar · Documentar'];
const PROYECTOS = [
  { n: 'SQL QUEST', sem: [8], sub: 'Esquemas e Indexación', d: 'Un recorrido por la estructura de una base de datos: organizar esquemas y entender cómo los índices ayudan a consultar con intención.', obj: 'Comprender esquemas e indexación para consultar con intención.', tec: ['SQL', 'Esquemas', 'Indexación'], repo: '', demo: '#laboratorio', doc: '' },
  { n: 'Manual Azure SQL', sem: [5], sub: 'Grados y Títulos', d: 'Una guía práctica para trabajar con Azure SQL a través de un caso académico de grados y títulos.', obj: 'Documentar el uso de Azure SQL con un caso académico.', tec: ['Azure SQL', 'Manual', 'Consultas'], repo: '', demo: '', doc: RAW + '/semana-05/Manual_Azure_SQL_Semana05.pdf' },
  { n: 'Arquitectura Física', sem: [6], sub: 'Almacenamiento', d: 'Una mirada a cómo se organiza físicamente la información y a las decisiones que conectan el modelo con su almacenamiento.', obj: 'Entender cómo se organiza físicamente la información.', tec: ['Arquitectura', 'Datos', 'Almacenamiento'], repo: '', demo: '', doc: RAW + '/semana-06/Informe_sem6.pdf' },
  { n: 'Cadena Editorial', sem: [3, 4], sub: 'Empresa Informática', d: 'Modelado de una empresa editorial y datos de ejemplo para dar contexto a las relaciones entre sus entidades.', obj: 'Modelar entidades y relaciones con datos de ejemplo.', tec: ['Modelado', 'Relaciones', 'Datos de ejemplo'], repo: '', demo: '', doc: RAW + '/semana-03/2_Actividad2_CadenaEditorial_EmpresaInformatica.pdf' }
];
const SKILLS = [
  { n: 'Java', cat: 'Lenguajes', lvl: 0, use: [] },
  { n: 'JavaScript', cat: 'Lenguajes', lvl: 0, use: ['Este portafolio', 'Juego «Encesta»'] },
  { n: 'HTML', cat: 'Web', lvl: 0, use: ['Este portafolio'] },
  { n: 'CSS', cat: 'Web', lvl: 0, use: ['Este portafolio'] },
  { n: 'SQL', cat: 'Datos', lvl: 0, use: ['SQL QUEST', 'Manual Azure SQL', 'Laboratorio SQL'] },
  { n: 'MySQL', cat: 'Datos', lvl: 0, use: [] },
  { n: 'Bases de datos', cat: 'Datos', lvl: 0, use: ['Cadena Editorial', 'Arquitectura Física'] },
  { n: 'GitHub', cat: 'Herramientas', lvl: 0, use: [] },
  { n: 'Visual Studio Code', cat: 'Herramientas', lvl: 0, use: [] }
];
const EXTRA = [];
