package uy.gub.registro.controller;

import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import uy.gub.registro.model.*;
import uy.gub.registro.repository.*;
import uy.gub.registro.service.*;

import java.util.List;

@Controller
@RequestMapping("/personas")
public class PersonaController {

    private final PersonaService personaService;
    private final UsuarioService usuarioService;
    private final DepartamentoRepository departamentoRepository;
    private final CategoriaDiscapacidadRepository categoriaDiscapacidadRepository;
    private final CategoriaNecesidadRepository categoriaNecesidadRepository;

    public PersonaController(PersonaService personaService,
            UsuarioService usuarioService,
            DepartamentoRepository departamentoRepository,
            CategoriaDiscapacidadRepository categoriaDiscapacidadRepository,
            CategoriaNecesidadRepository categoriaNecesidadRepository) {
        this.personaService = personaService;
        this.usuarioService = usuarioService;
        this.departamentoRepository = departamentoRepository;
        this.categoriaDiscapacidadRepository = categoriaDiscapacidadRepository;
        this.categoriaNecesidadRepository = categoriaNecesidadRepository;
    }

    @GetMapping
    public String listar(@RequestParam(required = false) String busqueda, Model model) {
        List<Persona> personas;
        if (busqueda != null && !busqueda.isBlank()) {
            personas = personaService.buscar(busqueda);
            model.addAttribute("busqueda", busqueda);
        } else {
            personas = personaService.listarTodas();
        }
        model.addAttribute("personas", personas);
        return "personas/lista";
    }

    @GetMapping("/nuevo")
    public String nuevo(Model model) {
        model.addAttribute("persona", new Persona());
        cargarCatalogos(model);
        return "personas/formulario";
    }

    @PostMapping("/guardar")
    public String guardar(@Valid @ModelAttribute Persona persona,
            BindingResult result,
            @RequestParam(required = false) Long departamentoId,
            Authentication authentication,
            RedirectAttributes redirect,
            Model model) {

        if (result.hasErrors()) {
            cargarCatalogos(model);
            return "personas/formulario";
        }

        // Validar cédula duplicada en creación
        if (persona.getId() == null && personaService.existeCedula(persona.getCedula())) {
            model.addAttribute("errorCedula", "Ya existe una persona con esta cédula");
            cargarCatalogos(model);
            return "personas/formulario";
        }

        // Asignar departamento
        if (departamentoId != null) {
            persona.setDepartamento(departamentoRepository.findById(departamentoId).orElse(null));
        }

        // Asignar usuario que registra
        if (persona.getId() == null) {
            Usuario usuario = usuarioService.buscarPorUsername(authentication.getName());
            persona.setRegistradoPor(usuario);
        }

        personaService.guardar(persona);
        redirect.addFlashAttribute("mensaje", "Persona registrada exitosamente");
        return "redirect:/personas";
    }

    @GetMapping("/editar/{id}")
    public String editar(@PathVariable Long id, Model model) {
        Persona persona = personaService.buscarPorId(id);
        if (persona == null) {
            return "redirect:/personas";
        }
        model.addAttribute("persona", persona);
        cargarCatalogos(model);
        return "personas/formulario";
    }

    @GetMapping("/ver/{id}")
    public String ver(@PathVariable Long id, Model model) {
        Persona persona = personaService.buscarPorId(id);
        if (persona == null) {
            return "redirect:/personas";
        }
        model.addAttribute("persona", persona);
        model.addAttribute("integrantes", personaService.obtenerIntegrantes(id));
        model.addAttribute("discapacidades", personaService.obtenerDiscapacidades(id));
        model.addAttribute("necesidades", personaService.obtenerNecesidades(id));
        return "personas/ver";
    }

    @GetMapping("/eliminar/{id}")
    public String eliminar(@PathVariable Long id, RedirectAttributes redirect) {
        personaService.eliminar(id);
        redirect.addFlashAttribute("mensaje", "Persona eliminada exitosamente");
        return "redirect:/personas";
    }

    // --- Sub-entidades: Integrantes del Hogar ---

    @PostMapping("/{personaId}/integrantes/guardar")
    public String guardarIntegrante(@PathVariable Long personaId,
            @ModelAttribute IntegranteHogar integrante,
            RedirectAttributes redirect) {
        Persona persona = personaService.buscarPorId(personaId);
        integrante.setPersona(persona);
        personaService.guardarIntegrante(integrante);
        redirect.addFlashAttribute("mensaje", "Integrante agregado exitosamente");
        return "redirect:/personas/ver/" + personaId + "#hogar";
    }

