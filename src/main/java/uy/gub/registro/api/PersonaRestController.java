package uy.gub.registro.api;

import org.springframework.web.bind.annotation.*;
import uy.gub.registro.service.PersonaService;

import java.util.*;

@RestController
@RequestMapping("/api")
public class PersonaRestController {

    private final PersonaService personaService;

    public PersonaRestController(PersonaService personaService) {
        this.personaService = personaService;
    }

    @GetMapping("/estadisticas/resumen")
    public Map<String, Object> resumen() {
        Map<String, Object> result = new HashMap<>();
        result.put("totalPersonas", personaService.contarTotal());
        return result;
    }

    @GetMapping("/estadisticas/por-departamento")
    public List<Map<String, Object>> porDepartamento() {
        return personaService.estadisticasPorDepartamento().stream()
                .map(row -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("departamento", row[0]);
                    map.put("cantidad", row[1]);
                    return map;
                }).toList();
    }

    @GetMapping("/estadisticas/por-discapacidad")
    public List<Map<String, Object>> porDiscapacidad() {
        return personaService.estadisticasPorDiscapacidad().stream()
                .map(row -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("categoria", row[0]);
                    map.put("cantidad", row[1]);
                    return map;
                }).toList();
    }

    @GetMapping("/estadisticas/por-necesidad")
    public List<Map<String, Object>> porNecesidad() {
        return personaService.estadisticasPorNecesidad().stream()
                .map(row -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("categoria", row[0]);
                    map.put("cantidad", row[1]);
                    return map;
                }).toList();
    }
}
