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
import uy.gub.registro.service.EmailService;

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
    private final EmailService emailService;

    public ReddisAuthController(UsuarioRepository usuarioRepo, PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil, RoleRequestRepository roleRequestRepo, EmailService emailService) {
        this.usuarioRepo = usuarioRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.roleRequestRepo = roleRequestRepo;
        this.emailService = emailService;
    }

    // ═══════ REGISTER ═══════

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        // ── Honeypot anti-bot check
        String honeypot = body.get("website");
        if (honeypot != null && !honeypot.isBlank()) {
            System.out.println("🤖 BOT DETECTADO en registro — honeypot: " + honeypot);
            // Return fake success
            return ResponseEntity.ok(Map.of("message", "Registro exitoso."));
        }

        String email = body.get("email");
        String password = body.get("password");
        String nombre = body.get("nombre");
        String departamento = body.get("departamento");

        if (email == null || password == null || nombre == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Faltan campos obligatorios"));
        }

        if (password.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "La contraseña debe tener al menos 6 caracteres"));
        }

        if (departamento == null || departamento.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Debés seleccionar un departamento"));
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

        Usuario usuario = Usuario.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(password))
                .nombreCompleto(nombre)
                .rol("USUARIO")
                .activo(true)
                .emailConfirmed(true) // Auto-confirm — no email verification needed
                .departamento(departamento.trim())
                .build();

        usuarioRepo.save(usuario);

        // Auto-login: generate JWT so user can start immediately
        String jwt = jwtUtil.generateToken(usuario.getUsername(), usuario.getRol(), usuario.getId());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "¡Registro exitoso! Ya podés usar la plataforma.");
        response.put("token", jwt);
        response.put("user", userToMap(usuario));

        System.out.println("✅ NUEVO USUARIO registrado: " + nombre + " (" + email + ") — Depto: " + departamento);

        return ResponseEntity.ok(response);
    }

    // ═══════ MAIL DIAGNOSTIC (temporary) ═══════

    @GetMapping("/mail-test")
    public ResponseEntity<?> mailTest(@RequestParam(required = false) String to) {
        Map<String, Object> info = new LinkedHashMap<>();
        try {
            java.lang.reflect.Field enabledField = emailService.getClass().getDeclaredField("mailEnabled");
            enabledField.setAccessible(true);
            info.put("mailEnabled", enabledField.get(emailService));

            java.lang.reflect.Field fromField = emailService.getClass().getDeclaredField("fromEmail");
            fromField.setAccessible(true);
            String from = (String) fromField.get(emailService);
            info.put("fromEmail", from != null && from.length() > 3 ? from.substring(0, 3) + "***" : "(empty)");
        } catch (Exception e) {
            info.put("configError", e.getMessage());
        }

        if (to != null && !to.isBlank()) {
            try {
                emailService.sendTestEmail(to);
                info.put("testSend", "Intentando enviar a " + to);
            } catch (Exception e) {
                info.put("sendError", e.getMessage());
            }
        }

        return ResponseEntity.ok(info);
    }

    // ═══════ CONFIRM EMAIL ═══════

    @GetMapping("/confirm")
    public ResponseEntity<?> confirmEmail(@RequestParam String token) {
        Optional<Usuario> opt = usuarioRepo.findByConfirmationToken(token);

        if (opt.isEmpty()) {
            // Token already consumed or invalid — treat as success (React StrictMode double-call)
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
        
        Map<String, Object> userMap = userToMap(usuario);
        List<RoleRequest> requests = roleRequestRepo.findByUsuarioIdOrderByCreatedAtDesc(usuario.getId());
        List<String> pendingMessages = requests.stream()
                .filter(r -> "PENDIENTE".equals(r.getStatus()) && "COLABORADOR".equals(r.getRequestedRole()))
                .map(RoleRequest::getMessage)
                .filter(Objects::nonNull)
                .toList();
        userMap.put("hasPendingRoleRequest", !pendingMessages.isEmpty());
        userMap.put("pendingRoleRequestMessages", pendingMessages);
        userMap.put("pendingRoleRequestMessage", pendingMessages.isEmpty() ? null : pendingMessages.get(0));
        response.put("user", userMap);

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

        // Include all pending role requests messages
        List<RoleRequest> requests = roleRequestRepo.findByUsuarioIdOrderByCreatedAtDesc(u.getId());
        List<String> pendingMessages = requests.stream()
                .filter(r -> "PENDIENTE".equals(r.getStatus()) && "COLABORADOR".equals(r.getRequestedRole()))
                .map(RoleRequest::getMessage)
                .filter(Objects::nonNull)
                .toList();
        data.put("hasPendingRoleRequest", !pendingMessages.isEmpty());
        data.put("pendingRoleRequestMessages", pendingMessages);
        data.put("pendingRoleRequestMessage", pendingMessages.isEmpty() ? null : pendingMessages.get(0));

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

        String message = body.getOrDefault("message", "");
        // Check if there is already a pending request for this exact project for this user
        List<RoleRequest> requests = roleRequestRepo.findByUsuarioIdOrderByCreatedAtDesc(userId);
        boolean alreadyPendingThisProject = false;
        
        String projTag = "";
        if (message.contains("[PROYECTO_ID:")) {
            int start = message.indexOf("[PROYECTO_ID:");
            int end = message.indexOf("]", start);
            if (end > start) {
                projTag = message.substring(start, end + 1); // e.g. "[PROYECTO_ID:2]"
            }
        }
        
        if (!projTag.isEmpty()) {
            final String targetTag = projTag;
            alreadyPendingThisProject = requests.stream()
                .filter(r -> "PENDIENTE".equals(r.getStatus()))
                .anyMatch(r -> r.getMessage() != null && r.getMessage().contains(targetTag));
        }
        
        if (alreadyPendingThisProject) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ya tenés una postulación pendiente para este proyecto"));
        }

        RoleRequest req = RoleRequest.builder()
                .usuario(usuario)
                .requestedRole("COLABORADOR")
                .message(message)
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
