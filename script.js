const nicheImages = {
  flores: [
    "assets/nicho-flores-cestas.png",
    "assets/nicho-cestas-cafe.png",
    "assets/nicho-baloes-presentes.png"
  ],
  doces: [
    "assets/nicho-chocolates-bolos.png",
    "assets/nicho-cestas-cafe.png",
    "assets/nicho-baloes-presentes.png"
  ],
  cestas: [
    "assets/nicho-cestas-cafe.png",
    "assets/nicho-flores-cestas.png",
    "assets/nicho-chocolates-bolos.png"
  ],
  surpresas: [
    "assets/nicho-baloes-presentes.png",
    "assets/nicho-chocolates-bolos.png",
    "assets/nicho-flores-cestas.png"
  ],
  digitais: [
    "assets/db-enem-digital.png",
    "assets/gabarito-max-digital.png",
    "assets/presente-digital-educacao.png"
  ]
};

const fallbackStores = [
  {
    id: "demo-flores",
    nome_loja: "Flor & Afeto Beberibe",
    cidade: "Beberibe",
    estado: "CE",
    categoria: "Flores, cestas e mensagens",
    plano: "Destaque",
    whatsapp: "5585999999999",
    destaque: true,
    descricao: "Floricultura parceira para buquês, cestas afetivas, cartões e presentes de saudade, amor e gratidão.",
    produtos: "Buquês, cestas, cartões, flores delicadas e mensagens personalizadas.",
    capa_url: "assets/nicho-flores-cestas.png",
    gallery_urls: nicheImages.flores
  },
  {
    id: "demo-doces",
    nome_loja: "Doce Carinho Fortaleza",
    cidade: "Fortaleza",
    estado: "CE",
    categoria: "Chocolates, bolos e combos",
    plano: "Regional",
    whatsapp: "5585888888888",
    destaque: true,
    descricao: "Doceria parceira para presentes doces, aniversários, pedidos de desculpas e surpresas especiais.",
    produtos: "Chocolates, bolos, brigadeiros, doces finos e combos surpresa.",
    capa_url: "assets/nicho-chocolates-bolos.png",
    gallery_urls: nicheImages.doces
  },
  {
    id: "demo-cestas",
    nome_loja: "Cestas da Vila",
    cidade: "Alto Santo",
    estado: "CE",
    categoria: "Cestas especiais e café da manhã",
    plano: "Básico",
    whatsapp: "5585777777777",
    destaque: false,
    descricao: "Loja local para cestas de café da manhã, melhoras, aniversário e lembranças carinhosas.",
    produtos: "Cestas, café da manhã, frutas, biscoitos, cartões e doces.",
    capa_url: "assets/nicho-cestas-cafe.png",
    gallery_urls: nicheImages.cestas
  },
  {
    id: "demo-surpresas",
    nome_loja: "Balões & Surpresas",
    cidade: "Beberibe",
    estado: "CE",
    categoria: "Balões e presentes personalizados",
    plano: "Destaque",
    whatsapp: "5585666666666",
    destaque: false,
    descricao: "Loja demonstrativa para aniversários, declarações, surpresas românticas e kits personalizados.",
    produtos: "Balões, caixas surpresa, presentes personalizados, cartões e decoração afetiva.",
    capa_url: "assets/nicho-baloes-presentes.png",
    gallery_urls: nicheImages.surpresas
  }
];

const assistantQuestions = [
  { key: "occasion", title: "Qual é a ocasião?", options: ["Aniversário", "Saudade", "Amor", "Pedido de desculpas", "Melhoras", "Agradecimento", "Conquista", "Surpresa sem data"] },
  { key: "relation", title: "Quem vai receber?", options: ["Namorado(a)", "Esposo(a)", "Mãe", "Pai", "Filho(a)", "Amigo(a)", "Cliente especial", "Pessoa distante"] },
  { key: "style", title: "Como essa pessoa é?", options: ["Romântica", "Alegre", "Discreta", "Sofisticada", "Emotiva", "Prática", "Ama doces", "Ama flores"] },
  { key: "message", title: "O que você quer transmitir?", options: ["Eu te amo", "Estou com saudade", "Me desculpe", "Você é especial", "Obrigado por tudo", "Estou torcendo por você", "Quero fazer sorrir", "Quero impressionar"] },
  { key: "urgency", title: "Quando precisa entregar?", options: ["Hoje", "Amanhã", "Nesta semana", "Data agendada", "Sem pressa"] },
  { key: "budget", title: "Qual é o orçamento aproximado?", options: ["Até R$ 50", "R$ 51 a R$ 100", "R$ 101 a R$ 200", "R$ 201 a R$ 350", "Acima de R$ 350"] },
  { key: "impact", title: "Qual impacto você quer causar?", options: ["Simples e delicado", "Carinhoso", "Emocionante", "Marcante", "Inesquecível"] },
  { key: "delivery", title: "Como deve ser a entrega?", options: ["Entrega simples", "Surpresa", "Com mensagem escrita", "Com foto do presente", "Com horário combinado", "Com música ou áudio"] }
];

