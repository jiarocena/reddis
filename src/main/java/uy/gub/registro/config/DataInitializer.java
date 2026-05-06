package uy.gub.registro.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import uy.gub.registro.model.*;
import uy.gub.registro.repository.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Configuration
public class DataInitializer {

        @Bean
        public CommandLineRunner initAdmin(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
                return args -> {
                        if (!usuarioRepository.existsByUsername("admin")) {
                                Usuario admin = Usuario.builder()
                                                .username("admin")
                                                .password(passwordEncoder.encode("admin123"))
                                                .nombreCompleto("Administrador del Sistema")
                                                .email("admin@sistema.gub.uy")
                                                .rol("ADMIN")
                                                .activo(true)
                                                .emailConfirmed(true)
                                                .build();
                                usuarioRepository.save(admin);
                                System.out.println(">>> Usuario admin creado (admin@sistema.gub.uy / admin123)");
                        }

                        // Create referente departamental
                        if (usuarioRepository.findByEmail("referente.flores@inadis.gub.uy").isEmpty()) {
                                Usuario referente = Usuario.builder()
                                                .username("referente_flores")
                                                .password(passwordEncoder.encode("referente123"))
                                                .nombreCompleto("María Rodríguez - Referente INADIS Flores")
                                                .email("referente.flores@inadis.gub.uy")
                                                .rol("REFERENTE")
                                                .departamento("Flores")
                                                .activo(true)
                                                .emailConfirmed(true)
                                                .build();
                                usuarioRepository.save(referente);
                                System.out.println(
                                                ">>> Referente Flores creado (referente.flores@inadis.gub.uy / referente123)");
                        }

                        // Create demo collaborator user
                        if (usuarioRepository.findByEmail("colaborador@test.com").isEmpty()) {
                                Usuario colab = Usuario.builder()
                                                .username("colaborador_demo")
                                                .password(passwordEncoder.encode("colab123"))
                                                .nombreCompleto("Juan Pérez - Colaborador")
                                                .email("colaborador@test.com")
                                                .rol("COLABORADOR")
                                                .activo(true)
                                                .emailConfirmed(true)
                                                .build();
                                usuarioRepository.save(colab);
                                System.out.println(">>> Colaborador demo creado (colaborador@test.com / colab123)");
                        }
                };
        }

