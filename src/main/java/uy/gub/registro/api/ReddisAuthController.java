package uy.gub.registro.api;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import uy.gub.registro.config.JwtUtil;
import uy.gub.registro.model.RoleRequest;
import uy.gub.registro.model.Usuario;
import uy.gub.registro.repository.RoleRequestRepository;
import uy.gub.registro.repository.UsuarioRepository;

import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/api/reddis/auth")
public class ReddisAuthController {

    @Value("${reddis.base-url:http://localhost:5173}")
    private String baseUrl;

    private final UsuarioRepository usuarioRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RoleRequestRepository roleRequestRepo;

    public ReddisAuthController(UsuarioRepository usuarioRepo, PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil, RoleRequestRepository roleRequestRepo) {
        this.usuarioRepo = usuarioRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.roleRequestRepo = roleRequestRepo;
    }

    // ═══════ REGISTER ═══════

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        String nombre = body.get("nombre");

        if (email == null || password == null || nombre == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Faltan campos obligatorios"));
        }

        if (password.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "La contraseña debe tener al menos 6 caracteres"));
        }

        // Check email not taken
        if (usuarioRepo.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ya existe una cuenta con ese email"));
        }

        // Check username not taken (use email as username)
        String username = email.split("@")[0] + "_" + System.currentTimeMillis() % 10000;
        if (usuarioRepo.existsByUsername(username)) {
            username = username + "_" + new Random().nextInt(1000);
        }

        String token = UUID.randomUUID().toString();

        Usuario usuario = Usuario.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(password))
                .nombreCompleto(nombre)
                .rol("USUARIO")
                .activo(true)
                .emailConfirmed(false)
                .confirmationToken(token)
                .build();

        usuarioRepo.save(usuario);

        // Auto-create role request for COLABORADOR so the referente sees them immediately
        RoleRequest roleReq = RoleRequest.builder()
                .usuario(usuario)
                .requestedRole("COLABORADOR")
                .message("Solicitud automática al registrarse")
                .build();
        roleRequestRepo.save(roleReq);

        // Print confirmation link to console (pilot mode)
        String confirmUrl = baseUrl + "/confirmar?token=" + token;
        System.out.println("═══════════════════════════════════════════════════════");
        System.out.println("📧 CONFIRMACIÓN DE EMAIL para: " + email);
        System.out.println("   Link: " + confirmUrl);
        System.out.println("═══════════════════════════════════════════════════════");

        return ResponseEntity.ok(Map.of(
                "message", "Registro exitoso. Revisá tu email para confirmar la cuenta.",
                "confirmUrl", confirmUrl // for dev convenience
        ));
    }

    // ═══════ CONFIRM EMAIL ═══════

    @GetMapping("/confirm")
    public ResponseEntity<?> confirmEmail(@RequestParam String token) {
        Optional<Usuario> opt = usuarioRepo.findAll().stream()
                .filter(u -> token.equals(u.getConfirmationToken()))
                .findFirst();

        if (opt.isEmpty()) {
            // Token already consumed — treat as success (React StrictMode double-call)
            return ResponseEntity.ok(Map.of("message", "Email confirmado exitosamente. Ya podés iniciar sesión."));
        }

        Usuario usuario = opt.get();
        usuario.setEmailConfirmed(true);
        usuario.setConfirmationToken(null);
        usuarioRepo.save(usuario);

        return ResponseEntity.ok(Map.of("message", "Email confirmado exitosamente. Ya podés iniciar sesión."));
    }

    // ═══════ LOGIN ═══════

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email y contraseña son obligatorios"));
        }

        Optional<Usuario> opt = usuarioRepo.findByEmail(email);
        if (opt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Credenciales inválidas"));
        }

        Usuario usuario = opt.get();

        if (!passwordEncoder.matches(password, usuario.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Credenciales inválidas"));
        }

        if (!usuario.getActivo()) {
            return ResponseEntity.status(403).body(Map.of("error", "Cuenta desactivada"));
        }

        if (!usuario.getEmailConfirmed()) {
            return ResponseEntity.status(403).body(Map.of("error", "Debés confirmar tu email antes de iniciar sesión"));
        }

        String jwt = jwtUtil.generateToken(usuario.getUsername(), usuario.getRol(), usuario.getId());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("token", jwt);
        response.put("user", userToMap(usuario));

        return ResponseEntity.ok(response);
    }

    // ═══════ ME (current user) ═══════

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
        }

        String token = authHeader.substring(7);
        if (!jwtUtil.isValid(token)) {
            return ResponseEntity.status(401).body(Map.of("error", "Token inválido"));
        }

        Long userId = jwtUtil.getUserId(token);
        Optional<Usuario> opt = usuarioRepo.findById(userId);
        if (opt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Usuario no encontrado"));
        }

        Usuario u = opt.get();
        Map<String, Object> data = userToMap(u);

        // Include pending role request status
        boolean hasPendingRequest = roleRequestRepo.existsByUsuarioIdAndStatusAndRequestedRole(
                u.getId(), "PENDIENTE", "COLABORADOR");
        data.put("hasPendingRoleRequest", hasPendingRequest);

        return ResponseEntity.ok(data);
    }

    // ═══════ REQUEST ROLE ═══════

    @PostMapping("/role-request")
    public ResponseEntity<?> requestRole(@RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> body) {
        String token = authHeader.substring(7);
        Long userId = jwtUtil.getUserId(token);
        Usuario usuario = usuarioRepo.findById(userId).orElse(null);

        if (usuario == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Usuario no encontrado"));
        }

        // Already has the role?
        if (usuario.hasRole("COLABORADOR")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ya tenés el rol de Colaborador o superior"));
        }

        // Already has pending request?
        if (roleRequestRepo.existsByUsuarioIdAndStatusAndRequestedRole(userId, "PENDIENTE", "COLABORADOR")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ya tenés una solicitud pendiente"));
        }

        RoleRequest req = RoleRequest.builder()
                .usuario(usuario)
                .requestedRole("COLABORADOR")
                .message(body.getOrDefault("message", ""))
                .build();

        roleRequestRepo.save(req);

        System.out.println(
                "📋 SOLICITUD DE ROL: " + usuario.getNombreCompleto() + " (" + usuario.getEmail() + ") → COLABORADOR");

        return ResponseEntity.ok(Map.of("message", "Solicitud enviada. Un referente departamental la revisará."));
    }

    // ═══════ HELPERS ═══════

    private Map<String, Object> userToMap(Usuario u) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", u.getId());
        map.put("username", u.getUsername());
        map.put("email", u.getEmail());
        map.put("nombre", u.getNombreCompleto());
        map.put("rol", u.getRol());
        map.put("emailConfirmed", u.getEmailConfirmed());
        map.put("departamento", u.getDepartamento());
        return map;
    }
}
