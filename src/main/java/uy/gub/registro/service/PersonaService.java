package uy.gub.registro.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uy.gub.registro.model.*;
import uy.gub.registro.repository.*;

import java.util.List;

@Service
public class PersonaService {

    private final PersonaRepository personaRepository;
    private final IntegranteHogarRepository integranteHogarRepository;
    private final DiscapacidadPersonaRepository discapacidadPersonaRepository;
    private final NecesidadPersonaRepository necesidadPersonaRepository;

    public PersonaService(PersonaRepository personaRepository,
            IntegranteHogarRepository integranteHogarRepository,
            DiscapacidadPersonaRepository discapacidadPersonaRepository,
            NecesidadPersonaRepository necesidadPersonaRepository) {
        this.personaRepository = personaRepository;
        this.integranteHogarRepository = integranteHogarRepository;
        this.discapacidadPersonaRepository = discapacidadPersonaRepository;
        this.necesidadPersonaRepository = necesidadPersonaRepository;
    }

    public List<Persona> listarTodas() {
        return personaRepository.findAll();
    }

    public Persona buscarPorId(Long id) {
        return personaRepository.findById(id).orElse(null);
    }

    public Persona buscarPorCedula(String cedula) {
        return personaRepository.findByCedula(cedula).orElse(null);
    }

    public List<Persona> buscar(String busqueda) {
        if (busqueda == null || busqueda.isBlank()) {
            return listarTodas();
        }
        return personaRepository.buscar(busqueda.trim());
    }

    public boolean existeCedula(String cedula) {
        return personaRepository.existsByCedula(cedula);
    }

    @Transactional
    public Persona guardar(Persona persona) {
        return personaRepository.save(persona);
    }

    @Transactional
    public void eliminar(Long id) {
        personaRepository.deleteById(id);
    }

    // --- Integrantes del Hogar ---

    public List<IntegranteHogar> obtenerIntegrantes(Long personaId) {
        return integranteHogarRepository.findByPersonaId(personaId);
    }

    @Transactional
    public IntegranteHogar guardarIntegrante(IntegranteHogar integrante) {
        return integranteHogarRepository.save(integrante);
    }

    @Transactional
    public void eliminarIntegrante(Long id) {
        integranteHogarRepository.deleteById(id);
    }

    // --- Discapacidades ---

    public List<DiscapacidadPersona> obtenerDiscapacidades(Long personaId) {
        return discapacidadPersonaRepository.findByPersonaId(personaId);
    }

    @Transactional
    public DiscapacidadPersona guardarDiscapacidad(DiscapacidadPersona disc) {
        return discapacidadPersonaRepository.save(disc);
    }

    @Transactional
    public void eliminarDiscapacidad(Long id) {
        discapacidadPersonaRepository.deleteById(id);
    }

    // --- Necesidades ---

    public List<NecesidadPersona> obtenerNecesidades(Long personaId) {
        return necesidadPersonaRepository.findByPersonaId(personaId);
    }

    @Transactional
    public NecesidadPersona guardarNecesidad(NecesidadPersona nec) {
        return necesidadPersonaRepository.save(nec);
    }

    @Transactional
    public void eliminarNecesidad(Long id) {
        necesidadPersonaRepository.deleteById(id);
    }

    // --- Estadísticas ---

    public long contarTotal() {
        return personaRepository.count();
    }

    public List<Object[]> estadisticasPorDepartamento() {
        return personaRepository.estadisticasPorDepartamento();
    }

    public List<Object[]> estadisticasPorDiscapacidad() {
        return personaRepository.estadisticasPorDiscapacidad();
    }

    public List<Object[]> estadisticasPorNecesidad() {
        return personaRepository.estadisticasPorNecesidad();
    }
}
