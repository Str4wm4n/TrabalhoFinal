package com.example.demo.controllers;

import java.math.BigDecimal;
import java.net.URI;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.example.demo.models.ImovelModel;
import com.example.demo.dtos.PaginaDTO;
import com.example.demo.dtos.StatusImovelDTO;
import com.example.demo.services.ImovelService;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/imoveis")
public class ImovelController {


    @Autowired
    private ImovelService service;

     @GetMapping()
    public ResponseEntity<List<ImovelModel>> getAll() {
        List<ImovelModel> list = service.getAll();
        return ResponseEntity.status(HttpStatus.OK).body(list);
    }

    /**
     * Vitrine pública: imóveis disponíveis, com filtros opcionais,
     * ordenação por preço e paginação (pagina começa em 0).
     */
    @GetMapping("/busca")
    public ResponseEntity<PaginaDTO<ImovelModel>> buscar(
            @RequestParam(required = false) Integer bairroId,
            @RequestParam(required = false) String finalidade,
            @RequestParam(required = false) BigDecimal precoMin,
            @RequestParam(required = false) BigDecimal precoMax,
            @RequestParam(required = false) String ordem,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "6") int tamanho) {
        return ResponseEntity.ok(PaginaDTO.de(
                service.buscarVitrine(bairroId, finalidade, precoMin, precoMax, ordem, pagina, tamanho)));
    }

    @GetMapping(value = "/{id}")
        public ResponseEntity<ImovelModel> find(@PathVariable Integer id) {
        ImovelModel model = service.find(id);
        if(model!=null){
            return ResponseEntity.status(HttpStatus.OK).body(model);
        }
        else{
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping
    public ResponseEntity<Void> insert(@RequestBody ImovelModel model) {
        model = service.insert(model);
        // return new ResponseEntity(model, HttpStatus.CREATED);
        URI uri =
        ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(model.getId()).toUri();
        return ResponseEntity.created(uri).build();
        }

    @PutMapping(value = "/{id}")
    public ResponseEntity<Void> update(@RequestBody ImovelModel model, @PathVariable Integer id) {
        try {
             model.setId(id);
             model = service.update(model);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
       
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ImovelModel> updateStatus(
            @PathVariable Integer id,
            @RequestBody StatusImovelDTO request) {
        if (request.status() == null || request.status().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        ImovelModel updated = service.updateStatus(id, request.status());
        return updated == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(updated);
    }
}