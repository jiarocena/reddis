package uy.gub.registro.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import uy.gub.registro.model.Usuario;
import uy.gub.registro.repository.UsuarioRepository;

import java.io.IOException;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepo;

    public JwtFilter(JwtUtil jwtUtil, UsuarioRepository usuarioRepo) {
        this.jwtUtil = jwtUtil;
        this.usuarioRepo = usuarioRepo;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            if (jwtUtil.isValid(token)) {
                String username = jwtUtil.getUsername(token);
                Long userId = jwtUtil.getUserId(token);

                // Fetch the actual current role from database to support real-time role changes.
                // Fall back to token's role if database connection fails/times out.
                String role;
                try {
                    role = usuarioRepo.findById(userId)
                            .map(Usuario::getRol)
                            .orElseGet(() -> jwtUtil.getRole(token));
                } catch (Exception e) {
                    logger.warn("Error al consultar el rol del usuario en la BD, se usa el rol del token JWT: " + e.getMessage());
                    role = jwtUtil.getRole(token);
                }

                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        username, null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + role)));
                auth.setDetails(userId); // Store userId for easy access
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        // Don't apply JWT filter to non-API paths (Thymeleaf routes)
        return !path.startsWith("/api/reddis/");
    }
}
