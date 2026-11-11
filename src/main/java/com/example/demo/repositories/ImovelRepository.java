package com.example.demo.repositories;

import java.math.BigDecimal;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.models.ImovelModel;

public interface ImovelRepository extends JpaRepository<ImovelModel, Integer> {

    /*
     * Busca da vitrine: só imóveis disponíveis, com filtros opcionais
     * (parâmetro null = sem filtro). O "preço" é o valor da finalidade:
     * aluguel usa preco_aluguel, venda usa preco_venda.
     */
    String FILTROS_VITRINE = """
            FROM ImovelModel i
            WHERE LOWER(i.status) = 'disponivel'
              AND (:bairroId IS NULL OR i.bairro.id = :bairroId)
              AND (:finalidade IS NULL OR LOWER(i.finalidade) = :finalidade)
              AND (:precoMin IS NULL OR (CASE WHEN LOWER(i.finalidade) = 'aluguel'
                        THEN i.precoAluguel ELSE i.precoVenda END) >= :precoMin)
              AND (:precoMax IS NULL OR (CASE WHEN LOWER(i.finalidade) = 'aluguel'
                        THEN i.precoAluguel ELSE i.precoVenda END) <= :precoMax)
            """;

    @Query(value = "SELECT i " + FILTROS_VITRINE + """
            ORDER BY
              CASE WHEN :ordem = 'preco_asc' THEN (CASE WHEN LOWER(i.finalidade) = 'aluguel'
                        THEN i.precoAluguel ELSE i.precoVenda END) END ASC,
              CASE WHEN :ordem = 'preco_desc' THEN (CASE WHEN LOWER(i.finalidade) = 'aluguel'
                        THEN i.precoAluguel ELSE i.precoVenda END) END DESC,
              i.destaque DESC,
              i.id DESC
            """,
            countQuery = "SELECT COUNT(i) " + FILTROS_VITRINE)
    Page<ImovelModel> buscarVitrine(
            @Param("bairroId") Integer bairroId,
            @Param("finalidade") String finalidade,
            @Param("precoMin") BigDecimal precoMin,
            @Param("precoMax") BigDecimal precoMax,
            @Param("ordem") String ordem,
            Pageable pageable);
}
