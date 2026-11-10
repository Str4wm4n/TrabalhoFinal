-- Dados iniciais da imobiliária (ambiente de desenvolvimento/aula)
--
-- Pré-requisito: rodar o backend uma vez para o Hibernate criar as tabelas.
-- Como executar:
--   phpMyAdmin: selecione o banco "imobiliaria" > aba SQL > cole este arquivo > Executar
--   Terminal:   C:\xampp\mysql\bin\mysql.exe -u root imobiliaria < database\dados-iniciais.sql
--
-- Os IDs são fixos e o INSERT IGNORE pula linhas que já existem,
-- então o script pode ser rodado mais de uma vez sem duplicar dados.
--
-- Usuários de teste (senhas apenas para demonstração):
--   admin@imobiliaria.com   / admin123    -> tipo ADMIN
--   cliente@imobiliaria.com / cliente123  -> tipo USER

SET NAMES utf8mb4;

-- Usuários: a senha é o hash BCrypt, nunca o texto puro
INSERT IGNORE INTO usuarios (id, nome, email, senha, tipo) VALUES
  (1, 'Administrador', 'admin@imobiliaria.com',
      '$2a$10$M7rn8mktm0qPgMPEYeAgxuFlin/j9pp0149XGfrK96GDcd5Am6GXa', 'ADMIN'),
  (2, 'Cliente Teste', 'cliente@imobiliaria.com',
      '$2a$10$attlnYLjDZDmHNofNGAmgetd/weUWht5529dia0K5fmUeKAwy4Lu.', 'USER');

INSERT IGNORE INTO bairros (id, nome, cidade, estado, cep_inicial) VALUES
  (1, 'Centro',           'Santa Maria', 'RS', '97010-000'),
  (2, 'Camobi',           'Santa Maria', 'RS', '97105-000'),
  (3, 'Nossa Senhora de Lourdes', 'Santa Maria', 'RS', '97050-000'),
  (4, 'Patronato',        'Santa Maria', 'RS', '97020-000');

INSERT IGNORE INTO tipos_imoveis (id, nome, descricao, created_at, updated_at) VALUES
  (1, 'Casa',        'Casa térrea ou sobrado com pátio',        NOW(), NOW()),
  (2, 'Apartamento', 'Unidade em edifício residencial',         NOW(), NOW()),
  (3, 'Terreno',     'Lote sem construção',                     NOW(), NOW()),
  (4, 'Sala comercial', 'Espaço para escritório ou comércio',   NOW(), NOW());

-- finalidade: 'venda' ou 'aluguel' | status: 'disponivel'
INSERT IGNORE INTO imoveis
  (id, titulo, descricao, preco_venda, preco_aluguel, finalidade, status,
   dormitorios, banheiros, garagem, area_total, area_construida,
   endereco, numero, complemento, cep, caracteristicas, destaque,
   tipo_imovel_id, bairro_id, created_at, updated_at)
VALUES
  (1, 'Casa com pátio amplo no Camobi',
      'Casa térrea, ensolarada, perto da universidade.',
      420000.00, NULL, 'venda', 'disponivel',
      3, 2, 2, 360.00, 160.00,
      'Rua das Acácias', '120', NULL, '97105-120',
      'Churrasqueira, pátio, cozinha planejada', TRUE, 1, 2, NOW(), NOW()),
  (2, 'Apartamento central com sacada',
      'Apartamento reformado a duas quadras da praça.',
      NULL, 1800.00, 'aluguel', 'disponivel',
      2, 1, 1, 78.00, 78.00,
      'Rua do Acampamento', '455', 'Apto 302', '97010-455',
      'Sacada, elevador, portaria', TRUE, 2, 1, NOW(), NOW()),
  (3, 'Kitnet mobiliada para estudantes',
      'Ideal para quem estuda no campus.',
      NULL, 950.00, 'aluguel', 'disponivel',
      1, 1, 0, 32.00, 32.00,
      'Avenida Roraima', '1000', 'Bloco B', '97105-900',
      'Mobiliada, internet inclusa', FALSE, 2, 2, NOW(), NOW()),
  (4, 'Sobrado em Nossa Senhora de Lourdes',
      'Sobrado com suíte e escritório.',
      650000.00, NULL, 'venda', 'disponivel',
      4, 3, 2, 300.00, 220.00,
      'Rua Appel', '88', NULL, '97050-088',
      'Suíte, escritório, lareira', FALSE, 1, 3, NOW(), NOW()),
  (5, 'Terreno plano no Patronato',
      'Terreno pronto para construir.',
      180000.00, NULL, 'venda', 'disponivel',
      NULL, NULL, NULL, 450.00, NULL,
      'Rua Silva Jardim', 'S/N', NULL, '97020-300',
      'Plano, murado', FALSE, 3, 4, NOW(), NOW()),
  (6, 'Sala comercial no Centro',
      'Sala com banheiro privativo em prédio comercial.',
      NULL, 1300.00, 'aluguel', 'disponivel',
      NULL, 1, 0, 45.00, 45.00,
      'Rua Dr. Bozano', '600', 'Sala 504', '97015-001',
      'Ar-condicionado, recepção no prédio', FALSE, 4, 1, NOW(), NOW());
