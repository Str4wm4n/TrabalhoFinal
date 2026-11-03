package com.example.demo.security;

import java.io.Console;
import java.util.Arrays;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public final class PasswordHashGenerator {

    private PasswordHashGenerator() {
    }

    public static void main(String[] args) {
        Console console = System.console();
        if (console == null) {
            throw new IllegalStateException("Execute esta classe em um terminal para informar a senha com segurança.");
        }

        char[] password = console.readPassword("Senha do ADMIN: ");
        if (password == null || password.length == 0) {
            throw new IllegalArgumentException("A senha não pode ser vazia.");
        }

        try {
            System.out.println(new BCryptPasswordEncoder().encode(new String(password)));
        } finally {
            Arrays.fill(password, '\0');
        }
    }
}