let currentQuestion = 0;
let assistantAnswers = {};
let currentStores = [...fallbackStores];

const supabaseClient = window.tqbCreateClient ? window.tqbCreateClient() : null;
const storeList = document.getElementById("storeList");
const giftForm = document.getElementById("giftForm");
const mostrarTodas = document.getElementById("mostrarTodas");
const sellerForm = document.getElementById("sellerForm");
const searchFeedback = document.getElementById("searchFeedback");
const storeModal = document.getElementById("storeModal");
const modalHeroImage = document.getElementById("modalHeroImage");
const modalTitle = document.getElementById("modalTitle");
const modalLocation = document.getElementById("modalLocation");
const modalDescription = document.getElementById("modalDescription");
const modalProducts = document.getElementById("modalProducts");
const modalGallery = document.getElementById("modalGallery");
const modalWhatsapp = document.getElementById("modalWhatsapp");
const closeStoreModal = document.getElementById("closeStoreModal");

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function onlyNumbers(value) {
  return String(value || "").replace(/\D/g, "");
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getStoreId(store, index) {
  return store.id || `${normalizeText(store.nome_loja)}-${normalizeText(store.cidade)}-${index}`;
}

function isDigitalStore(store) {
  const joined = normalizeText(`${store.cidade} ${store.estado} ${store.categoria} ${store.entrega} ${store.descricao} ${store.produtos}`);
  return (
    joined.includes("digital") ||
    joined.includes("online") ||
    joined.includes("brasil") ||
    store.estado === "BR"
  );
}

function displayLocation(store) {
  return isDigitalStore(store) ? "Atendimento nacional" : `${store.cidade}/${store.estado}`;
}

function updateLaunchCountdown() {
  const countdown = document.getElementById("daysToLaunch");
  if (!countdown) return;

  const today = new Date();
  const launchDate = new Date((window.TQB_CONFIG && window.TQB_CONFIG.launchDate) || "2026-07-01T00:00:00-03:00");
  const diff = launchDate - today;
  const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  countdown.textContent = days > 0 ? `${days} dias` : "Lançamento aberto";
}

async function loadApprovedStores() {
  if (!supabaseClient) {
    currentStores = [...fallbackStores];
    renderStores(currentStores, true);
    return;
  }

  const { data, error } = await supabaseClient
    .from("lojistas")
    .select("*")
    .eq("status", "aprovado")
    .order("destaque", { ascending: false })
    .order("aprovado_em", { ascending: false });

  if (error) {
    currentStores = [...fallbackStores];
    renderStores(currentStores, true);
    return;
  }

  currentStores = data && data.length ? data : [];
  renderStores(currentStores, false);
}

function nicheGallery(store) {
  const joined = normalizeText(`${store.categoria} ${store.produtos} ${store.descricao}`);
  const uploadedGallery = [store.capa_url, store.logo_url, store.foto_1_url, store.foto_2_url].filter(Boolean);
  if (uploadedGallery.length >= 3) return uploadedGallery;
  if (Array.isArray(store.gallery_urls) && store.gallery_urls.length) return store.gallery_urls;
  let fallback = nicheImages.flores;
  if (joined.includes("chocolate") || joined.includes("bolo") || joined.includes("doce")) fallback = nicheImages.doces;
  if (joined.includes("cafe") || joined.includes("cesta")) fallback = nicheImages.cestas;
  if (joined.includes("balao") || joined.includes("surpresa") || joined.includes("personalizado")) fallback = nicheImages.surpresas;
  if (isDigitalStore(store) || joined.includes("enem") || joined.includes("estudo") || joined.includes("educacao") || joined.includes("simulado")) fallback = nicheImages.digitais;
  return [...new Set([...uploadedGallery, ...fallback])];
}

function renderStores(items = currentStores, demoMode = false) {
  const sorted = [...items].sort((a, b) => Number(b.destaque) - Number(a.destaque));

  if (!sorted.length) {
    storeList.innerHTML = `
      <article class="store-card empty-store-card">
        <div>
          <h3>Nenhuma loja aprovada nesta cidade ainda</h3>
          <p>Estamos cadastrando lojistas fundadores até 30/06. Indique uma loja para aparecer no lançamento.</p>
        </div>
        <a class="btn secondary" href="lojista.html">Cadastrar loja</a>
      </article>
    `;
    return;
  }

  storeList.innerHTML = sorted.map((store, index) => {
    const storeId = getStoreId(store, index);
    const rawWhatsapp = onlyNumbers(store.whatsapp);
    const whatsapp = rawWhatsapp.startsWith("55") ? rawWhatsapp : `55${rawWhatsapp}`;
    const location = displayLocation(store);
    const messageText = isDigitalStore(store)
      ? `Olá! Encontrei ${store.nome_loja} no TE QUERO BEM e quero informações sobre presente digital.`
      : `Olá! Encontrei sua loja no TE QUERO BEM e quero enviar um presente em ${store.cidade}/${store.estado}.`;
    const message = encodeURIComponent(messageText);
    const image = store.capa_url || store.logo_url || nicheGallery(store)[0];
    return `
      <article class="store-card glow-card ${store.destaque ? "featured" : ""}" data-store-id="${escapeHtml(storeId)}" tabindex="0" role="button" aria-label="Abrir página da loja ${escapeHtml(store.nome_loja)}">
        <img class="store-thumb" src="${escapeHtml(image)}" alt="Imagem da loja ${escapeHtml(store.nome_loja)}" loading="lazy">
        <div class="store-card-content">
          <h3>${escapeHtml(store.nome_loja)}</h3>
          <p>${escapeHtml(store.descricao || store.categoria)}</p>
          <p class="store-products">${escapeHtml(store.produtos || "")}</p>
          <div class="meta">
            <span class="pill">${escapeHtml(location)}</span>
            <span class="pill">${escapeHtml(store.categoria)}</span>
            ${isDigitalStore(store) ? "<span class=\"pill\">Atende todo o Brasil</span>" : ""}
            ${store.destaque ? "<span class=\"pill\">Loja em destaque</span>" : ""}
            ${demoMode ? "<span class=\"pill\">Exemplo visual</span>" : ""}
          </div>
        </div>
        <div class="store-actions">
          <button class="btn secondary tiny openStoreBtn" type="button" data-store-id="${escapeHtml(storeId)}">Ver página</button>
          <a class="btn primary" target="_blank" rel="noopener" href="https://wa.me/${whatsapp}?text=${message}">Chamar loja</a>
        </div>
      </article>
    `;
  }).join("");

  document.querySelectorAll(".store-card").forEach(card => {
    card.addEventListener("click", event => {
      if (event.target.closest("a") || event.target.closest("button")) return;
      openStorePage(card.dataset.storeId);
    });
    card.addEventListener("keydown", event => {
      if (event.key === "Enter") openStorePage(card.dataset.storeId);
    });
  });

  document.querySelectorAll(".openStoreBtn").forEach(button => {
    button.addEventListener("click", () => openStorePage(button.dataset.storeId));
  });
}

function updateSearchFeedback(message, type = "default") {
  if (!searchFeedback) return;
  searchFeedback.textContent = message;
  searchFeedback.dataset.type = type;
  searchFeedback.classList.remove("pulse-feedback");
  void searchFeedback.offsetWidth;
  searchFeedback.classList.add("pulse-feedback");
}

function findStoreById(storeId) {
  return currentStores.find((store, index) => getStoreId(store, index) === storeId);
}

function openStorePage(storeId) {
  const store = findStoreById(storeId);
  if (!store || !storeModal) return;

  const gallery = [...new Set([store.capa_url, store.logo_url, store.foto_1_url, store.foto_2_url, ...nicheGallery(store)].filter(Boolean))];
  const heroImage = gallery[0] || "assets/nicho-flores-cestas.png";
  const rawWhatsapp = onlyNumbers(store.whatsapp);
  const whatsapp = rawWhatsapp.startsWith("55") ? rawWhatsapp : `55${rawWhatsapp}`;
  const location = displayLocation(store);
  const messageText = isDigitalStore(store)
    ? `Olá! Vi ${store.nome_loja} no TE QUERO BEM e quero informações sobre presente digital.`
    : `Olá! Vi a página da sua loja no TE QUERO BEM e quero informações sobre presentes.`;
  const message = encodeURIComponent(messageText);

  modalHeroImage.src = heroImage;
  modalHeroImage.alt = `Página da loja ${store.nome_loja}`;
  modalTitle.textContent = store.nome_loja;
  modalLocation.textContent = `${location} • ${store.categoria}`;
  modalDescription.textContent = store.descricao || "Conheça as opções disponíveis e fale pelo WhatsApp para combinar detalhes, prazo e atendimento.";
  modalProducts.textContent = store.produtos || "Produtos, serviços, diferenciais e condições de entrega.";
  modalWhatsapp.href = `https://wa.me/${whatsapp}?text=${message}`;
  modalGallery.innerHTML = gallery.map((image, index) => `
    <button class="gallery-item ${index === 0 ? "active" : ""}" type="button" data-image="${escapeHtml(image)}">
      <img src="${escapeHtml(image)}" alt="Foto ${index + 1} da loja ${escapeHtml(store.nome_loja)}">
    </button>
  `).join("");

  document.querySelectorAll(".gallery-item").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".gallery-item").forEach(item => item.classList.remove("active"));
      button.classList.add("active");
      modalHeroImage.src = button.dataset.image;
    });
  });

  storeModal.hidden = false;
  document.body.classList.add("modal-open");
}

