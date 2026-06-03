// Seed data: barriers and projects for Paysandú department, Uruguay
// Centered around Paysandú (-32.32, -58.07)

export const CATEGORIES = {
    fisica: { label: 'Física', color: '#ef4444', description: 'Accesibilidad física, infraestructura' },
    comunicacional: { label: 'Comunicacional', color: '#8b5cf6', description: 'Lengua de señas, formatos accesibles' },
    actitudinal: { label: 'Actitudinal', color: '#f97316', description: 'Discriminación, prejuicios' },
    institucional: { label: 'Institucional', color: '#06b6d4', description: 'Normativas, procedimientos' }
};

export const BARRIER_TYPES = {
    estructural: { label: 'Estructural', icon: '🏛️', description: 'Vinculada a un lugar o institución' },
    individual: { label: 'Necesidad Individual', icon: '👤', description: 'Vinculada a una persona específica' }
};

export const PROJECT_STATUSES = {
    denuncia: { label: 'Identificada', color: '#ef4444' },
    iniciando: { label: 'Iniciando', color: '#f97316' },
    'en-proceso': { label: 'En Proceso', color: '#eab308' },
    finalizado: { label: 'Finalizado', color: '#10b981' }
};

export const SEED_BARRIERS = [
    {
        id: 'b1',
        title: 'Escuela N°5 sin rampa de acceso',
        description: 'La Escuela N°5 de Paysandú no cuenta con rampa de acceso en su entrada principal. Estudiantes con movilidad reducida deben ser cargados para ingresar al edificio.',
        type: 'estructural',
        category: 'fisica',
        location: { lat: -32.3215, lng: -58.0765 },
        address: 'Calle 18 de Julio esq. Rivera, Paysandú',
        affectedPeople: 'Estudiantes con discapacidad motriz',
        urgency: 'alta',
        status: 'denuncia',
        reportedBy: 'Madre de estudiante',
        date: '2025-11-15',
        isPublic: true,
    },
    {
        id: 'b2',
        title: 'Hospital de Paysandú sin intérprete de LSU',
        description: 'El Hospital de Paysandú no cuenta con intérprete de Lengua de Señas Uruguaya (LSU) en el servicio de urgencias. Las personas sordas no pueden comunicarse adecuadamente con el personal médico.',
        type: 'estructural',
        category: 'comunicacional',
        location: { lat: -32.3260, lng: -58.0820 },
        address: 'Av. Batlle y Ordóñez, Paysandú',
        affectedPeople: 'Personas sordas y con discapacidad auditiva',
        urgency: 'alta',
        status: 'en-proceso',
        reportedBy: 'Asociación de Sordos de Paysandú',
        date: '2025-10-20',
        isPublic: true,
    },
    {
        id: 'b3',
        title: 'Vereda rota en calle principal',
        description: 'Veredas en mal estado en la calle principal del centro de Paysandú, con baldosas levantadas y desniveles que impiden el tránsito seguro de personas en silla de ruedas.',
        type: 'estructural',
        category: 'fisica',
        location: { lat: -32.3240, lng: -58.0780 },
        address: 'Calle 25 de Mayo, Paysandú',
        affectedPeople: 'Personas con movilidad reducida, adultos mayores',
        urgency: 'media',
        status: 'iniciando',
        reportedBy: 'Vecino del barrio',
        date: '2025-12-01',
        isPublic: true,
    },
    {
        id: 'b4',
        title: 'Oficina de ANTEL sin señalización en braille',
        description: 'La oficina de ANTEL en Paysandú carece de señalización en braille y no cuenta con sistema de atención accesible para personas ciegas o con baja visión.',
        type: 'estructural',
        category: 'comunicacional',
        location: { lat: -32.3225, lng: -58.0790 },
        address: 'Plaza Constitución, Paysandú',
        affectedPeople: 'Personas ciegas y con baja visión',
        urgency: 'media',
        status: 'denuncia',
        reportedBy: 'Organización civil local',
        date: '2025-12-10',
        isPublic: true,
    },
    {
        id: 'b5',
        title: 'Rechazo laboral por discapacidad',
        description: 'Una persona con discapacidad visual fue rechazada en un proceso de selección laboral en un comercio local, a pesar de estar plenamente capacitada para el puesto.',
        type: 'individual',
        category: 'actitudinal',
        location: { lat: -32.3250, lng: -58.0810 },
        address: 'Paysandú',
        affectedPeople: 'Persona con discapacidad visual',
        urgency: 'alta',
        status: 'denuncia',
        reportedBy: 'La persona afectada',
        date: '2026-01-05',
        isPublic: true,
    },
    {
        id: 'b6',
        title: 'Intendencia sin protocolo de atención inclusiva',
        description: 'La Intendencia de Paysandú no cuenta con un protocolo de atención inclusiva para personas con discapacidad. Los trámites requieren presencialidad y no hay alternativas accesibles.',
        type: 'estructural',
        category: 'institucional',
        location: { lat: -32.3235, lng: -58.0795 },
        address: 'Plaza Constitución, Intendencia de Paysandú',
        affectedPeople: 'Todas las personas con discapacidad del departamento',
        urgency: 'media',
        status: 'en-proceso',
        reportedBy: 'Colectivo de PCD de Paysandú',
        date: '2025-09-15',
        isPublic: true,
    },
    {
        id: 'b7',
        title: 'Parada de ómnibus inaccesible en ruta 3',
        description: 'La parada de ómnibus principal sobre ruta 3, a la entrada de Paysandú, no tiene refugio accesible ni rebaje de cordón. Las personas en silla de ruedas no pueden abordar los buses.',
        type: 'estructural',
        category: 'fisica',
        location: { lat: -32.3180, lng: -58.0850 },
        address: 'Ruta 3, entrada a Paysandú',
        affectedPeople: 'Personas con movilidad reducida',
        urgency: 'alta',
        status: 'finalizado',
        reportedBy: 'Usuario del transporte',
        date: '2025-06-20',
        isPublic: true,
    },
    {
        id: 'b8',
        title: 'Necesidad de silla de ruedas motorizada',
        description: 'Persona con lesión medular necesita una silla de ruedas motorizada para poder trasladarse de forma autónoma. La silla manual actual no le permite moverse en las calles del pueblo.',
        type: 'individual',
        category: 'fisica',
        location: { lat: -32.3270, lng: -58.0740 },
        address: 'Barrio Centro, Paysandú',
        affectedPeople: 'Juan M., persona con lesión medular',
        urgency: 'alta',
        status: 'iniciando',
        reportedBy: 'Familiar de la persona',
        date: '2025-11-28',
        isPublic: true,
    },
    {
        id: 'b9',
        title: 'Liceo de Guichón sin baño adaptado',
        description: 'El liceo de Guichón no cuenta con baños adaptados para personas con discapacidad motriz. Un estudiante debe regresar a su casa para usar el baño.',
        type: 'estructural',
        category: 'fisica',
        location: { lat: -32.3551, lng: -57.2023 },
        address: 'Guichón, Paysandú',
        affectedPeople: 'Estudiantes con discapacidad motriz',
        urgency: 'alta',
        status: 'denuncia',
        reportedBy: 'Directora del liceo',
        date: '2026-01-20',
        isPublic: true,
    },
    {
        id: 'b10',
        title: 'Falta de material didáctico accesible en Escuela N°12',
        description: 'La Escuela N°12 no cuenta con material didáctico en formatos accesibles (braille, audio, lectura fácil) para estudiantes con discapacidad.',
        type: 'estructural',
        category: 'comunicacional',
        location: { lat: -32.3280, lng: -58.0830 },
        address: 'Av. Artigas, Paysandú',
        affectedPeople: 'Estudiantes con discapacidad visual e intelectual',
        urgency: 'media',
        status: 'denuncia',
        reportedBy: 'Maestra de apoyo',
        date: '2026-02-01',
        isPublic: true,
    }
];