    @GetMapping("/{personaId}/integrantes/eliminar/{id}")
    public String eliminarIntegrante(@PathVariable Long personaId,
            @PathVariable Long id,
            RedirectAttributes redirect) {
        personaService.eliminarIntegrante(id);
        redirect.addFlashAttribute("mensaje", "Integrante eliminado");
        return "redirect:/personas/ver/" + personaId + "#hogar";
    }

    // --- Sub-entidades: Discapacidades ---

    @PostMapping("/{personaId}/discapacidades/guardar")
    public String guardarDiscapacidad(@PathVariable Long personaId,
            @RequestParam Long categoriaId,
            @RequestParam(required = false) String descripcionEspecifica,
            @RequestParam(required = false) String grado,
            RedirectAttributes redirect) {
        Persona persona = personaService.buscarPorId(personaId);
        CategoriaDiscapacidad categoria = categoriaDiscapacidadRepository.findById(categoriaId).orElseThrow();
        DiscapacidadPersona disc = DiscapacidadPersona.builder()
                .persona(persona)
                .categoria(categoria)
                .descripcionEspecifica(descripcionEspecifica)
                .grado(grado)
                .build();
        personaService.guardarDiscapacidad(disc);
        redirect.addFlashAttribute("mensaje", "Discapacidad agregada exitosamente");
        return "redirect:/personas/ver/" + personaId + "#discapacidad";
    }

    @GetMapping("/{personaId}/discapacidades/eliminar/{id}")
    public String eliminarDiscapacidad(@PathVariable Long personaId,
            @PathVariable Long id,
            RedirectAttributes redirect) {
        personaService.eliminarDiscapacidad(id);
        redirect.addFlashAttribute("mensaje", "Discapacidad eliminada");
        return "redirect:/personas/ver/" + personaId + "#discapacidad";
    }

    // --- Sub-entidades: Necesidades ---

    @PostMapping("/{personaId}/necesidades/guardar")
    public String guardarNecesidad(@PathVariable Long personaId,
            @RequestParam Long categoriaNecesidadId,
            @RequestParam(required = false) String descripcion,
            @RequestParam(required = false) String prioridad,
            RedirectAttributes redirect) {
        Persona persona = personaService.buscarPorId(personaId);
        CategoriaNecesidad categoriaNecesidad = categoriaNecesidadRepository.findById(categoriaNecesidadId)
                .orElseThrow();
        NecesidadPersona nec = NecesidadPersona.builder()
                .persona(persona)
                .categoriaNecesidad(categoriaNecesidad)
                .descripcion(descripcion)
                .prioridad(prioridad)
                .estado("Pendiente")
                .build();
        personaService.guardarNecesidad(nec);
        redirect.addFlashAttribute("mensaje", "Necesidad agregada exitosamente");
        return "redirect:/personas/ver/" + personaId + "#necesidades";
    }

    @GetMapping("/{personaId}/necesidades/eliminar/{id}")
    public String eliminarNecesidad(@PathVariable Long personaId,
            @PathVariable Long id,
            RedirectAttributes redirect) {
        personaService.eliminarNecesidad(id);
        redirect.addFlashAttribute("mensaje", "Necesidad eliminada");
        return "redirect:/personas/ver/" + personaId + "#necesidades";
    }

    // --- Cargar catálogos para formularios ---

    private void cargarCatalogos(Model model) {
        model.addAttribute("departamentos", departamentoRepository.findAll());
        model.addAttribute("categoriasDiscapacidad", categoriaDiscapacidadRepository.findAll());
        model.addAttribute("categoriasNecesidad", categoriaNecesidadRepository.findAll());
        model.addAttribute("nivelesEducativos", List.of(
                "Sin instrucción", "Primaria incompleta", "Primaria completa",
                "Secundaria incompleta", "Secundaria completa",
                "Terciaria incompleta", "Terciaria completa", "Posgrado"));
        model.addAttribute("situacionesLaborales", List.of(
                "Empleado/a", "Desempleado/a", "Jubilado/a", "Pensionista",
                "Trabajo informal", "Inactivo/a"));
        model.addAttribute("tiposVivienda", List.of(
                "Casa", "Apartamento", "Vivienda precaria",
                "Pensión", "Institución", "Situación de calle", "Otra"));
        model.addAttribute("parentescos", List.of(
                "Cónyuge/Pareja", "Hijo/a", "Padre", "Madre",
                "Hermano/a", "Abuelo/a", "Nieto/a", "Otro"));
        model.addAttribute("grados", List.of("Leve", "Moderado", "Severo"));
        model.addAttribute("prioridades", List.of("Alta", "Media", "Baja"));
    }
}
