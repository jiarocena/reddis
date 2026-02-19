package uy.gub.registro.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Forwards all non-API, non-static routes to index.html
 * so that React Router handles client-side routing.
 */
@Controller
public class SpaController {

    @RequestMapping(value = {
            "/login", "/registro", "/confirmar", "/perfil", "/pendientes",
            "/mapa", "/reportar", "/barrera/{id}", "/proyecto/{id}",
            "/admin", "/acerca"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
