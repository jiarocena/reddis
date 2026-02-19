package uy.gub.registro.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "integrantes_hogar")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class IntegranteHogar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "persona_id", nullable = false)
    private Persona persona;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(length = 50)
    private String parentesco;

    private Integer edad;

    @Column(length = 300)
    private String observacion;
}
