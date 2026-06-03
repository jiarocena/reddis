package uy.gub.registro.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "proyectos")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Proyecto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El título es obligatorio")
    @Column(nullable = false, length = 300)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String objective;

    // iniciando / en-proceso / finalizado
    @Builder.Default
    @Column(nullable = false, length = 30)
    private String status = "iniciando";

    @Column(length = 200)
    private String leader;

    @Column(length = 500)
    private String resources;

    @Builder.Default
    @Column(name = "needs_help")
    private Boolean needsHelp = false;

    @Column(name = "help_description", columnDefinition = "TEXT")
    private String helpDescription;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(columnDefinition = "TEXT")
    private String impact;

    @Column(columnDefinition = "TEXT")
    private String lessons;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "barrera_id", unique = true)
    private Barrera barrera;

    @Builder.Default
    @OneToMany(mappedBy = "proyecto", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Colaborador> collaborators = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "proyecto", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TimelineEntry> timeline = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "proyecto_acciones_previstas", joinColumns = @JoinColumn(name = "proyecto_id"))
    @Column(name = "accion", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> accionesPrevistas = new ArrayList<>();

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (startDate == null) startDate = LocalDate.now();
    }

    public void addCollaborator(Colaborador c) {
        collaborators.add(c);
        c.setProyecto(this);
    }

    public void addTimelineEntry(TimelineEntry t) {
        timeline.add(t);
        t.setProyecto(this);
    }
}
