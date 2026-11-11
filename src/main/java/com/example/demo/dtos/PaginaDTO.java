package com.example.demo.dtos;

import java.util.List;

import org.springframework.data.domain.Page;

/**
 * Formato estável de uma página de resultados para o front-end.
 * "pagina" começa em 0.
 */
public record PaginaDTO<T>(
        List<T> conteudo,
        int pagina,
        int tamanho,
        long totalElementos,
        int totalPaginas) {

    public static <T> PaginaDTO<T> de(Page<T> page) {
        return new PaginaDTO<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages());
    }
}
