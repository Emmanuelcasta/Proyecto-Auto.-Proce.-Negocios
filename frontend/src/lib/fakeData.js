// Stub data for screens not yet backed by the API
// (Marcaciones, Turnos, Nómina, Reportes)

export const fakeMarcaciones = [
  { id: 11, empId: 1, empNombre: 'Carlos Ramírez', fecha: '2026-05-04', entrada: '06:02', salida: '14:01', turno: 'TURNO_1', horas: 7.32, estado: 'completo' },
  { id: 12, empId: 2, empNombre: 'Laura Méndez',   fecha: '2026-05-04', entrada: '14:00', salida: '22:03', turno: 'TURNO_2', horas: 7.38, estado: 'completo' },
  { id: 13, empId: 3, empNombre: 'Juan Torres',    fecha: '2026-05-04', entrada: '06:14', salida: null,    turno: 'TURNO_1', horas: null, estado: 'incompleto' },
  { id: 14, empId: 1, empNombre: 'Carlos Ramírez', fecha: '2026-05-03', entrada: '06:01', salida: '14:00', turno: 'TURNO_1', horas: 7.32, estado: 'completo' },
  { id: 15, empId: 2, empNombre: 'Laura Méndez',   fecha: '2026-05-03', entrada: '13:58', salida: '22:01', turno: 'TURNO_2', horas: 7.38, estado: 'completo' },
  { id: 16, empId: 3, empNombre: 'Juan Torres',    fecha: '2026-05-03', entrada: '06:08', salida: '14:00', turno: 'TURNO_1', horas: 7.20, estado: 'corregido' },
  { id: 17, empId: 1, empNombre: 'Carlos Ramírez', fecha: '2026-05-02', entrada: '06:00', salida: '12:02', turno: 'TURNO_1', horas: 5.70, estado: 'completo' },
  { id: 18, empId: 2, empNombre: 'Laura Méndez',   fecha: '2026-05-02', entrada: '11:59', salida: '18:01', turno: 'TURNO_2', horas: 5.70, estado: 'completo' },
  { id: 19, empId: 3, empNombre: 'Juan Torres',    fecha: '2026-05-02', entrada: '06:05', salida: '12:00', turno: 'TURNO_1', horas: 5.58, estado: 'completo' },
];

export const fakeNominas = [
  { id: 101, empNombre: 'Carlos Ramírez', periodo: '01–15 May 2026', diasHabiles: 12, horasTrabajadas: 88.00, devengado: 1842330, deducciones: 113880, neto: 1728450, estado: 'BORRADOR' },
  { id: 102, empNombre: 'Laura Méndez',   periodo: '01–15 May 2026', diasHabiles: 12, horasTrabajadas: 91.40, devengado: 1924880, deducciones: 113880, neto: 1811000, estado: 'BORRADOR' },
  { id: 100, empNombre: 'Carlos Ramírez', periodo: '16–30 Abr 2026', diasHabiles: 13, horasTrabajadas: 95.33, devengado: 1923080, deducciones: 123360, neto: 1799720, estado: 'PAGADO' },
  { id: 99,  empNombre: 'Laura Méndez',   periodo: '16–30 Abr 2026', diasHabiles: 13, horasTrabajadas: 99.40, devengado: 2010500, deducciones: 123360, neto: 1887140, estado: 'PAGADO' },
];

export const fakeLiquidacion = {
  nominaId: 101,
  empleado: 'Carlos Ramírez',
  cedula: '79.412.601',
  cargo: 'Operario · Turno 1',
  periodo: '01 May 2026 – 15 May 2026',
  diasHabiles: 12,
  diasMes: 25,
  umbral: 88.00,
  valorHora: 6470.45,
  horas: [
    { concepto: 'Ordinaria diurna',         horas: 88.00, factor: 0,    valor: 569600 },
    { concepto: 'Ordinaria nocturna (35%)', horas: 0,     factor: 0.35, valor: 0 },
    { concepto: 'Extra diurna (25%)',       horas: 0,     factor: 0.25, valor: 0 },
    { concepto: 'Extra nocturna (75%)',     horas: 0,     factor: 0.75, valor: 0 },
    { concepto: 'Festivo diurno (80%)',     horas: 0,     factor: 0.80, valor: 0 },
  ],
  devengados: [
    { concepto: 'Salario básico proporcional',      valor: 683280 },
    { concepto: 'Auxilio de transporte proporcional', valor: 96000 },
    { concepto: 'Horas ordinarias diurnas',          valor: 569600 },
    { concepto: 'Recargos nocturnos',                valor: 0 },
    { concepto: 'Horas extra',                       valor: 493450 },
  ],
  deducciones: [
    { concepto: 'Salud (4%)',   valor: 27331 },
    { concepto: 'Pensión (4%)', valor: 27331 },
  ],
  aportes: [
    { concepto: 'Salud empleador (8.5%)',       valor: 58079 },
    { concepto: 'Pensión empleador (12%)',       valor: 81994 },
    { concepto: 'ARL (clase 1, 0.522%)',         valor: 3567 },
    { concepto: 'Caja de compensación (4%)',     valor: 27331 },
    { concepto: 'SENA (2%)',                     valor: 13666 },
    { concepto: 'ICBF (3%)',                     valor: 20498 },
  ],
};

export const fakeSemana = [
  { dia: 'Lun', horas: 22.0 },
  { dia: 'Mar', horas: 22.0 },
  { dia: 'Mié', horas: 21.8 },
  { dia: 'Jue', horas: 22.0 },
  { dia: 'Vie', horas: 22.0 },
  { dia: 'Sáb', horas: 17.0 },
];

export const fakeCiclo = [
  { semana: 'Semana 1–2', A: 'TURNO_1', B: 'TURNO_1', C: 'TURNO_2' },
  { semana: 'Semana 3–4', A: 'TURNO_1', B: 'TURNO_2', C: 'TURNO_1' },
  { semana: 'Semana 5–6', A: 'TURNO_2', B: 'TURNO_1', C: 'TURNO_1' },
];
