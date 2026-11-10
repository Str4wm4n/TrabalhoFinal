package com.example.demo;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + user.getEmail() + "\",\"senha\":\"senha123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.tipo").value("Bearer"));
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
