package uy.gub.registro.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "discapacidades_persona")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class DiscapacidadPersona {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "persona_id", nullable = false)
    private Persona persona;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id", nullable = false)
    private CategoriaDiscapacidad categoria;

    @Column(name = "descripcion_especifica", columnDefinition = "TEXT")
    private String descripcionEspecifica;

    @Column(length = 20)
    private String grado; // Leve, Moderado, Severo
}