        @Bean
        public CommandLineRunner initReddisData(
                        BarreraRepository barreraRepo,
                        ProyectoRepository proyectoRepo,
                        ColaboradorRepository colaboradorRepo,
                        TimelineEntryRepository timelineRepo,
                        DepartamentoRepository departamentoRepo,
                        UsuarioRepository usuarioRepo,
                        RoleRequestRepository roleRequestRepo) {
                return args -> {
                        // Only seed if empty
                        if (barreraRepo.count() > 0) {
                                // Auto-approve barriers that have projects (logical consistency)
                                List<Long> barreraIdsConProyecto = proyectoRepo.findAll().stream()
                                        .map(p -> p.getBarrera().getId())
                                        .distinct().toList();
                                long fixed = barreraRepo.findAllById(barreraIdsConProyecto).stream()
                                        .filter(b -> !Boolean.TRUE.equals(b.getApproved()))
                                        .peek(b -> b.setApproved(true))
                                        .map(barreraRepo::save)
                                        .count();
                                if (fixed > 0) {
                                        System.out.println(">>> REDDIS: " + fixed + " barreras con proyecto aprobadas automáticamente");
                                }

                                // Ensure all barriers have departamento and localidad set
                                Departamento floresMigrate = departamentoRepo.findAll().stream()
                                        .filter(d -> "Flores".equalsIgnoreCase(d.getNombre()))
                                        .findFirst()
                                        .orElseGet(() -> departamentoRepo.save(
                                                        Departamento.builder().nombre("Flores").codigo("FS").build()));
                                long migrated = barreraRepo.findAll().stream()
                                        .filter(b -> b.getDepartamento() == null || b.getLocalidad() == null)
                                        .peek(b -> {
                                                if (b.getDepartamento() == null) b.setDepartamento(floresMigrate);
                                                if (b.getLocalidad() == null) b.setLocalidad("Trinidad");
                                        })
                                        .map(barreraRepo::save)
                                        .count();
                                if (migrated > 0) {
                                        System.out.println(">>> REDDIS: " + migrated + " barreras migradas con departamento/localidad");
                                }

                                // Auto-create role requests for USUARIO accounts that don't have one

                                usuarioRepo.findAll().stream()
                                        .filter(u -> "USUARIO".equalsIgnoreCase(u.getRol()))
                                        .filter(u -> !roleRequestRepo.existsByUsuarioIdAndRequestedRole(u.getId(), "COLABORADOR"))
                                        .forEach(u -> {
                                                roleRequestRepo.save(RoleRequest.builder()
                                                        .usuario(u)
                                                        .requestedRole("COLABORADOR")
                                                        .message("Solicitud automática (migración)")
                                                        .build());
                                                System.out.println(">>> REDDIS: Solicitud de COLABORADOR creada para " + u.getNombreCompleto());
                                        });

                                System.out.println(">>> REDDIS: datos ya existentes, saltando seed.");
                                return;
                        }

                        // Get or create Flores department
                        Departamento flores = departamentoRepo.findAll().stream()
                                        .filter(d -> "Flores".equalsIgnoreCase(d.getNombre()))
                                        .findFirst()
                                        .orElseGet(() -> departamentoRepo.save(
                                                        Departamento.builder().nombre("Flores").codigo("FS").build()));

                        System.out.println(">>> REDDIS: Creando datos semilla para Flores...");

                        // ═══ 10 BARRIERS ═══
                        Barrera b1 = barreraRepo.save(Barrera.builder()
                                        .title("Escuela N°5 sin rampa de acceso")
                                        .description(
                                                        "La Escuela N°5 de Trinidad no cuenta con rampa de acceso en su entrada principal. Estudiantes con movilidad reducida deben ser cargados para ingresar al edificio.")
                                        .type("estructural").category("fisica")
                                        .lat(new BigDecimal("-33.5415")).lng(new BigDecimal("-56.8965"))
                                        .address("Calle 18 de Julio esq. Rivera, Trinidad")
                                        .affectedPeople("Estudiantes con discapacidad motriz")
                                        .urgency("alta").status("denuncia")
                                        .reportedBy("Madre de estudiante").isPublic(true)
                                        .approved(true)
                                        .departamento(flores)
                                        .localidad("Trinidad")
                                        .createdAt(LocalDateTime.of(2025, 11, 15, 10, 0)).build());

                        Barrera b2 = barreraRepo.save(Barrera.builder()
                                        .title("Hospital de Flores sin intérprete de LSU")
                                        .description(
                                                        "El Hospital de Flores no dispone de intérprete de Lengua de Señas Uruguaya (LSU) en ningún turno. Pacientes sordos deben concurrir acompañados o comunicarse por escrito.")
                                        .type("estructural").category("comunicacional")
                                        .lat(new BigDecimal("-33.5398")).lng(new BigDecimal("-56.8912"))
                                        .address("Av. Batlle esq. Lavalleja, Trinidad")
                                        .affectedPeople("Personas sordas y con hipoacusia")
                                        .urgency("alta").status("iniciando")
                                        .reportedBy("Asociación de Sordos de Flores").isPublic(true)
                                        .approved(true)
                                        .departamento(flores)
                                        .localidad("Trinidad")
                                        .createdAt(LocalDateTime.of(2025, 10, 28, 14, 0)).build());

                        Barrera b3 = barreraRepo.save(Barrera.builder()
                                        .title("Veredas rotas en zona céntrica de Trinidad")
                                        .description(
                                                        "Las veredas de las calles principales del centro de Trinidad tienen roturas, desniveles y falta de rampas en esquinas, dificultando la movilidad.")
                                        .type("estructural").category("fisica")
                                        .lat(new BigDecimal("-33.5380")).lng(new BigDecimal("-56.8940"))
                                        .address("Calle 25 de Mayo entre Ituzaingó y Lavalleja, Trinidad")
                                        .affectedPeople("Personas en silla de ruedas, adultos mayores")
                                        .urgency("media").status("en-proceso")
                                        .reportedBy("Vecino del centro").isPublic(true)
                                        .approved(true)
                                        .departamento(flores)
                                        .localidad("Trinidad")
                                        .createdAt(LocalDateTime.of(2025, 9, 5, 9, 30)).build());

                        Barrera b4 = barreraRepo.save(Barrera.builder()
                                        .title("Transporte público sin accesibilidad")
                                        .description(
                                                        "Los buses interdepartamentales no cuentan con rampa ni espacio para sillas de ruedas. Las personas con discapacidad motriz no pueden utilizar el transporte público.")
                                        .type("estructural").category("fisica")
                                        .lat(new BigDecimal("-33.5425")).lng(new BigDecimal("-56.8930"))
                                        .address("Terminal de ómnibus de Trinidad")
                                        .affectedPeople("Personas con discapacidad motriz")
                                        .urgency("alta").status("denuncia")
                                        .reportedBy("Usuario de silla de ruedas").isPublic(true)
                                        .approved(true)
                                        .departamento(flores)
                                        .localidad("Trinidad")
                                        .createdAt(LocalDateTime.of(2025, 12, 1, 16, 0)).build());

                        Barrera b5 = barreraRepo.save(Barrera.builder()
                                        .title("Discriminación en evento cultural municipal")
                                        .description(
                                                        "En eventos culturales de la Intendencia de Flores no se reservan lugares accesibles. Personas con discapacidad son ubicadas en zonas alejadas del escenario.")
                                        .type("estructural").category("actitudinal")
                                        .lat(new BigDecimal("-33.5370")).lng(new BigDecimal("-56.8990"))
                                        .address("Plaza Constitución, Trinidad")
                                        .affectedPeople("Personas con discapacidad en general")
                                        .urgency("media").status("denuncia")
                                        .reportedBy("Asistente a evento").isPublic(true)
                                        .approved(true)
                                        .departamento(flores)
                                        .localidad("Trinidad")
                                        .createdAt(LocalDateTime.of(2025, 11, 20, 11, 0)).build());

                        Barrera b6 = barreraRepo.save(Barrera.builder()
                                        .title("Formularios municipales sin formato accesible")
                                        .description(
                                                        "Los formularios de trámites de la Intendencia solo existen en formato impreso estándar. No hay versiones en lectura fácil, braille, ni formatos digitales accesibles.")
                                        .type("estructural").category("institucional")
                                        .lat(new BigDecimal("-33.5395")).lng(new BigDecimal("-56.8950"))
                                        .address("Intendencia de Flores, Trinidad")
                                        .affectedPeople("Personas con discapacidad visual e intelectual")
                                        .urgency("media").status("denuncia")
                                        .reportedBy("Trabajador social").isPublic(true)
                                        .approved(true)
                                        .departamento(flores)
                                        .localidad("Trinidad")
                                        .createdAt(LocalDateTime.of(2025, 12, 10, 8, 45)).build());

                        Barrera b7 = barreraRepo.save(Barrera.builder()
                                        .title("Cajeros automáticos sin audio ni braille")
                                        .description(
                                                        "Los cajeros automáticos del banco en la zona central no cuentan con audio ni indicaciones en braille para personas con discapacidad visual.")
                                        .type("estructural").category("comunicacional")
                                        .lat(new BigDecimal("-33.5388")).lng(new BigDecimal("-56.8928"))
                                        .address("Calle 18 de Julio 525, Trinidad")
                                        .affectedPeople("Personas con discapacidad visual")
                                        .urgency("media").status("denuncia")
                                        .reportedBy("Familiar de persona ciega").isPublic(true)
                                        .approved(true)
                                        .departamento(flores)
                                        .localidad("Trinidad")
                                        .createdAt(LocalDateTime.of(2025, 12, 15, 10, 30)).build());

                        Barrera b8 = barreraRepo.save(Barrera.builder()
                                        .title("Polideportivo municipal sin baños adaptados")
                                        .description(
                                                        "El polideportivo municipal no tiene baños adaptados para personas con discapacidad, limitando el acceso para actividades deportivas y recreativas.")
                                        .type("estructural").category("fisica")
                                        .lat(new BigDecimal("-33.5440")).lng(new BigDecimal("-56.8980"))
                                        .address("Polideportivo Municipal, Trinidad")
                                        .affectedPeople("Personas con discapacidad motriz")
                                        .urgency("alta").status("finalizado")
                                        .reportedBy("Deportista").isPublic(true)
                                        .approved(true)
                                        .departamento(flores)
                                        .localidad("Trinidad")
                                        .createdAt(LocalDateTime.of(2025, 6, 15, 14, 0)).build());

                        Barrera b9 = barreraRepo.save(Barrera.builder()
                                        .title("Parada de ómnibus sin refugio accesible")
                                        .description(
                                                        "La parada de ómnibus frente al liceo no tiene refugio con espacio para silla de ruedas ni piso podotáctil.")
                                        .type("estructural").category("fisica")
                                        .lat(new BigDecimal("-33.5405")).lng(new BigDecimal("-56.8920"))
                                        .address("Av. Batlle frente al Liceo N°1, Trinidad")
                                        .affectedPeople("Personas con discapacidad motriz y visual")
                                        .urgency("baja").status("denuncia")
                                        .reportedBy("Estudiante").isPublic(true)
                                        .approved(true)
                                        .departamento(flores)
                                        .localidad("Trinidad")
                                        .createdAt(LocalDateTime.of(2025, 12, 20, 9, 0)).build());

                        Barrera b10 = barreraRepo.save(Barrera.builder()
                                        .title("Falta de empleo inclusivo en zona industrial")
                                        .description(
                                                        "Las empresas de la zona industrial de Flores no tienen políticas de contratación inclusiva. Personas con discapacidad no son consideradas en procesos de selección.")
                                        .type("estructural").category("institucional")
                                        .lat(new BigDecimal("-33.5450")).lng(new BigDecimal("-56.9010"))
                                        .address("Zona Industrial, Trinidad")
                                        .affectedPeople("Personas con discapacidad en edad laboral")
                                        .urgency("media").status("iniciando")
                                        .reportedBy("CODICEN Flores").isPublic(true)
                                        .approved(true)
                                        .departamento(flores)
                                        .localidad("Trinidad")
                                        .createdAt(LocalDateTime.of(2025, 11, 1, 12, 0)).build());

                        // ═══ 4 PROJECTS ═══

                        // Project 1 - on b2 (Hospital LSU) - iniciando
                        Proyecto p1 = proyectoRepo.save(Proyecto.builder()
                                        .title("Intérprete LSU para Hospital de Flores")
                                        .description(
                                                        "Proyecto para incorporar un servicio de interpretación en LSU en el Hospital de Flores.")
                                        .objective("Garantizar la comunicación efectiva entre profesionales de salud y pacientes sordos.")
                                        .status("iniciando").leader("Lic. María González")
                                        .resources("Contacto con intérpretes de LSU certificados, apoyo de CINDE")
                                        .needsHelp(true)
                                        .helpDescription(
                                                        "Se necesitan intérpretes de LSU disponibles para turnos rotativos.")
                                        .startDate(LocalDate.of(2025, 11, 5)).barrera(b2).build());
                        colaboradorRepo.save(Colaborador.builder().name("Lic. María González").role("Líder de proyecto")
                                        .initials("MG").proyecto(p1).build());
                        colaboradorRepo.save(
                                        Colaborador.builder().name("Dr. Alejandro Fuentes").role("Director Hospital")
                                                        .initials("AF").proyecto(p1).build());
                        timelineRepo.save(
                                        TimelineEntry.builder().date(LocalDate.of(2025, 11, 5)).text("Proyecto creado")
                                                        .completed(true).proyecto(p1).build());
                        timelineRepo.save(TimelineEntry.builder().date(LocalDate.of(2025, 11, 15))
                                        .text("Reunión con dirección del hospital").completed(true).proyecto(p1)
                                        .build());
                        timelineRepo.save(TimelineEntry.builder().date(LocalDate.of(2025, 12, 1))
                                        .text("Contacto con intérpretes certificados").completed(false).proyecto(p1)
                                        .build());

                        // Project 2 - on b3 (Veredas) - en-proceso
                        Proyecto p2 = proyectoRepo.save(Proyecto.builder()
                                        .title("Reparación de veredas centro Trinidad")
                                        .description(
                                                        "Proyecto de reparación y adecuación de veredas en zona céntrica, incluyendo rampas en esquinas.")
                                        .objective("Lograr veredas transitables y accesibles en 10 cuadras del centro.")
                                        .status("en-proceso").leader("Ing. Carlos Rodríguez")
                                        .resources("Presupuesto aprobado por Intendencia, cuadrilla de obras")
                                        .needsHelp(false)
                                        .startDate(LocalDate.of(2025, 9, 20)).barrera(b3).build());
                        colaboradorRepo.save(
                                        Colaborador.builder().name("Ing. Carlos Rodríguez").role("Director de Obras")
                                                        .initials("CR").proyecto(p2).build());
                        colaboradorRepo.save(Colaborador.builder().name("Arq. Laura Méndez").role("Diseño accesible")
                                        .initials("LM")
                                        .proyecto(p2).build());
                        colaboradorRepo.save(Colaborador.builder().name("Intendencia de Flores").role("Financiamiento")
                                        .initials("IF").proyecto(p2).build());
                        timelineRepo.save(TimelineEntry.builder().date(LocalDate.of(2025, 9, 20))
                                        .text("Aprobación del proyecto por Intendencia").completed(true).proyecto(p2)
                                        .build());
                        timelineRepo.save(TimelineEntry.builder().date(LocalDate.of(2025, 10, 1))
                                        .text("Relevamiento de veredas afectadas").completed(true).proyecto(p2)
                                        .build());
                        timelineRepo.save(TimelineEntry.builder().date(LocalDate.of(2025, 10, 15))
                                        .text("Inicio de obras en calle 25 de Mayo").completed(true).proyecto(p2)
                                        .build());
                        timelineRepo.save(TimelineEntry.builder().date(LocalDate.of(2025, 11, 20))
                                        .text("Completadas 4 de 10 cuadras").completed(true).proyecto(p2).build());
                        timelineRepo.save(TimelineEntry.builder().date(LocalDate.of(2026, 1, 30))
                                        .text("Finalización prevista de todas las cuadras").completed(false)
                                        .proyecto(p2).build());

                        // Project 3 - on b8 (Polideportivo) - finalizado
                        Proyecto p3 = proyectoRepo.save(Proyecto.builder()
                                        .title("Baños adaptados en Polideportivo")
                                        .description("Construcción de baños adaptados en el polideportivo municipal.")
                                        .objective("Construir 2 baños completamente adaptados según norma UNIT.")
                                        .status("finalizado").leader("Arq. Fernando Silva")
                                        .resources("Presupuesto participativo")
                                        .needsHelp(false)
                                        .startDate(LocalDate.of(2025, 7, 1)).endDate(LocalDate.of(2025, 10, 15))
                                        .impact("2 baños adaptados construidos. 15 personas con discapacidad motriz ahora acceden al polideportivo semanalmente.")
                                        .lessons(
                                                        "La participación de usuarios con discapacidad en el diseño fue clave. Se recomienda aplicar el mismo proceso de consulta en futuras obras públicas.")
                                        .barrera(b8).build());
                        colaboradorRepo.save(Colaborador.builder().name("Arq. Fernando Silva").role("Director de obra")
                                        .initials("FS").proyecto(p3).build());
                        colaboradorRepo.save(Colaborador.builder().name("Prof. Ana Cardozo").role("Deporte inclusivo")
                                        .initials("AC").proyecto(p3).build());
                        timelineRepo.save(TimelineEntry.builder().date(LocalDate.of(2025, 7, 1)).text("Inicio proyecto")
                                        .completed(true).proyecto(p3).build());
                        timelineRepo.save(TimelineEntry.builder().date(LocalDate.of(2025, 8, 1))
                                        .text("Obras de construcción iniciadas").completed(true).proyecto(p3).build());
                        timelineRepo.save(TimelineEntry.builder().date(LocalDate.of(2025, 9, 15))
                                        .text("Instalación de equipamiento").completed(true).proyecto(p3).build());
                        timelineRepo.save(TimelineEntry.builder().date(LocalDate.of(2025, 10, 15))
                                        .text("Inauguración de baños adaptados").completed(true).proyecto(p3).build());

                        // Project 4 - on b10 (Empleo) - iniciando
                        Proyecto p4 = proyectoRepo.save(Proyecto.builder()
                                        .title("Programa de empleo inclusivo Flores")
                                        .description(
                                                        "Programa piloto de capacitación e inserción laboral para personas con discapacidad en empresas de Flores.")
                                        .objective("Capacitar a 20 personas con discapacidad y vincularlas con al menos 5 empresas.")
                                        .status("iniciando").leader("Lic. Gabriela Márquez")
                                        .resources("INEFOP, MIDES, Intendencia de Flores")
                                        .needsHelp(true)
                                        .helpDescription("Se buscan empresas dispuestas a participar del piloto.")
                                        .startDate(LocalDate.of(2025, 11, 15)).barrera(b10).build());
                        colaboradorRepo.save(Colaborador.builder().name("Lic. Gabriela Márquez").role("Coordinadora")
                                        .initials("GM")
                                        .proyecto(p4).build());
                        timelineRepo.save(
                                        TimelineEntry.builder().date(LocalDate.of(2025, 11, 15)).text("Proyecto creado")
                                                        .completed(true).proyecto(p4).build());
                        timelineRepo.save(TimelineEntry.builder().date(LocalDate.of(2025, 12, 1))
                                        .text("Convocatoria a empresas")
                                        .completed(false).proyecto(p4).build());

                        System.out.println(">>> REDDIS: " + barreraRepo.count() + " barreras y " + proyectoRepo.count()
                                        + " proyectos creados.");
                };
        }
}
