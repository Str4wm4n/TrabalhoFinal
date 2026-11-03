package com.example.demo.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.models.FotoImovelModel;
import com.example.demo.models.ImovelModel;
import com.example.demo.repositories.FotoImovelRepository;
import com.example.demo.repositories.ImovelRepository;

@Service
public class FotoImovelService {

    @Autowired
    private FotoImovelRepository fotoImovelRepository;

    @Autowired
    private ImovelRepository imovelRepository;

    @Value("${app.upload-dir}")
    private String uploadDir = "/uploads";

    public List<FotoImovelModel> getAll() {
        return fotoImovelRepository.findAll();
    }

    public FotoImovelModel find(Integer id) {
        return fotoImovelRepository.findById(id).orElse(null);
    }

    public FotoImovelModel salvar(MultipartFile arquivo, Integer imovelId) {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new RuntimeException("Arquivo obrigatório.");
        }

        ImovelModel imovel = imovelRepository.findById(imovelId)
                .orElseThrow(() -> new RuntimeException("Imóvel não encontrado."));

        try {
            Path pasta = Paths.get(uploadDir, String.valueOf(imovelId));
            Files.createDirectories(pasta);

            String nomeOriginal = StringUtils.cleanPath(arquivo.getOriginalFilename());
            String nomeFinal = UUID.randomUUID() + "_" + nomeOriginal;
            Path destino = pasta.resolve(nomeFinal);

            arquivo.transferTo(destino);

            FotoImovelModel model = new FotoImovelModel();
            model.setCaminho(destino.toString());
            model.setNomeArquivo(nomeFinal);
            model.setImovel(imovel);
            model.setCapa(false);
            model.setOrdem(0);

            return fotoImovelRepository.save(model);

        } catch (IOException e) {
            throw new RuntimeException("Erro ao salvar a foto do imóvel.", e);
        }
    }

    public FotoImovelModel atualizar(Integer id, MultipartFile arquivo) {
        FotoImovelModel foto = fotoImovelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Foto não encontrada."));

        if (arquivo != null && !arquivo.isEmpty()) {
            try {
                if (foto.getCaminho() != null) {
                    Files.deleteIfExists(Paths.get(foto.getCaminho()));
                }

                Path pasta = Paths.get(uploadDir, String.valueOf(foto.getImovel().getId()));
                Files.createDirectories(pasta);

                String nomeOriginal = StringUtils.cleanPath(arquivo.getOriginalFilename());
                String nomeFinal = UUID.randomUUID() + "_" + nomeOriginal;
                Path destino = pasta.resolve(nomeFinal);

                arquivo.transferTo(destino);
                foto.setCaminho(destino.toString());
                foto.setNomeArquivo(nomeFinal);
            } catch (IOException e) {
                throw new RuntimeException("Erro ao atualizar a foto do imóvel.", e);
            }
        }

        return fotoImovelRepository.save(foto);
    }

    public void deletar(Integer id) {
        FotoImovelModel foto = fotoImovelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Foto não encontrada."));

        if (foto.getCaminho() != null) {
            try {
                Files.deleteIfExists(Paths.get(foto.getCaminho()));
            } catch (IOException e) {
                throw new RuntimeException("Erro ao remover o arquivo da foto.", e);
            }
        }

        fotoImovelRepository.delete(foto);
    }

    public FotoImovelModel tornarDestaque(Integer id) {
        FotoImovelModel foto = fotoImovelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Foto não encontrada."));

        Integer imovelId = foto.getImovel() != null ? foto.getImovel().getId() : null;

        if (imovelId == null) {
            throw new RuntimeException("A foto não está vinculada a um imóvel.");
        }

        List<FotoImovelModel> fotosDoImovel = fotoImovelRepository.findAll().stream()
                .filter(f -> f.getImovel() != null && f.getImovel().getId().equals(imovelId))
                .toList();

        for (FotoImovelModel item : fotosDoImovel) {
            item.setCapa(false);
        }

        foto.setCapa(true);
        foto.setOrdem(1);

        fotoImovelRepository.saveAll(fotosDoImovel);
        return fotoImovelRepository.save(foto);
    }
}
