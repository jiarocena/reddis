package uy.gub.registro.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "departamentos")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Departamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String nombre;

    @Column(length = 10)
    private String codigo;
}
