package uy.gub.registro.controller;

import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import uy.gub.registro.model.Usuario;
import uy.gub.registro.service.UsuarioService;

@Controller
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public String listar(Model model) {
        model.addAttribute("usuarios", usuarioService.listarTodos());
        return "usuarios/lista";
    }

    @GetMapping("/nuevo")
    public String nuevo(Model model) {
        model.addAttribute("usuario", new Usuario());
        return "usuarios/formulario";
    }

    @PostMapping("/guardar")
    public String guardar(@Valid @ModelAttribute Usuario usuario,
            BindingResult result,
            @RequestParam(required = false) String nuevaPassword,
            RedirectAttributes redirect,
            Model model) {

        if (result.hasErrors()) {
            return "usuarios/formulario";
        }

        if (usuario.getId() == null) {
            // Nuevo usuario
            if (usuarioService.existeUsername(usuario.getUsername())) {
                model.addAttribute("errorUsername", "El nombre de usuario ya existe");
                return "usuarios/formulario";
            }
            usuarioService.guardar(usuario);
            redirect.addFlashAttribute("mensaje", "Usuario creado exitosamente");
        } else {
            // Actualizar usuario
            usuarioService.actualizar(usuario, nuevaPassword);
            redirect.addFlashAttribute("mensaje", "Usuario actualizado exitosamente");
        }

        return "redirect:/usuarios";
    }

    @GetMapping("/editar/{id}")
    public String editar(@PathVariable Long id, Model model) {
        Usuario usuario = usuarioService.buscarPorId(id);
        if (usuario == null) {
            return "redirect:/usuarios";
        }
        model.addAttribute("usuario", usuario);
        return "usuarios/formulario";
    }

    @GetMapping("/eliminar/{id}")
    public String eliminar(@PathVariable Long id, RedirectAttributes redirect) {
        usuarioService.eliminar(id);
        redirect.addFlashAttribute("mensaje", "Usuario eliminado exitosamente");
        return "redirect:/usuarios";
    }
}
