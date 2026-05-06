package uy.gub.registro.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf
                        .ignoringRequestMatchers("/api/reddis/**"))

                .authorizeHttpRequests(auth -> auth
                        // --- React SPA: static assets ---
                        .requestMatchers("/", "/index.html", "/vite.svg").permitAll()
                        .requestMatchers("/assets/**").permitAll()

                        // --- React SPA: client-side routes ---
                        .requestMatchers("/mapa", "/reportar", "/acerca").permitAll()
                        .requestMatchers("/barrera/**", "/proyecto/**").permitAll()
                        .requestMatchers("/login", "/registro", "/confirmar").permitAll()
                        .requestMatchers("/perfil", "/pendientes", "/admin").permitAll()

                        // --- Static / Thymeleaf ---
                        .requestMatchers("/css/**", "/js/**", "/images/**", "/webjars/**").permitAll()

                        // --- REDDIS Auth (public) ---
                        .requestMatchers("/api/reddis/auth/**").permitAll()

                        // --- REDDIS Public reads ---
                        .requestMatchers(HttpMethod.GET, "/api/reddis/barreras/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/reddis/proyectos/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/reddis/stats").permitAll()

                        // --- REDDIS Admin (REFERENTE or ADMIN) ---
                        .requestMatchers("/api/reddis/admin/**").hasAnyRole("REFERENTE", "ADMIN")

                        // --- REDDIS Write operations ---
                        .requestMatchers(HttpMethod.POST, "/api/reddis/barreras").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/reddis/proyectos")
                        .hasAnyRole("COLABORADOR", "REFERENTE", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/reddis/proyectos/*/colaboradores")
                        .hasAnyRole("COLABORADOR", "REFERENTE", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/reddis/proyectos/*/timeline")
                        .hasAnyRole("COLABORADOR", "REFERENTE", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/reddis/proyectos/**")
                        .hasAnyRole("COLABORADOR", "REFERENTE", "ADMIN")
                        .requestMatchers("/api/reddis/role-requests").authenticated()

                        // --- Existing Thymeleaf app ---
                        .requestMatchers("/usuarios/**").hasRole("ADMIN")
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll())

                // Add JWT filter for REDDIS API
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)

                // Form login for Thymeleaf (doesn't affect API)
                .formLogin(form -> form
                        .loginPage("/login")
                        .defaultSuccessUrl("/", true)
                        .permitAll())
                .logout(logout -> logout
                        .logoutSuccessUrl("/login?logout")
                        .permitAll());

        return http.build();
    }
}
