package com.example.demo.security;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    private static final String[] CATALOGO = {
            "/imoveis", "/imoveis/**",
            "/bairros", "/bairros/**",
            "/tipos-imoveis", "/tipos-imoveis/**",
            "/fotos", "/fotos/**"
    };

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {
        return http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, exception) -> {
                            response.setStatus(401);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"status\":401,\"error\":\"Unauthorized\"}");
                        })
                        .accessDeniedHandler((request, response, exception) -> {
                            response.setStatus(403);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"status\":403,\"error\":\"Forbidden\"}");
                        }))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.POST, "/public/login").permitAll()
                        // /error só formata a resposta de um erro que já aconteceu;
                        // bloqueá-la transformava qualquer 400/404/409 em 401
                        .requestMatchers("/error").permitAll()
                        // Vitrine pública: qualquer visitante pode consultar o catálogo
                        .requestMatchers(HttpMethod.GET, CATALOGO).permitAll()
                        // Alterar status (ex.: vendido, alugado) é tarefa da imobiliária
                        .requestMatchers(HttpMethod.PATCH, "/imoveis/*/status").hasRole("ADMIN")
                        // Qualquer escrita no catálogo é exclusiva do ADMIN
                        .requestMatchers(HttpMethod.POST, CATALOGO).hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, CATALOGO).hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, CATALOGO).hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, CATALOGO).hasRole("ADMIN")
                        .requestMatchers("/users", "/users/**").hasRole("ADMIN")
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    /**
     * CORS: o front-end (outra origem, ex.: http://localhost:3000) chama a API
     * direto do navegador. Só as origens listadas em app.cors.allowed-origins
     * podem ler as respostas.
     */
    @Bean
    CorsConfigurationSource corsConfigurationSource(
            @Value("${app.cors.allowed-origins}") List<String> allowedOrigins) {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(allowedOrigins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setExposedHeaders(List.of("Location"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
