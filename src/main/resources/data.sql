-- ============================================
-- Datos iniciales del Sistema
-- ============================================

-- Departamentos de Uruguay
INSERT INTO departamentos (nombre, codigo) VALUES ('Artigas', 'ART') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO departamentos (nombre, codigo) VALUES ('Canelones', 'CAN') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO departamentos (nombre, codigo) VALUES ('Cerro Largo', 'CLA') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO departamentos (nombre, codigo) VALUES ('Colonia', 'COL') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO departamentos (nombre, codigo) VALUES ('Durazno', 'DUR') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO departamentos (nombre, codigo) VALUES ('Flores', 'FLO') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO departamentos (nombre, codigo) VALUES ('Florida', 'FLD') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO departamentos (nombre, codigo) VALUES ('Lavalleja', 'LAV') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO departamentos (nombre, codigo) VALUES ('Maldonado', 'MAL') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO departamentos (nombre, codigo) VALUES ('Montevideo', 'MVD') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO departamentos (nombre, codigo) VALUES ('Paysandú', 'PAY') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO departamentos (nombre, codigo) VALUES ('Río Negro', 'RNE') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO departamentos (nombre, codigo) VALUES ('Rivera', 'RIV') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO departamentos (nombre, codigo) VALUES ('Rocha', 'ROC') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO departamentos (nombre, codigo) VALUES ('Salto', 'SAL') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO departamentos (nombre, codigo) VALUES ('San José', 'SJO') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO departamentos (nombre, codigo) VALUES ('Soriano', 'SOR') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO departamentos (nombre, codigo) VALUES ('Tacuarembó', 'TAC') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO departamentos (nombre, codigo) VALUES ('Treinta y Tres', 'TYT') ON CONFLICT (nombre) DO NOTHING;

-- Categorías de Discapacidad
INSERT INTO categorias_discapacidad (nombre, descripcion) VALUES ('Física', 'Limitaciones en la movilidad o funciones corporales') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO categorias_discapacidad (nombre, descripcion) VALUES ('Intelectual', 'Limitaciones en el funcionamiento intelectual') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO categorias_discapacidad (nombre, descripcion) VALUES ('Psicosocial', 'Limitaciones derivadas de condiciones de salud mental') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO categorias_discapacidad (nombre, descripcion) VALUES ('Visual', 'Ceguera total o baja visión') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO categorias_discapacidad (nombre, descripcion) VALUES ('Auditiva', 'Sordera total o hipoacusia') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO categorias_discapacidad (nombre, descripcion) VALUES ('Múltiple', 'Combinación de dos o más discapacidades') ON CONFLICT (nombre) DO NOTHING;

-- Categorías de Necesidades
INSERT INTO categorias_necesidad (nombre) VALUES ('Empleo') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO categorias_necesidad (nombre) VALUES ('Salud') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO categorias_necesidad (nombre) VALUES ('Rehabilitación') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO categorias_necesidad (nombre) VALUES ('Movilidad') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO categorias_necesidad (nombre) VALUES ('Educación') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO categorias_necesidad (nombre) VALUES ('Vivienda') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO categorias_necesidad (nombre) VALUES ('Asistencia técnica') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO categorias_necesidad (nombre) VALUES ('Alimentación') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO categorias_necesidad (nombre) VALUES ('Transporte') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO categorias_necesidad (nombre) VALUES ('Cuidados personales') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO categorias_necesidad (nombre) VALUES ('Recreación') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO categorias_necesidad (nombre) VALUES ('Apoyo legal') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO categorias_necesidad (nombre) VALUES ('Otra') ON CONFLICT (nombre) DO NOTHING;
