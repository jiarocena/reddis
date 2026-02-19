package uy.gub.registro.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "necesidades_persona")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class NecesidadPersona {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "persona_id", nullable = false)
    private Persona persona;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_necesidad_id", nullable = false)
    private CategoriaNecesidad categoriaNecesidad;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(length = 20)
    private String prioridad; // Alta, Media, Baja

    @Builder.Default
    @Column(length = 20)
    private String estado = "Pendiente"; // Pendiente, En proceso, Resuelta
}
