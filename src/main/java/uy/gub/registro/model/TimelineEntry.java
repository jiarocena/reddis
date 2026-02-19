package uy.gub.registro.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "timeline_entries")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TimelineEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    @Builder.Default
    @Column(nullable = false)
    private Boolean completed = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proyecto_id", nullable = false)
    private Proyecto proyecto;

    @PrePersist
    protected void onCreate() {
        if (date == null) date = LocalDate.now();
    }
}
