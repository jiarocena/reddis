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
import java.util.Optional;

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
            RoleRequestRepository roleRequestRepo,
            PasswordEncoder passwordEncoder) {
        return args -> {
            System.out.println(">>> REDDIS: Reseteando base de datos por solicitud del usuario...");
            
            // 1. Delete all dependencies in correct order to avoid FK issues
            timelineRepo.deleteAll();
            colaboradorRepo.deleteAll();
            proyectoRepo.deleteAll();
            barreraRepo.deleteAll();
            roleRequestRepo.deleteAll();
            
            // 2. Delete all users except 'admin'
            usuarioRepo.findAll().stream()
                    .filter(u -> !"admin".equalsIgnoreCase(u.getUsername()))
                    .forEach(usuarioRepo::delete);
            
            System.out.println(">>> REDDIS: Limpieza de base de datos completa.");

            // 3. Create Paysandú department
            Departamento paysandu = departamentoRepo.findAll().stream()
                    .filter(d -> "Paysandú".equalsIgnoreCase(d.getNombre()))
                    .findFirst()
                    .orElseGet(() -> departamentoRepo.save(
                            Departamento.builder().nombre("Paysandú").codigo("PA").build()));

            // 4. Create the 3 referents for Paysandú
            if (usuarioRepo.findByEmail("laura@test.com").isEmpty()) {
                Usuario laura = Usuario.builder()
                        .username("laura")
                        .password(passwordEncoder.encode("laura123"))
                        .nombreCompleto("Laura")
                        .email("laura@test.com")
                        .rol("REFERENTE")
                        .departamento("Paysandú")
                        .activo(true)
                        .emailConfirmed(true)
                        .build();
                usuarioRepo.save(laura);
                System.out.println(">>> Referente Laura creado (laura@test.com / laura123)");
            }

            if (usuarioRepo.findByEmail("soledad@test.com").isEmpty()) {
                Usuario soledad = Usuario.builder()
                        .username("soledad")
                        .password(passwordEncoder.encode("soledad123"))
                        .nombreCompleto("Soledad")
                        .email("soledad@test.com")
                        .rol("REFERENTE")
                        .departamento("Paysandú")
                        .activo(true)
                        .emailConfirmed(true)
                        .build();
                usuarioRepo.save(soledad);
                System.out.println(">>> Referente Soledad creado (soledad@test.com / soledad123)");
            }

            if (usuarioRepo.findByEmail("jose@test.com").isEmpty()) {
                Usuario jose = Usuario.builder()
                        .username("jose")
                        .password(passwordEncoder.encode("jose123"))
                        .nombreCompleto("José")
                        .email("jose@test.com")
                        .rol("REFERENTE")
                        .departamento("Paysandú")
                        .activo(true)
                        .emailConfirmed(true)
                        .build();
                usuarioRepo.save(jose);
                System.out.println(">>> Referente José creado (jose@test.com / jose123)");
            }

            if (usuarioRepo.findByEmail("juan@test.com").isEmpty()) {
                Usuario juan = Usuario.builder()
                        .username("juan")
                        .password(passwordEncoder.encode("juan123"))
                        .nombreCompleto("Juan")
                        .email("juan@test.com")
                        .rol("USUARIO")
                        .departamento("Paysandú")
                        .activo(true)
                        .emailConfirmed(true)
                        .build();
                usuarioRepo.save(juan);
                System.out.println(">>> Usuario general Juan creado (juan@test.com / juan123)");
            }
            
            System.out.println(">>> REDDIS: Reseteo e inicialización de Paysandú completa.");
        };
    }
}
