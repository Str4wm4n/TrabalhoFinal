package com.example.demo.services;

import java.util.List;
import java.util.Optional;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.dtos.UserDTO;
import com.example.demo.models.UserModel;
import com.example.demo.repositories.UserRepository;

@Service
public class UserService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserModel> getAllUsers() {
        return repository.findAll();
    }

    public UserModel find(Integer id) {
        Optional<UserModel> user = repository.findById(id);
        return user.orElse(null);
    }

    public UserModel insert(UserDTO dto) {
        UserModel user = new UserModel();

        user.setNome(dto.getNome());
        user.setEmail(dto.getEmail());
        user.setTipo(normalizeRole(dto.getTipo()));
        if (dto.getSenha() == null || dto.getSenha().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A senha é obrigatória.");
        }
        user.setSenha(passwordEncoder.encode(dto.getSenha()));

        return repository.save(user);
    }

    public UserModel update(UserDTO dto) {
        UserModel user = find(dto.getId());

        if (user == null) {
            return null;
        }

        user.setNome(dto.getNome());
        user.setEmail(dto.getEmail());
        user.setTipo(normalizeRole(dto.getTipo()));
        if (dto.getSenha() != null && !dto.getSenha().isBlank()) {
            user.setSenha(passwordEncoder.encode(dto.getSenha()));
        }

        return repository.save(user);
    }

    private String normalizeRole(String role) {
        if (role == null || !(role.equalsIgnoreCase("ADMIN") || role.equalsIgnoreCase("USER"))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O tipo deve ser ADMIN ou USER.");
        }
        return role.toUpperCase(Locale.ROOT);
    }

    public void delete(Integer id) {
        repository.deleteById(id);
    }
}
