package com.example.demo.dtos;

/**
 * Resposta do login: o token JWT e o perfil do usuário (ADMIN ou USER),
 * usado pelo front-end para decidir para qual área redirecionar.
 */
public record LoginResponseDTO(String token, String tipo) {
}
