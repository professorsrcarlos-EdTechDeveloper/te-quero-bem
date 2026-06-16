const supabaseClient = window.tqbCreateClient ? window.tqbCreateClient() : null;
const statusBox = document.getElementById("supabaseStatus");
const form = document.getElementById("autonomousSellerForm");
const resultBox = document.getElementById("sellerResult");

function onlyNumbers(value) {
  return String(value || "").replace(/\D/g, "");
}

function setStatus(message, type = "info") {
  statusBox.textContent = message;
  statusBox.dataset.type = type;
}

async function uploadImage(file, folder) {
  if (!file || !supabaseClient) return "";
  if (file.size > 3 * 1024 * 1024) {
    throw new Error("Imagem muito pesada. Use arquivo com até 3 MB.");
  }

  const extension = file.name.split(".").pop() || "jpg";
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(16).slice(2)}.${extension}`;
  const { error } = await supabaseClient.storage
    .from(window.TQB_CONFIG.storageBucket)
    .upload(fileName, file, { cacheControl: "3600", upsert: false });

  if (error) throw error;

  const { data } = supabaseClient.storage
    .from(window.TQB_CONFIG.storageBucket)
    .getPublicUrl(fileName);

  return data.publicUrl;
}

function getValue(id) {
  return document.getElementById(id).value.trim();
}

function prefillFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const map = {
    loja: "nome_loja",
    cidade: "cidade",
    estado: "estado",
    categoria: "categoria",
    whatsapp: "whatsapp"
  };

  Object.entries(map).forEach(([param, id]) => {
    const value = params.get(param);
    const field = document.getElementById(id);
    if (value && field) field.value = value;
  });
}

if (!supabaseClient) {
  setStatus("Supabase ainda não configurado. Cole sua URL e chave anon em supabase-config.js para ativar cadastros reais.", "warning");
} else {
  setStatus("Conectado ao Supabase. Cadastros serao enviados como pendentes.", "success");
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  resultBox.hidden = false;
  resultBox.innerHTML = "<h4>Enviando cadastro...</h4><p>Aguarde enquanto salvamos os dados e imagens.</p>";

  if (!supabaseClient) {
    resultBox.innerHTML = "<h4>Supabase não configurado</h4><p>Configure o arquivo supabase-config.js antes de receber cadastros reais.</p>";
    return;
  }

  try {
    const logoUrl = await uploadImage(document.getElementById("logoFile").files[0], "logos");
    const capaUrl = await uploadImage(document.getElementById("capaFile").files[0], "capas");
    const foto1Url = await uploadImage(document.getElementById("foto1File").files[0], "produtos");
    const foto2Url = await uploadImage(document.getElementById("foto2File").files[0], "produtos");

    const payload = {
      nome_loja: getValue("nome_loja"),
      responsavel: getValue("responsavel"),
      email: getValue("email"),
      cidade: getValue("cidade"),
      estado: getValue("estado"),
      whatsapp: onlyNumbers(getValue("whatsapp")),
      instagram: getValue("instagram"),
      categoria: getValue("categoria"),
      descricao: getValue("descricao"),
      produtos: getValue("produtos"),
      faixa_preco: getValue("faixa_preco"),
      horario: getValue("horario"),
      entrega: getValue("entrega"),
      plano: getValue("plano"),
      status: "pendente",
      plano_status: "pendente",
      logo_url: logoUrl,
      capa_url: capaUrl,
      foto_1_url: foto1Url,
      foto_2_url: foto2Url
    };

    const { error } = await supabaseClient
      .from("lojistas")
      .insert(payload);

    if (error) throw error;

    form.reset();
    resultBox.innerHTML = `
      <h4>Cadastro enviado para aprovação</h4>
      <p>Sua loja entrou como pendente. Após a autorização do administrador, ela aparecerá na vitrine pública.</p>
      <a class="btn primary" target="_blank" rel="noopener" href="https://wa.me/${window.TQB_CONFIG.ownerWhatsapp}?text=Ol%C3%A1%2C%20enviei%20meu%20cadastro%20no%20TE%20QUERO%20BEM.%20Pode%20verificar%3F">Avisar Carlos no WhatsApp</a>
    `;
  } catch (error) {
    resultBox.innerHTML = `<h4>Erro ao enviar</h4><p>${error.message}</p>`;
  }
});

prefillFromQuery();
