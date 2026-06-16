TE QUERO BEM
Carinho entregue em todas as cidades do Brasil

Fase atual:
- Pré-lançamento para lojistas fundadores.
- Divulgacao para lojistas a partir de 17/06/2026.
- Cadastro fundador até 30/06/2026.
- Lançamento ao público em 01/07/2026.

Arquivos:
- index.html
- style.css
- script.js
- lojista.html
- lojista.js
- admin.html
- admin.js
- supabase-config.js
- supabase-schema.sql
- github-supabase-passos.txt
- plano-divulgacao-lojistas.txt
- assets/logo-te-quero-bem.svg
- assets/hero-te-quero-bem.png

Modelo comercial aplicado:
- Cliente acessa livremente.
- Cliente escolhe cidade e chama a loja diretamente pelo WhatsApp.
- O site não intermedia pagamento do presente.
- A loja paga mensalidade para aparecer com link ativo na vitrine.
- O lojista pode cadastrar dados, textos e imagens.
- Nada aparece publicamente sem aprovação no painel admin.

Fluxo com Supabase:
- lojista.html: lojista envia cadastro com textos e imagens.
- Supabase salva como pendente.
- admin.html: administrador aprova, recusa ou suspende.
- index.html: mostra somente lojas com status aprovado.

Planos sugeridos:
- Básico fundador: R$ 19,90 no primeiro mês; depois R$ 29,90 por mês.
- Destaque fundador: R$ 39,90 no primeiro mês; depois R$ 49,90 por mês.
- Regional fundador: R$ 59,90 no primeiro mês; depois R$ 69,90 por mês.

Diferença real entre planos:
- Básico: presença simples na cidade, 1 foto e até 3 produtos/serviços.
- Destaque: card maior, aparece acima do Básico, até 6 fotos/produtos e 1 divulgação mensal orgânica.
- Regional: aparece em até 3 cidades próximas, selo recomendado, até 10 fotos/produtos, 2 divulgações mensais orgânicas e link exclusivo da página da loja.

Para transformar em sistema real:
- O WhatsApp oficial do atendimento da plataforma já está configurado como 55 85 99712-0397.
- Trocar apenas os WhatsApps demonstrativos dos lojistas pelos numeros oficiais de cada loja.
- Criar projeto Supabase.
- Executar supabase-schema.sql.
- Colar URL e anon key em supabase-config.js.
- Publicar no GitHub Pages.
- Integrar pagamento mensal com Asaas, Mercado Pago, PagBank ou Efi quando quiser automatizar cobranca.
