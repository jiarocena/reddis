package uy.gub.registro.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "barreras")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Barrera {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El título es obligatorio")
    @Column(nullable = false, length = 300)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    // estructural / individual
    @NotBlank
    @Column(nullable = false, length = 30)
    private String type;

    // fisica / comunicacional / actitudinal / institucional
    @NotBlank
    @Column(nullable = false, length = 30)
    private String category;

    // Geolocation
    @Column(precision = 10, scale = 7)
    private BigDecimal lat;

    @Column(precision = 10, scale = 7)
    private BigDecimal lng;

    @Column(length = 300)
    private String address;

    @Column(name = "affected_people", length = 300)
    private String affectedPeople;

    // baja / media / alta
    @Builder.Default
    @Column(length = 20)
    private String urgency = "media";

    // denuncia / iniciando / en-proceso / finalizado
    @Builder.Default
    @Column(nullable = false, length = 30)
    private String status = "denuncia";

    @Column(name = "reported_by", length = 200)
    private String reportedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_by_user_id")
    private Usuario reportedByUser;

    @Builder.Default
    @Column(name = "is_public", nullable = false)
    private Boolean isPublic = true;

    @Builder.Default
    @Column(nullable = false)
    private Boolean approved = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by_id")
    private Usuario approvedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departamento_id")
    private Departamento departamento;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null)
            createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