export const SEED_PROJECTS = [
    {
        id: 'p1',
        barrierId: 'b2',
        title: 'Servicio de interpretación LSU en Hospital de Paysandú',
        description: 'Implementar un servicio de interpretación en Lengua de Señas Uruguaya en el Hospital de Paysandú, comenzando por el servicio de urgencias y extendiéndose progresivamente a otras áreas.',
        objective: 'Garantizar la comunicación efectiva entre el personal médico y los pacientes sordos en el servicio de urgencias.',
        status: 'en-proceso',
        leader: 'Dra. María Rodríguez - Dirección del Hospital',
        resources: 'Financiamiento ASSE, intérpretes de LSU contratados',
        needsHelp: true,
        helpDescription: 'Se necesitan más intérpretes de LSU y financiamiento para turnos nocturnos.',
        collaborators: [
            { name: 'ASSE Paysandú', role: 'Financiamiento y gestión', initials: 'AP' },
            { name: 'Asociación de Sordos', role: 'Asesoramiento técnico', initials: 'AS' },
            { name: 'MIDES - INADIS', role: 'Articulación institucional', initials: 'MI' }
        ],
        timeline: [
            { date: '2025-10-25', text: 'Reunión inicial con dirección del hospital y Asociación de Sordos.', completed: true },
            { date: '2025-11-10', text: 'ASSE aprueba presupuesto para contratación de intérpretes.', completed: true },
            { date: '2025-12-01', text: 'Primer intérprete de LSU comienza a trabajar en urgencias, turno diurno.', completed: true },
            { date: '2026-01-15', text: 'Evaluación del primer mes: 12 pacientes sordos atendidos con interpretación.', completed: true },
            { date: '2026-02-15', text: 'Gestión para incorporar segundo intérprete para turno nocturno.', completed: false }
        ],
        startDate: '2025-10-25',
        accionesPrevistas: [
            'Contratar intérpretes de LSU calificados',
            'Coordinar con la dirección del hospital la asignación de espacios físicos',
            'Difundir la disponibilidad del servicio a la comunidad sorda local'
        ],
    },
    {
        id: 'p2',
        barrierId: 'b6',
        title: 'Protocolo de atención inclusiva en Intendencia de Paysandú',
        description: 'Diseñar e implementar un protocolo integral de atención inclusiva para personas con discapacidad en todas las oficinas de la Intendencia de Paysandú.',
        objective: 'Que toda persona con discapacidad pueda realizar sus trámites de forma autónoma y digna.',
        status: 'en-proceso',
        leader: 'Lic. Carlos Pereira - Dir. de Desarrollo Social',
        resources: 'Equipo técnico de la Intendencia, asesoramiento de INADIS',
        needsHelp: false,
        helpDescription: '',
        collaborators: [
            { name: 'Intendencia de Paysandú', role: 'Liderazgo y ejecución', initials: 'IP' },
            { name: 'INADIS', role: 'Asesoramiento técnico', initials: 'IN' },
            { name: 'Colectivo PCD Paysandú', role: 'Participación y validación', initials: 'CP' }
        ],
        timeline: [
            { date: '2025-09-20', text: 'Primera reunión de diagnóstico con equipo de la Intendencia.', completed: true },
            { date: '2025-10-15', text: 'Relevamiento de barreras en todas las oficinas de atención al público.', completed: true },
            { date: '2025-11-20', text: 'Borrador del protocolo de atención inclusiva elaborado.', completed: true },
            { date: '2026-01-10', text: 'Consulta pública del protocolo con organizaciones de PCD.', completed: false },
            { date: '2026-03-01', text: 'Capacitación a funcionarios (previsto).', completed: false }
        ],
        startDate: '2025-09-20',
        accionesPrevistas: [
            'Redactar borrador del protocolo de atención inclusiva',
            'Realizar jornadas de capacitación a funcionarios públicos de atención',
            'Establecer canales accesibles para el reporte de reclamos en la comuna'
        ],
    },
    {
        id: 'p3',
        barrierId: 'b7',
        title: 'Accesibilización de parada de ómnibus en ruta 3',
        description: 'Construcción de refugio accesible y rebaje de cordón en la parada de ómnibus principal sobre ruta 3.',
        objective: 'Permitir el abordaje autónomo de ómnibus por parte de personas en silla de ruedas.',
        status: 'finalizado',
        leader: 'Ing. Laura Méndez - Intendencia de Paysandú',
        resources: 'Presupuesto departamental, donación de materiales de empresa local',
        needsHelp: false,
        helpDescription: '',
        collaborators: [
            { name: 'Intendencia de Paysandú', role: 'Ejecución de obra', initials: 'IP' },
            { name: 'Constructora López', role: 'Donación de materiales', initials: 'CL' },
            { name: 'Vecinos de la zona', role: 'Apoyo comunitario', initials: 'VZ' }
        ],
        timeline: [
            { date: '2025-07-01', text: 'Aprobación del proyecto por la Intendencia.', completed: true },
            { date: '2025-07-20', text: 'Constructora López dona cemento y materiales.', completed: true },
            { date: '2025-08-10', text: 'Inicio de obras de construcción.', completed: true },
            { date: '2025-09-05', text: 'Refugio accesible finalizado y rebaje de cordón completado.', completed: true },
            { date: '2025-09-10', text: 'Inauguración con presencia de autoridades y beneficiarios. Primera persona en silla de ruedas aborda bus sin asistencia.', completed: true }
        ],
        startDate: '2025-07-01',
        endDate: '2025-09-10',
        impact: '15 personas con movilidad reducida beneficiadas directamente',
        lessons: 'La articulación con empresas locales aceleró el proceso. El diseño participativo con PCD fue clave para la funcionalidad del refugio.',
        accionesPrevistas: [
            'Gestionar donación de cemento con Constructora López',
            'Realizar rebaje de cordón y nivelación de vereda en zona de parada',
            'Construir refugio techado con espacio reservado para sillas de ruedas'
        ],
    },
    {
        id: 'p4',
        barrierId: 'b8',
        title: 'Gestión de silla de ruedas motorizada para Juan M.',
        description: 'Coordinar la obtención de una silla de ruedas motorizada a través del sistema de ayudas técnicas de BPS.',
        objective: 'Que Juan M. pueda trasladarse de forma autónoma por las calles de Paysandú.',
        status: 'iniciando',
        leader: 'Trabajadora Social de MIDES Paysandú',
        resources: 'Trámite ante BPS, posible financiamiento complementario',
        needsHelp: true,
        helpDescription: 'Se busca financiamiento complementario para cubrir la diferencia de costo que BPS no cubra.',
        collaborators: [
            { name: 'MIDES Paysandú', role: 'Gestión y acompañamiento', initials: 'MP' },
            { name: 'BPS', role: 'Proveedor de ayuda técnica', initials: 'BP' }
        ],
        timeline: [
            { date: '2025-12-05', text: 'Evaluación inicial y entrevista con Juan M. y su familia.', completed: true },
            { date: '2025-12-20', text: 'Solicitud presentada ante BPS con certificación médica.', completed: true },
            { date: '2026-01-15', text: 'BPS confirma cobertura parcial. Se busca financiamiento complementario.', completed: false }
        ],
        startDate: '2025-12-05',
        accionesPrevistas: [
            'Presentar expediente médico de Juan M. ante BPS',
            'Organizar colecta comunitaria para cubrir la diferencia de costo',
            'Brindar capacitación básica a Juan M. en el manejo de la silla motorizada'
        ],
    }
];

