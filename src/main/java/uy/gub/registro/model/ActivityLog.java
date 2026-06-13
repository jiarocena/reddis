package uy.gub.registro.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType; // "PAGE_VIEW", "ACTION"

    @Column(length = 100)
    private String detail; // "/mapa", "report_barrier", "chat_message", etc.

    @Column(length = 50)
    private String username; // Nullable for guest users

    @Column(length = 30)
    private String rol; // Nullable (ADMIN, REFERENTE, COLABORADOR, USUARIO)

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
