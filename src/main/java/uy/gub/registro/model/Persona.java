package uy.gub.registro.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "personas")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Persona {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // === IDENTIFICACIÓN ===
    @NotBlank(message = "La cédula es obligatoria")
    @Column(unique = true, nullable = false, length = 20)
    private String cedula;

    @NotBlank(message = "Los nombres son obligatorios")
    @Column(nullable = false, length = 100)
    private String nombres;

    @NotBlank(message = "Los apellidos son obligatorios")
    @Column(nullable = false, length = 100)
    private String apellidos;

    @NotNull(message = "La fecha de nacimiento es obligatoria")
    @Column(name = "fecha_nacimiento", nullable = false)
    private LocalDate fechaNacimiento;

    // === CONTACTO ===
    @Column(length = 20)
    private String celular;

    @Column(length = 300)
    private String direccion;

    @Column(length = 100)
    private String municipio;

    @Column(length = 100)
    private String localidad;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departamento_id")
    private Departamento departamento;

    // === GEORREFERENCIA ===
    @Column(precision = 10, scale = 7)
    private BigDecimal latitud;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitud;

    // === EDUCACIÓN, EMPLEO, VIVIENDA ===
    @Column(name = "nivel_educativo", length = 50)
    private String nivelEducativo;

    @Column(name = "situacion_laboral", length = 50)
    private String situacionLaboral;

    @Column(name = "tipo_vivienda", length = 50)
    private String tipoVivienda;

    @Column(name = "descripcion_vivienda", length = 500)
    private String descripcionVivienda;

    // === OBSERVACIONES ===
    @Column(columnDefinition = "TEXT")
    private String observaciones;

    // === RELACIONES ===
    @Builder.Default
    @OneToMany(mappedBy = "persona", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<IntegranteHogar> integrantesHogar = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "persona", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DiscapacidadPersona> discapacidades = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "persona", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<NecesidadPersona> necesidades = new ArrayList<>();

    // === AUDITORÍA ===
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registrado_por")
    private Usuario registradoPor;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // === HELPERS ===
    public String getNombreCompleto() {
        return nombres + " " + apellidos;
    }

    public void addIntegrante(IntegranteHogar integrante) {
        integrantesHogar.add(integrante);
        integrante.setPersona(this);
    }

    public void addDiscapacidad(DiscapacidadPersona disc) {
        discapacidades.add(disc);
        disc.setPersona(this);
    }

    public void addNecesidad(NecesidadPersona nec) {
        necesidades.add(nec);
        nec.setPersona(this);
    }
}
