package com.example.demo.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dtos.UserDTO;
import com.example.demo.models.UserModel;

@RestController
public class PerfilController {

    /**
     * Dados do usuário logado (qualquer perfil). O usuário vem do token:
     * o JwtAuthenticationFilter já o carregou do banco.
     */
    @GetMapping("/me")
    public ResponseEntity<UserDTO> me(@AuthenticationPrincipal UserModel usuario) {
        return ResponseEntity.ok(new UserDTO(usuario));
    }
}
