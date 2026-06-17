-- TE QUERO BEM - INSERIR OU ATUALIZAR LOJAS DIGITAIS
-- Cole este arquivo no SQL Editor do Supabase e clique em Run.
-- Ele nao duplica DB ENEM nem Gabarito Max se voce rodar mais de uma vez.

update public.lojistas
set
  responsavel = 'Carlos',
  email = 'cincoregioes@gmail.com',
  cidade = 'Brasil',
  estado = 'BR',
  whatsapp = '85997120397',
  categoria = 'Presentes digitais e educacao',
  descricao = 'O DB ENEM oferece presentes digitais educativos para estudantes, com questoes, simulados, mensagens de incentivo e materiais de preparacao para o ENEM.',
  produtos = 'Kit de questoes ENEM, simulado personalizado, plano de estudos, cartao digital de incentivo e mensagem personalizada para estudante.',
  faixa_preco = 'A combinar',
  horario = 'Atendimento online',
  entrega = 'Entrega digital pelo WhatsApp ou link',
  plano = 'Regional fundador',
  status = 'aprovado',
  plano_status = 'isento',
  destaque = true,
  capa_url = 'assets/db-enem-digital.png',
  foto_1_url = 'assets/gabarito-max-digital.png'
where lower(nome_loja) = 'db enem';

insert into public.lojistas (
  nome_loja, responsavel, email, cidade, estado, whatsapp, instagram, categoria,
  descricao, produtos, faixa_preco, horario, entrega, plano, status, plano_status,
  destaque, capa_url, foto_1_url
)
select
  'DB ENEM',
  'Carlos',
  'cincoregioes@gmail.com',
  'Brasil',
  'BR',
  '85997120397',
  '',
  'Presentes digitais e educacao',
  'O DB ENEM oferece presentes digitais educativos para estudantes, com questoes, simulados, mensagens de incentivo e materiais de preparacao para o ENEM.',
  'Kit de questoes ENEM, simulado personalizado, plano de estudos, cartao digital de incentivo e mensagem personalizada para estudante.',
  'A combinar',
  'Atendimento online',
  'Entrega digital pelo WhatsApp ou link',
  'Regional fundador',
  'aprovado',
  'isento',
  true,
  'assets/db-enem-digital.png',
  'assets/gabarito-max-digital.png'
where not exists (
  select 1 from public.lojistas where lower(nome_loja) = 'db enem'
);

update public.lojistas
set
  responsavel = 'Carlos',
  email = 'cincoregioes@gmail.com',
  cidade = 'Brasil',
  estado = 'BR',
  whatsapp = '85997120397',
  categoria = 'Presentes digitais e educacao',
  descricao = 'O Gabarito Max oferece presentes digitais de estudo, com simulados, acompanhamento, mensagens de incentivo e materiais para melhorar o desempenho escolar.',
  produtos = 'Simulado personalizado, kit de revisao, roteiro de estudos, cartao digital de incentivo e presente educativo para estudante.',
  faixa_preco = 'A combinar',
  horario = 'Atendimento online',
  entrega = 'Entrega digital pelo WhatsApp ou link',
  plano = 'Destaque fundador',
  status = 'aprovado',
  plano_status = 'isento',
  destaque = true,
  capa_url = 'assets/gabarito-max-digital.png',
  foto_1_url = 'assets/db-enem-digital.png'
where lower(nome_loja) = 'gabarito max';

insert into public.lojistas (
  nome_loja, responsavel, email, cidade, estado, whatsapp, instagram, categoria,
  descricao, produtos, faixa_preco, horario, entrega, plano, status, plano_status,
  destaque, capa_url, foto_1_url
)
select
  'Gabarito Max',
  'Carlos',
  'cincoregioes@gmail.com',
  'Brasil',
  'BR',
  '85997120397',
  '',
  'Presentes digitais e educacao',
  'O Gabarito Max oferece presentes digitais de estudo, com simulados, acompanhamento, mensagens de incentivo e materiais para melhorar o desempenho escolar.',
  'Simulado personalizado, kit de revisao, roteiro de estudos, cartao digital de incentivo e presente educativo para estudante.',
  'A combinar',
  'Atendimento online',
  'Entrega digital pelo WhatsApp ou link',
  'Destaque fundador',
  'aprovado',
  'isento',
  true,
  'assets/gabarito-max-digital.png',
  'assets/db-enem-digital.png'
where not exists (
  select 1 from public.lojistas where lower(nome_loja) = 'gabarito max'
);