function closeModal() {
  if (!storeModal) return;
  storeModal.hidden = true;
  document.body.classList.remove("modal-open");
}

giftForm.addEventListener("submit", event => {
  event.preventDefault();
  const cityInput = document.getElementById("cidadeDestino").value.trim();
  const city = normalizeText(cityInput);
  const state = document.getElementById("estadoDestino").value;
  const filtered = currentStores.filter(store => {
    const digital = isDigitalStore(store);
    const cityMatches = city ? normalizeText(store.cidade).includes(city) : true;
    const stateMatches = state ? store.estado === state : true;
    return digital || (cityMatches && stateMatches);
  });
  renderStores(filtered, !supabaseClient);
  const place = `${cityInput || "todas as cidades"}${state ? `/${state}` : ""}`;
  const digitalTotal = filtered.filter(isDigitalStore).length;
  const totalText = filtered.length === 1 ? "1 opção encontrada" : `${filtered.length} opções encontradas`;
  const digitalText = digitalTotal ? ` Inclui ${digitalTotal} serviço(s) digital(is) com atendimento nacional.` : "";
  updateSearchFeedback(`Resultado da busca para ${place}: ${totalText}.${digitalText}`, filtered.length ? "success" : "empty");
  if (storeList) storeList.scrollIntoView({ behavior: "smooth", block: "start" });
});

