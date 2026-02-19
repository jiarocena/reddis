package uy.gub.registro.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre de usuario es obligatorio")
    @Size(min = 3, max = 50)
    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @NotBlank(message = "La contraseña es obligatoria")
    @Column(nullable = false)
    private String password;

    @NotBlank(message = "El nombre completo es obligatorio")
    @Column(name = "nombre_completo", nullable = false, length = 150)
    private String nombreCompleto;

    @Email(message = "El email debe ser válido")
    @Column(unique = true, length = 150)
    private String email;

    @NotBlank(message = "El rol es obligatorio")
    @Column(nullable = false, length = 30)
    private String rol; // ADMIN, REFERENTE, COLABORADOR, USUARIO, TECNICO, ADMINISTRATIVO

    @Builder.Default
    @Column(nullable = false)
    private Boolean activo = true;

    @Builder.Default
    @Column(name = "email_confirmed", nullable = false)
    private Boolean emailConfirmed = false;

    @Column(name = "confirmation_token", length = 100)
    private String confirmationToken;

    @Column(length = 50)
    private String departamento;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    // Helper to check role hierarchy
    public boolean hasRole(String requiredRole) {
        if (rol == null)
            return false;
        int userLevel = roleLevel(rol);
        int requiredLevel = roleLevel(requiredRole);
        return userLevel >= requiredLevel;
    }

    private static int roleLevel(String role) {
        return switch (role) {
            case "ADMIN" -> 100;
            case "REFERENTE" -> 80;
            case "COLABORADOR" -> 60;
            case "TECNICO", "ADMINISTRATIVO" -> 50;
            case "USUARIO" -> 10;
            default -> 0;
        };
    }
}
