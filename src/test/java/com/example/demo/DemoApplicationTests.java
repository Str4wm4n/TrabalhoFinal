package com.example.demo;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.demo.models.ImovelModel;
import com.example.demo.models.UserModel;
import com.example.demo.models.BairroModel;
import com.example.demo.repositories.BairroRepository;
import com.example.demo.repositories.ImovelRepository;
import com.example.demo.repositories.UserRepository;
import com.example.demo.security.JwtService;

@SpringBootTest
@AutoConfigureMockMvc
class DemoApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ImovelRepository imovelRepository;

    @Autowired
    private BairroRepository bairroRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @MockitoBean
    private JavaMailSender mailSender;

    @Test
    void publicPropertyListDoesNotRequireToken() throws Exception {
        mockMvc.perform(get("/imoveis"))
                .andExpect(status().isOk());
    }

    @Test
    void protectedUserManagementReturns401WithoutToken() throws Exception {
        mockMvc.perform(get("/users"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void invalidTokenReturns401() throws Exception {
        mockMvc.perform(get("/users")
                        .header("Authorization", "Bearer invalid"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void userCannotCreateProperty() throws Exception {
        String token = tokenFor("USER");

        mockMvc.perform(post("/imoveis")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"titulo\":\"Imóvel teste\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminCanCreateProperty() throws Exception {
        String token = tokenFor("ADMIN");

        mockMvc.perform(post("/imoveis")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"titulo\":\"Imóvel teste\"}"))
                .andExpect(status().isCreated());
    }

    @Test
    void userCannotChangePropertyStatus() throws Exception {
        ImovelModel property = savedProperty();

        mockMvc.perform(patch("/imoveis/{id}/status", property.getId())
                        .header("Authorization", "Bearer " + tokenFor("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"DISPONIVEL\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminCanChangePropertyStatus() throws Exception {
        ImovelModel property = savedProperty();

        mockMvc.perform(patch("/imoveis/{id}/status", property.getId())
                        .header("Authorization", "Bearer " + tokenFor("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"DISPONIVEL\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DISPONIVEL"));
    }

    @Test
    void catalogReadsArePublic() throws Exception {
        mockMvc.perform(get("/bairros")).andExpect(status().isOk());
        mockMvc.perform(get("/tipos-imoveis")).andExpect(status().isOk());
        mockMvc.perform(get("/fotos")).andExpect(status().isOk());
    }

    @Test
    void userCannotCreateBairro() throws Exception {
        mockMvc.perform(post("/bairros")
                        .header("Authorization", "Bearer " + tokenFor("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Bairro teste\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void duplicateUserEmailReturns409() throws Exception {
        String body = "{\"nome\":\"Cliente\",\"email\":\"" + UUID.randomUUID()
                + "@example.test\",\"senha\":\"senha123\",\"tipo\":\"USER\"}";
        String token = tokenFor("ADMIN");

        mockMvc.perform(post("/users")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/users")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isConflict())
                .andExpect(status().reason("Já existe um usuário com este e-mail."));
    }

    @Test
    void corsAllowsFrontendOriginOnly() throws Exception {
        mockMvc.perform(options("/imoveis")
                        .header("Origin", "http://localhost:3000")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "authorization,content-type"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:3000"));

        mockMvc.perform(options("/imoveis")
                        .header("Origin", "http://site-desconhecido.com")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isForbidden());
    }

    @Test
    void vitrineSearchFiltersSortsAndPaginates() throws Exception {
        BairroModel bairro = bairroRepository.save(new BairroModel(null, "Bairro busca", "Cidade", "RS", null));
        savedProperty(bairro, "aluguel", "disponivel", null, "1500");
        savedProperty(bairro, "aluguel", "disponivel", null, "900");
        savedProperty(bairro, "aluguel", "disponivel", null, "3000");
        savedProperty(bairro, "aluguel", "alugado", null, "1000");      // não disponível
        savedProperty(bairro, "venda", "disponivel", "200000", null);   // outra finalidade

        mockMvc.perform(get("/imoveis/busca")
                        .param("bairroId", bairro.getId().toString())
                        .param("finalidade", "aluguel")
                        .param("precoMax", "2000")
                        .param("ordem", "preco_desc")
                        .param("tamanho", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElementos").value(2))
                .andExpect(jsonPath("$.totalPaginas").value(2))
                .andExpect(jsonPath("$.conteudo[0].precoAluguel").value(1500));

        mockMvc.perform(get("/imoveis/busca")
                        .param("bairroId", bairro.getId().toString())
                        .param("ordem", "preco_asc"))
                .andExpect(jsonPath("$.totalElementos").value(4))
                .andExpect(jsonPath("$.conteudo[0].precoAluguel").value(900))
                .andExpect(jsonPath("$.conteudo[3].precoVenda").value(200000));
    }

    @Test
    void vitrineSearchRejectsInvalidFilters() throws Exception {
        mockMvc.perform(get("/imoveis/busca").param("finalidade", "permuta"))
                .andExpect(status().isBadRequest());
        mockMvc.perform(get("/imoveis/busca").param("precoMin", "500").param("precoMax", "100"))
                .andExpect(status().isBadRequest());
    }

    private void savedProperty(BairroModel bairro, String finalidade, String status,
            String precoVenda, String precoAluguel) {
        ImovelModel property = new ImovelModel();
        property.setTitulo("Imóvel " + finalidade);
        property.setFinalidade(finalidade);
        property.setStatus(status);
        property.setBairro(bairro);
        property.setPrecoVenda(precoVenda == null ? null : new java.math.BigDecimal(precoVenda));
        property.setPrecoAluguel(precoAluguel == null ? null : new java.math.BigDecimal(precoAluguel));
        imovelRepository.save(property);
    }

    private ImovelModel savedProperty() {
        ImovelModel property = new ImovelModel();
        property.setTitulo("Imóvel teste");
        property.setStatus("RASCUNHO");
        return imovelRepository.save(property);
    }

    @Test
    void loginReturnsBearerToken() throws Exception {
        UserModel user = new UserModel();
        user.setNome("Usuário de teste");
        user.setEmail(UUID.randomUUID() + "@example.test");
        user.setSenha(passwordEncoder.encode("senha123"));
        user.setTipo("USER");
        userRepository.save(user);

        mockMvc.perform(post("/public/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + user.getEmail() + "\",\"senha\":\"senha123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.tipo").value("USER"));
    }

    private String tokenFor(String role) {
        UserModel user = new UserModel();
        user.setNome("Usuário de teste");
        user.setEmail(UUID.randomUUID() + "@example.test");
        user.setSenha(passwordEncoder.encode("senha123"));
        user.setTipo(role);
        userRepository.save(user);
        return jwtService.generateToken(user);
    }
}
