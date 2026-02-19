package uy.gub.registro.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "categorias_necesidad")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CategoriaNecesidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 100)
    private String nombre;
}
