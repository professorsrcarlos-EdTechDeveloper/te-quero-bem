// CONFIGURACAO SUPABASE - TE QUERO BEM
// 1. Crie o projeto no Supabase.
// 2. Execute o arquivo supabase-schema.sql no SQL Editor.
// 3. Cole abaixo a Project URL e a anon/public key do seu projeto.

window.TQB_CONFIG = {
  supabaseUrl: "COLE_AQUI_SUA_SUPABASE_URL",
  supabaseAnonKey: "COLE_AQUI_SUA_SUPABASE_ANON_KEY",
  storageBucket: "loja-imagens",
  ownerWhatsapp: "5585997120397",
  launchDate: "2026-07-01T00:00:00-03:00"
};

window.tqbIsSupabaseReady = function tqbIsSupabaseReady() {
  const config = window.TQB_CONFIG || {};
  return Boolean(
    window.supabase &&
    config.supabaseUrl &&
    config.supabaseAnonKey &&
    !config.supabaseUrl.includes("COLE_AQUI") &&
    !config.supabaseAnonKey.includes("COLE_AQUI")
  );
};

window.tqbCreateClient = function tqbCreateClient() {
  if (!window.tqbIsSupabaseReady()) return null;
  if (!window.tqbClient) {
    window.tqbClient = window.supabase.createClient(
      window.TQB_CONFIG.supabaseUrl,
      window.TQB_CONFIG.supabaseAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      }
    );
  }
  return window.tqbClient;
};
