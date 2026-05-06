package uy.gub.registro.controller;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import uy.gub.registro.service.PersonaService;
import uy.gub.registro.repository.UsuarioRepository;

@Controller
public class HomeController {

    private final PersonaService personaService;
    private final UsuarioRepository usuarioRepository;

    public HomeController(PersonaService personaService, UsuarioRepository usuarioRepository) {
        this.personaService = personaService;
        this.usuarioRepository = usuarioRepository;
    }

    // Thymeleaf dashboard (only for authenticated Thymeleaf sessions)
    @GetMapping("/dashboard")
    public String dashboard(Model model, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return "redirect:/login";
        }
        model.addAttribute("totalPersonas", personaService.contarTotal());
        model.addAttribute("totalUsuarios", usuarioRepository.count());
        model.addAttribute("username", authentication.getName());
        return "home";
    }

    // Root "/" now forwards to React SPA (index.html served from static/)
    @GetMapping({"/", "/mapa", "/barreras", "/reportar", "/acerca", "/barrera/**", "/proyecto/**",
                 "/gestion", "/gestion/**", "/confirmar", "/perfil", "/pendientes", "/admin"})
    public String reactForward() {
        return "forward:/index.html";
    }
}
