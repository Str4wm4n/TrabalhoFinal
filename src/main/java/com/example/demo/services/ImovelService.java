	package com.example.demo.services;
	
	import java.math.BigDecimal;
	import java.util.List;
	import java.util.Locale;
	import java.util.Optional;
	import java.util.Set;

	import org.springframework.data.domain.Page;
	import org.springframework.data.domain.PageRequest;
	import org.springframework.http.HttpStatus;
	import org.springframework.stereotype.Service;
	import org.springframework.web.server.ResponseStatusException;
	
	import com.example.demo.models.ImovelModel;
	import com.example.demo.repositories.ImovelRepository;
	
	@Service
	public class ImovelService {
	    private final ImovelRepository repository;
	
	    public ImovelService(ImovelRepository repository) {
	        this.repository = repository;
	    }
	
	    public List<ImovelModel> getAll() {
	        List<ImovelModel> list = repository.findAll();
	        return list;
	    }
	
	    private static final Set<String> FINALIDADES = Set.of("venda", "aluguel");
	    private static final Set<String> ORDENS = Set.of("preco_asc", "preco_desc");
	    private static final int TAMANHO_MAXIMO = 50;

	    public Page<ImovelModel> buscarVitrine(Integer bairroId, String finalidade,
	            BigDecimal precoMin, BigDecimal precoMax, String ordem, int pagina, int tamanho) {
	        String finalidadeNormalizada = vazioParaNull(finalidade);
	        if (finalidadeNormalizada != null && !FINALIDADES.contains(finalidadeNormalizada)) {
	            throw badRequest("A finalidade deve ser 'venda' ou 'aluguel'.");
	        }
	        String ordemNormalizada = vazioParaNull(ordem);
	        if (ordemNormalizada != null && !ORDENS.contains(ordemNormalizada)) {
	            throw badRequest("A ordem deve ser 'preco_asc' ou 'preco_desc'.");
	        }
	        if (precoMin != null && precoMax != null && precoMin.compareTo(precoMax) > 0) {
	            throw badRequest("O preço mínimo não pode ser maior que o preço máximo.");
	        }
	        if (pagina < 0 || tamanho < 1 || tamanho > TAMANHO_MAXIMO) {
	            throw badRequest("Página deve ser >= 0 e tamanho entre 1 e " + TAMANHO_MAXIMO + ".");
	        }
	        return repository.buscarVitrine(bairroId, finalidadeNormalizada, precoMin, precoMax,
	                ordemNormalizada == null ? "" : ordemNormalizada, PageRequest.of(pagina, tamanho));
	    }

	    private static String vazioParaNull(String valor) {
	        return valor == null || valor.isBlank() ? null : valor.trim().toLowerCase(Locale.ROOT);
	    }

	    private static ResponseStatusException badRequest(String mensagem) {
	        return new ResponseStatusException(HttpStatus.BAD_REQUEST, mensagem);
	    }

	    public ImovelModel find(Integer id) {
	        Optional<ImovelModel> model = repository.findById(id);
	        return model.orElse(null);
	    }
	
	    public ImovelModel insert(ImovelModel model) {
	        return repository.save(model);
	    }
	 
	    public ImovelModel update(ImovelModel model) {
	        try {
	            if(find(model.getId())!=null){
	                return repository.save(model);
	            }
	            return null;
	        } catch (Exception e) {
	            return null;
	        }
	
	    }

	    public ImovelModel updateStatus(Integer id, String status) {
	        ImovelModel model = find(id);
	        if (model == null) {
	            return null;
	        }
	        model.setStatus(status);
	        return repository.save(model);
	    }
	 
	    public void delete(Integer id) {
	        repository.deleteById(id);
	    }
	}
	