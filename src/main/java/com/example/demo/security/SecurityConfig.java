package com.example.demo.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

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
                        .requestMatchers(HttpMethod.POST, "/auth/login").permitAll()
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

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