mostrarTodas.addEventListener("click", () => {
  renderStores(currentStores, !supabaseClient);
  updateSearchFeedback(`Vitrine completa: ${currentStores.length} loja(s) aprovada(s).`, "default");
});

sellerForm.addEventListener("submit", event => {
  event.preventDefault();
  const query = new URLSearchParams({
    loja: document.getElementById("lojaNome").value,
    cidade: document.getElementById("lojaCidade").value,
    estado: document.getElementById("lojaEstado").value,
    categoria: document.getElementById("lojaCategoria").value,
    whatsapp: document.getElementById("lojaWhats").value
  });
  window.location.href = `lojista.html?${query.toString()}`;
});

function renderQuestion() {
  const question = assistantQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / assistantQuestions.length) * 100;
  document.getElementById("progressText").textContent = `Pergunta ${currentQuestion + 1} de ${assistantQuestions.length}`;
  document.getElementById("progressBar").style.width = `${progress}%`;
  document.getElementById("questionTitle").textContent = question.title;
  document.getElementById("resultBox").hidden = true;
  document.getElementById("answersGrid").innerHTML = question.options.map(option =>
    `<button class="answer-btn" type="button" data-answer="${escapeHtml(option)}">${escapeHtml(option)}</button>`
  ).join("");
  document.querySelectorAll(".answer-btn").forEach(button => {
    button.addEventListener("click", () => {
      assistantAnswers[question.key] = button.dataset.answer;
      if (currentQuestion < assistantQuestions.length - 1) {
        currentQuestion += 1;
        renderQuestion();
      } else {
        showAssistantResult();
      }
    });
  });
}

