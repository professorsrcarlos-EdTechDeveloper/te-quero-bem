const supabaseClient = window.tqbCreateClient ? window.tqbCreateClient() : null;
const loginPanel = document.getElementById("loginPanel");
const adminPanel = document.getElementById("adminPanel");
const adminLoginForm = document.getElementById("adminLoginForm");
const adminLoginStatus = document.getElementById("adminLoginStatus");
const adminStoreList = document.getElementById("adminStoreList");
let currentStatus = "pendente";

function setLoginStatus(message) {
  adminLoginStatus.textContent = message;
}

function statusLabel(status) {
  const map = {
    pendente: "Pendente",
    aprovado: "Aprovado",
    recusado: "Recusado",
    suspenso: "Suspenso"
  };
  return map[status] || status;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeWhatsapp(value) {
  const numbers = String(value || "").replace(/\D/g, "");
  return numbers.startsWith("55") ? numbers : `55${numbers}`;
}

async function checkSession() {
  if (!supabaseClient) {
    setLoginStatus("Supabase ainda não configurado. Cole URL e anon key em supabase-config.js.");
    return;
  }

  const { data } = await supabaseClient.auth.getSession();
  if (data.session) {
    loginPanel.hidden = true;
    adminPanel.hidden = false;
    await loadStores();
  }
}

async function loadStores() {
  adminStoreList.innerHTML = "<p>Carregando lojistas...</p>";
  let query = supabaseClient
    .from("lojistas")
    .select("*")
    .order("created_at", { ascending: false });

  if (currentStatus !== "todos") {
    query = query.eq("status", currentStatus);
  }

  const { data, error } = await query;
  if (error) {
    adminStoreList.innerHTML = `<div class="status-note">Erro: ${escapeHtml(error.message)}</div>`;
    return;
  }

  if (!data.length) {
    adminStoreList.innerHTML = "<div class=\"status-note\">Nenhum cadastro encontrado neste filtro.</div>";
    return;
  }

  adminStoreList.innerHTML = data.map(store => `
    <article class="admin-store-card">
      <div class="admin-store-images">
        ${store.logo_url ? `<img src="${escapeHtml(store.logo_url)}" alt="Logo ${escapeHtml(store.nome_loja)}">` : "<span>Sem logo</span>"}
        ${store.capa_url ? `<img src="${escapeHtml(store.capa_url)}" alt="Imagem ${escapeHtml(store.nome_loja)}">` : "<span>Sem capa</span>"}
      </div>
      <div class="admin-store-content">
        <div class="panel-title">
          <div>
            <h3>${escapeHtml(store.nome_loja)}</h3>
            <p>${escapeHtml(store.cidade)}/${escapeHtml(store.estado)} • ${escapeHtml(store.categoria)}</p>
          </div>
          <span class="pill">${statusLabel(store.status)}</span>
        </div>
        <p><strong>Responsável:</strong> ${escapeHtml(store.responsavel)} • <strong>WhatsApp:</strong> ${escapeHtml(store.whatsapp)}</p>
        <p><strong>Instagram:</strong> ${escapeHtml(store.instagram || "-")} • <strong>Plano:</strong> ${escapeHtml(store.plano)} • <strong>Pagamento:</strong> ${escapeHtml(store.plano_status)}</p>
        <p><strong>Descrição:</strong> ${escapeHtml(store.descricao)}</p>
        <p><strong>Produtos:</strong> ${escapeHtml(store.produtos)}</p>
        <div class="admin-actions">
          <button class="btn primary updateStore" data-id="${store.id}" data-status="aprovado" data-plan="pago" type="button">Aprovar</button>
          <button class="btn secondary updateStore" data-id="${store.id}" data-status="pendente" data-plan="pendente" type="button">Voltar para pendente</button>
          <button class="btn ghost updateStore" data-id="${store.id}" data-status="recusado" data-plan="${store.plano_status}" type="button">Recusar</button>
          <button class="btn ghost updateStore" data-id="${store.id}" data-status="suspenso" data-plan="${store.plano_status}" type="button">Suspender</button>
          <a class="btn secondary" target="_blank" rel="noopener" href="https://wa.me/${normalizeWhatsapp(store.whatsapp)}?text=Ol%C3%A1%2C%20sou%20do%20TE%20QUERO%20BEM%20e%20estou%20analisando%20seu%20cadastro.">WhatsApp</a>
        </div>
      </div>
    </article>
  `).join("");

  document.querySelectorAll(".updateStore").forEach(button => {
    button.addEventListener("click", () => updateStore(button.dataset.id, button.dataset.status, button.dataset.plan));
  });
}

async function updateStore(id, status, planStatus) {
  const payload = {
    status,
    plano_status: planStatus
  };

  if (status === "aprovado") {
    payload.aprovado_em = new Date().toISOString();
  }

  const { error } = await supabaseClient
    .from("lojistas")
    .update(payload)
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  await loadStores();
}

adminLoginForm.addEventListener("submit", async event => {
  event.preventDefault();
  if (!supabaseClient) {
    setLoginStatus("Configure o Supabase primeiro.");
    return;
  }

  const email = document.getElementById("adminEmail").value.trim();
  const { error } = await supabaseClient.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.href
    }
  });

  if (error) {
    setLoginStatus(error.message);
    return;
  }

  setLoginStatus("Link enviado. Abra seu e-mail e clique para entrar.");
});

document.getElementById("adminLogout").addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  location.reload();
});

document.querySelectorAll(".filterStatus").forEach(button => {
  button.addEventListener("click", async () => {
    currentStatus = button.dataset.status;
    await loadStores();
  });
});

checkSession();
