package com.example.demo.services;

import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.models.UserModel;
import com.example.demo.repositories.UserRepository;
import com.example.demo.security.JwtService;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public String login(String email, String senha) {
        UserModel user = userRepository.findByEmail(email)
                .filter(account -> account.getSenha() != null
                        && passwordEncoder.matches(senha, account.getSenha()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        if (user.getTipo() == null
                || !(user.getTipo().equalsIgnoreCase("ADMIN") || user.getTipo().equalsIgnoreCase("USER"))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        user.setTipo(user.getTipo().toUpperCase(Locale.ROOT));
        return jwtService.generateToken(user);
    }
}
