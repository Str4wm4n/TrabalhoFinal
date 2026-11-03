package com.example.demo.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.models.FotoImovelModel;
import com.example.demo.services.FotoImovelService;

@RestController
@RequestMapping("/fotos")
public class FotoImovelController {

    @Autowired
    private FotoImovelService service;

    @GetMapping
    public ResponseEntity<List<FotoImovelModel>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FotoImovelModel> find(@PathVariable Integer id) {
        FotoImovelModel foto = service.find(id);
        if (foto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(foto);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<FotoImovelModel> salvar(
            @RequestParam("arquivo") MultipartFile arquivo,
            @RequestParam("imovelId") Integer imovelId) {

        try {
            if (arquivo.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            FotoImovelModel fotoImovelModel = service.salvar(arquivo, imovelId);
            return ResponseEntity.status(200).body(fotoImovelModel);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FotoImovelModel> atualizar(
            @PathVariable Integer id,
            @RequestParam(value = "arquivo", required = false) MultipartFile arquivo) {

        try {
            FotoImovelModel foto = service.atualizar(id, arquivo);
            return ResponseEntity.ok(foto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        try {
            service.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/destaque")
    public ResponseEntity<FotoImovelModel> tornarDestaque(@PathVariable Integer id) {
        try {
            FotoImovelModel foto = service.tornarDestaque(id);
            return ResponseEntity.ok(foto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