function buildRecommendation() {
  const occasion = assistantAnswers.occasion || "";
  const style = assistantAnswers.style || "";
  const budget = assistantAnswers.budget || "";
  const impact = assistantAnswers.impact || "";
  const delivery = assistantAnswers.delivery || "";

  let mainGift = "combo surpresa com mensagem personalizada";
  let extras = "cartão escrito à mão e embalagem especial";
  let tone = "carinhosa";

  if (occasion.includes("desculpas")) {
    mainGift = "flores claras com chocolate premium";
    extras = "carta sincera, curta e respeitosa";
    tone = "delicada e reconciliadora";
  } else if (occasion.includes("Saudade")) {
    mainGift = "cesta afetiva com doces, foto impressa e mensagem";
    extras = "áudio curto ou música que lembre vocês";
    tone = "emocionante";
  } else if (occasion.includes("Melhoras")) {
    mainGift = "cesta leve de cuidado com flores suaves";
    extras = "mensagem de apoio e recuperação";
    tone = "acolhedora";
  } else if (occasion.includes("Aniversário")) {
    mainGift = "bolo ou doces com balões e cartão";
    extras = "entrega surpresa em horário combinado";
    tone = "alegre";
  } else if (occasion.includes("Amor") || assistantAnswers.message === "Eu te amo") {
    mainGift = "buquê moderno com caixa de chocolates";
    extras = "cartão romântico e uma música escolhida por você";
    tone = "romântica";
  } else if (occasion.includes("Agradecimento")) {
    mainGift = "lembrança elegante com cartão de gratidão";
    extras = "flores pequenas ou doces finos";
    tone = "respeitosa e afetuosa";
  }

  if (style.includes("Ama doces")) mainGift = "caixa de doces especiais ou chocolate artesanal";
  if (style.includes("Sofisticada") || budget.includes("Acima") || budget.includes("350")) extras += ", embalagem premium e foto do presente pronto";
  if (impact.includes("Inesquecível") || impact.includes("Marcante")) extras += ", surpresa com registro da entrega";
  if (delivery.includes("música") || delivery.includes("áudio")) extras += ", áudio ou QR Code com mensagem";

  return { mainGift, extras, tone };
}

function showAssistantResult() {
  const result = buildRecommendation();
  const resultBox = document.getElementById("resultBox");
  document.getElementById("answersGrid").innerHTML = "";
  document.getElementById("questionTitle").textContent = "Sugestão final do Orientador Relacional";
  document.getElementById("progressText").textContent = "Conclusão pronta";
  document.getElementById("progressBar").style.width = "100%";
  resultBox.hidden = false;
  resultBox.innerHTML = `
    <h4>Presente ideal: ${escapeHtml(result.mainGift)}</h4>
    <p><strong>Complemento recomendado:</strong> ${escapeHtml(result.extras)}.</p>
    <p><strong>Tom da mensagem:</strong> ${escapeHtml(result.tone)}.</p>
    <p>Próximo passo: buscar lojas ativas na cidade do destinatário e combinar tudo direto pelo WhatsApp.</p>
    <a class="btn primary" href="#enviar">Buscar lojistas agora</a>
  `;
}

document.getElementById("backQuestion").addEventListener("click", () => {
  if (currentQuestion > 0) {
    currentQuestion -= 1;
    renderQuestion();
  }
});

document.getElementById("restartAssistant").addEventListener("click", () => {
  currentQuestion = 0;
  assistantAnswers = {};
  renderQuestion();
});

document.querySelectorAll(".openPayment").forEach(button => {
  button.addEventListener("click", () => {
    document.getElementById("paymentTitle").textContent = button.dataset.plan;
    const planMessage = encodeURIComponent(`Olá, quero ativar o plano ${button.dataset.plan} para minha loja no TE QUERO BEM.`);
    document.getElementById("paymentWhats").href = `https://wa.me/${window.TQB_CONFIG.ownerWhatsapp}?text=${planMessage}`;
    document.getElementById("paymentBox").hidden = false;
    document.getElementById("paymentBox").scrollIntoView({ behavior: "smooth", block: "center" });
  });
});

document.getElementById("closePayment").addEventListener("click", () => {
  document.getElementById("paymentBox").hidden = true;
});

document.getElementById("copyPix").addEventListener("click", async () => {
  const pixCode = document.getElementById("pixCode").textContent;
  try {
    await navigator.clipboard.writeText(pixCode);
    document.getElementById("copyPix").textContent = "Pix copiado";
    setTimeout(() => {
      document.getElementById("copyPix").textContent = "Copiar Pix demonstrativo";
    }, 1800);
  } catch (error) {
    alert("Copie o código Pix demonstrativo manualmente.");
  }
});

if (closeStoreModal) closeStoreModal.addEventListener("click", closeModal);
if (storeModal) {
  storeModal.addEventListener("click", event => {
    if (event.target === storeModal) closeModal();
  });
}
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeModal();
});

loadApprovedStores();
renderQuestion();
updateLaunchCountdown();
