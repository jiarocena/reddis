package uy.gub.registro.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "role_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "requested_role", nullable = false, length = 30)
    private String requestedRole; // COLABORADOR

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String status = "PENDIENTE"; // PENDIENTE, APROBADA, RECHAZADA

    @Column(length = 500)
    private String message;

    @Column(length = 200)
    private String organization;

    @Column(length = 1000)
    private String motive;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private Usuario reviewedBy;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;
}