export const INSTITUTIONS = [
    'ANEP', 'ASSE', 'Intendencia Departamental', 'MIDES', 'INADIS',
    'BPS', 'ANTEL', 'MTSS', 'OSC Local', 'Empresa privada', 'Otro'
];

export const DEPARTAMENTOS = [
    { nombre: 'Artigas', center: [-30.4, -56.47], zoom: 12 },
    { nombre: 'Canelones', center: [-34.52, -56.28], zoom: 12 },
    { nombre: 'Cerro Largo', center: [-32.37, -54.18], zoom: 12 },
    { nombre: 'Colonia', center: [-34.15, -57.77], zoom: 12 },
    { nombre: 'Durazno', center: [-33.38, -56.52], zoom: 12 },
    { nombre: 'Flores', center: [-33.54, -56.90], zoom: 14 },
    { nombre: 'Florida', center: [-34.10, -56.21], zoom: 12 },
    { nombre: 'Lavalleja', center: [-34.37, -55.23], zoom: 12 },
    { nombre: 'Maldonado', center: [-34.65, -54.95], zoom: 12 },
    { nombre: 'Montevideo', center: [-34.88, -56.18], zoom: 14 },
    { nombre: 'Paysandú', center: [-32.32, -58.07], zoom: 12 },
    { nombre: 'Río Negro', center: [-33.12, -57.35], zoom: 12 },
    { nombre: 'Rivera', center: [-30.90, -55.55], zoom: 12 },
    { nombre: 'Rocha', center: [-34.08, -53.77], zoom: 12 },
    { nombre: 'Salto', center: [-31.39, -57.97], zoom: 12 },
    { nombre: 'San José', center: [-34.34, -56.71], zoom: 12 },
    { nombre: 'Soriano', center: [-33.51, -57.75], zoom: 12 },
    { nombre: 'Tacuarembó', center: [-31.72, -55.98], zoom: 12 },
    { nombre: 'Treinta y Tres', center: [-33.23, -54.38], zoom: 12 },
];
