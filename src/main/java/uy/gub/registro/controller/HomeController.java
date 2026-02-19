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

    @GetMapping("/")
    public String home(Model model, Authentication authentication) {
        model.addAttribute("totalPersonas", personaService.contarTotal());
        model.addAttribute("totalUsuarios", usuarioRepository.count());
        model.addAttribute("username", authentication.getName());
        return "home";
    }
}
