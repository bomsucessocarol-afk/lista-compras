'use strict';
/* =========================================================
   CONTA, PLANOS E PAGAMENTO
   - Login (e-mail e senha) pelo Supabase: cada pessoa vê só os próprios dados
   - Planos Premium: Economia, Cardápio e Completo (mensal ou vitalício)
   - Cobrança pela Google Play (Digital Goods API, dentro do app da loja)
   - Acessos liberados à mão: tabela "acessos" no Supabase
   ========================================================= */

/* ---------- CONFIGURAÇÃO (preencher depois de criar o projeto Supabase do app) ---------- */
const APP_CFG = {
  SUPABASE_URL: '',        // ex.: https://xxxxxxxx.supabase.co   (Supabase > Project Settings > API)
  SUPABASE_ANON_KEY: '',   // a chave "anon public" / "publishable"
  PLAY_URL: '',            // link do app na Google Play, quando publicado
  SUPORTE_EMAIL: '',       // e-mail de suporte que aparece na política de privacidade e na conta
};
const PLAY_BILLING = 'https://play.google.com/billing';

/* ---------- PLANOS ---------- */
const PLANOS = [
  { id: 'economia', nome: 'Economia', emoji: '💰', cor: '#2E7D32',
    itens: ['📊 Resumo de gastos do mês e do ano', '📈 Comparativo com o ano passado', '🧾 Ler nota fiscal pelo QR Code', '💳 Formas de pagamento e descontos'],
    mensal: { sku: 'economia_mensal', preco: 'R$ 3,99' }, vitalicio: { sku: 'economia_vitalicio', preco: 'R$ 9,90' } },
  { id: 'cardapio', nome: 'Cardápio', emoji: '🍲', cor: '#C2410C',
    itens: ['📅 Cardápio da semana e do mês', '🔥 Calorias e meta do dia', '🛒 Gera a lista de compras pelo cardápio'],
    mensal: { sku: 'cardapio_mensal', preco: 'R$ 4,99' }, vitalicio: { sku: 'cardapio_vitalicio', preco: 'R$ 12,90' } },
  { id: 'dieta', nome: 'Dieta', emoji: '🥗', cor: '#0F8A5F',
    itens: ['🥗 50 receitas leves já com calorias', '📅 Cardápio da semana e do mês', '✨ Monta a semana sozinho na sua meta', '🔥 Calorias e meta do dia'],
    mensal: { sku: 'dieta_mensal', preco: 'R$ 5,99' }, vitalicio: { sku: 'dieta_vitalicio', preco: 'R$ 14,90' } },
  { id: 'completo', nome: 'Completo', emoji: '⭐', cor: '#383772', destaque: true,
    itens: ['✅ Tudo do Economia + Cardápio + Dieta', '📦 Adicionar pelo código de barras', '📷 Leitura de etiqueta e encarte por foto', '👨‍👩‍👦 Lista compartilhada com a família (em breve)'],
    mensal: { sku: 'completo_mensal', preco: 'R$ 7,99' }, vitalicio: { sku: 'completo_vitalicio', preco: 'R$ 19,90' } },
];
const PLANO_BY = Object.fromEntries(PLANOS.map(p => [p.id, p]));
const SKU_PLANO = {};
PLANOS.forEach(p => { SKU_PLANO[p.mensal.sku] = p.id; SKU_PLANO[p.vitalicio.sku] = p.id; });
/* qual plano libera cada função */
const FUNCAO_PLANOS = { economia: ['economia', 'completo'], cardapio: ['cardapio', 'dieta', 'completo'], dieta: ['dieta', 'completo'], completo: ['completo'] };

const LS_ENT = 'lc_acesso_v1';         // planos liberados (cópia para usar sem internet)
const LS_TWA = 'lc_app_loja_v1';       // aberto pelo app da Google Play
const LS_LAST_UID = 'lc_ultimo_usuario_v1';
const LS_SEM_CONTA = 'lc_sem_conta_v1';
const LS_NOME = 'lc_nome_v1';
function nomeUsuario(){
  const m = conta.user && conta.user.user_metadata && conta.user.user_metadata.nome;
  if(m) return String(m).split(' ')[0];
  try{ return (localStorage.getItem(LS_NOME) || '').split(' ')[0]; }catch(e){ return ''; }
}

const conta = {
  user: null,          // usuário logado (Supabase)
  planos: new Set(),   // planos liberados agora
  acessoWeb: false,
  precos: {},          // preços reais vindos da Google Play
  pronta: false,
};

/* ---------- onde o app está rodando ---------- */
function abertoPelaLoja(){
  try{
    if(document.referrer && document.referrer.startsWith('android-app://')) localStorage.setItem(LS_TWA, '1');
    return localStorage.getItem(LS_TWA) === '1';
  }catch(e){ return false; }
}
function modoTeste(){ return /^(localhost|127\.0\.0\.1)$/.test(location.hostname) || new URLSearchParams(location.search).has('teste'); }
function nuvemConfigurada(){ return !!(APP_CFG.SUPABASE_URL && APP_CFG.SUPABASE_ANON_KEY); }

/* ---------- planos liberados ---------- */
function temPlano(funcao){
  const ok = FUNCAO_PLANOS[funcao] || [funcao];
  return ok.some(p => conta.planos.has(p));
}
function lerAcessoGuardado(){
  try{
    const o = JSON.parse(localStorage.getItem(LS_ENT) || 'null');
    if(o && Date.now() - (o.em || 0) < 7 * 864e5){ conta.planos = new Set(o.planos || []); conta.acessoWeb = !!o.web; }
  }catch(e){}
}
function guardarAcesso(){
  try{ localStorage.setItem(LS_ENT, JSON.stringify({ planos: [...conta.planos], web: conta.acessoWeb, em: Date.now() })); }catch(e){}
}

async function servicoPlay(){
  if(!('getDigitalGoodsService' in window)) return null;
  try{ return await window.getDigitalGoodsService(PLAY_BILLING); }catch(e){ return null; }
}
async function comprasDaPlay(){
  const s = await servicoPlay(); if(!s) return null;
  try{ return await s.listPurchases(); }catch(e){ return null; }
}
async function carregarPrecos(){
  const s = await servicoPlay(); if(!s) return;
  try{
    const skus = PLANOS.flatMap(p => [p.mensal.sku, p.vitalicio.sku]);
    const det = await s.getDetails(skus);
    det.forEach(d => {
      const v = Number(d.price && d.price.value);
      if(!isNaN(v)) conta.precos[d.itemId] = v.toLocaleString('pt-BR', { style: 'currency', currency: d.price.currency || 'BRL' });
    });
  }catch(e){ console.warn('Preços da Play:', e); }
}
async function atualizarAcesso(){
  const novos = new Set();
  let web = false, conseguiuLer = false;
  // 1) compras feitas na Google Play (assinaturas ativas + vitalícios)
  const compras = await comprasDaPlay();
  if(compras){
    conseguiuLer = true;
    compras.forEach(c => { const p = SKU_PLANO[c.itemId]; if(p) novos.add(p); });
    const s = await servicoPlay(); // versões antigas da API pedem confirmação manual
    if(s && typeof s.acknowledge === 'function'){
      for(const c of compras){ try{ await s.acknowledge(c.purchaseToken, 'onetime'); }catch(e){} }
    }
  }
  // 2) acessos liberados à mão (tabela "acessos")
  const client = getSb();
  if(client && conta.user){
    try{
      const { data, error } = await client.from('acessos').select('planos,acesso_web,ate').eq('user_id', conta.user.id).maybeSingle();
      if(error) throw error;
      conseguiuLer = true;
      if(data && (!data.ate || new Date(data.ate) > new Date())){
        (data.planos || []).forEach(p => novos.add(p));
        web = !!data.acesso_web;
      }
    }catch(e){ console.warn('Acessos:', e); }
  }
  if(modoTeste()){
    const t = new URLSearchParams(location.search).get('planos');
    if(t) t.split(',').forEach(p => novos.add(p.trim()));
  }
  if(conseguiuLer || modoTeste()){ conta.planos = novos; conta.acessoWeb = web; guardarAcesso(); }
}

/* ---------- comprar ---------- */
async function comprar(sku){
  const s = await servicoPlay();
  if(!s){
    toast(abertoPelaLoja() ? 'Atualize o app da Google Play para comprar' : 'As compras são feitas pelo app da Google Play', null, null, 4000);
    return;
  }
  try{
    const req = new PaymentRequest(
      [{ supportedMethods: PLAY_BILLING, data: { sku } }],
      { total: { label: 'Total', amount: { currency: 'BRL', value: '0' } } }
    );
    const resp = await req.show();
    await resp.complete('success');
    await atualizarAcesso();
    closeSheet(); render();
    toast('🎉 Premium liberado! Obrigada pela compra', null, null, 4000);
  }catch(e){
    if(e && e.name === 'AbortError') return; // a pessoa desistiu
    console.warn('Compra:', e);
    toast('Não foi possível concluir a compra. Tente de novo.', null, null, 4000);
  }
}
async function restaurarCompras(){
  toast('Procurando suas compras…', null, null, 2000);
  await atualizarAcesso();
  render();
  const n = conta.planos.size;
  toast(n ? `✅ ${n === 1 ? 'Plano restaurado' : n + ' planos restaurados'}` : 'Nenhuma compra encontrada nesta conta da Google', null, null, 3500);
}

/* ---------- tela de planos (paywall) ---------- */
function abrirPlanos(foco, tipo){
  state.sheet = { type: 'planos', foco: foco || '', tipo: tipo || 'mensal' };
  openSheetHtml(htmlPlanos());
}
function htmlPlanos(){
  const s = state.sheet, tipo = s.tipo;
  const motivo = s.foco && PLANO_BY[s.foco] ? `<p class="overlay-sub">🔒 Essa função faz parte do plano <b>${PLANO_BY[s.foco].emoji} ${PLANO_BY[s.foco].nome}</b>${s.foco === 'cardapio' ? ' (ou do Dieta, ou do Completo)' : ' (ou do Completo)'}.</p>` : `<p class="overlay-sub">Listas e Receitas já são seus. Libere o resto quando quiser.</p>`;
  const cards = PLANOS.map(p => {
    const opc = p[tipo], preco = conta.precos[opc.sku] || opc.preco;
    const meu = conta.planos.has(p.id) || (p.id !== 'completo' && conta.planos.has('completo')) || (p.id === 'cardapio' && conta.planos.has('dieta'));
    const focado = s.foco === p.id || (!s.foco && p.destaque);
    return `
      <div class="plano-card ${focado ? 'foco' : ''}" style="--pc:${p.cor}">
        ${p.destaque ? '<span class="plano-tag">Mais vantajoso</span>' : ''}
        <div class="plano-top"><span class="plano-nome">${p.emoji} ${p.nome}</span><span class="plano-preco">${esc(preco)}<small>${tipo === 'mensal' ? '/mês' : ' uma vez'}</small></span></div>
        <ul class="plano-itens">${p.itens.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
        ${meu ? '<div class="plano-meu">✅ Você já tem</div>' : `<button class="cta plano-btn" data-act="pw-comprar" data-val="${opc.sku}">Quero o ${p.nome}</button>`}
      </div>`;
  }).join('');
  return `
    <p class="overlay-title">⭐ Planos Premium</p>
    ${motivo}
    <div class="prio-row plano-tipo">
      <button class="chip ${tipo === 'mensal' ? 'sel' : ''}" data-act="pw-tipo" data-val="mensal">Mensal<br/><small>cancele quando quiser</small></button>
      <button class="chip ${tipo === 'vitalicio' ? 'sel' : ''}" data-act="pw-tipo" data-val="vitalicio">Vitalício<br/><small>paga uma vez só</small></button>
    </div>
    ${cards}
    <p class="hint" style="text-align:center">Pagamento seguro pela Google Play. ${tipo === 'mensal' ? 'A assinatura renova todo mês e pode ser cancelada na Play Store.' : 'Pagamento único, sem mensalidade.'}</p>
    <div class="sheet-actions">
      <button class="ghost-btn" data-act="pw-restaurar">Já comprei · Restaurar compras</button>
      <button class="ghost-btn" data-act="sheet-close">Agora não</button>
    </div>`;
}
/* usar antes de abrir uma função paga: devolve true se pode continuar */
function liberado(funcao){
  if(temPlano(funcao)) return true;
  abrirPlanos(funcao);
  return false;
}

/* ---------- conta (login) ---------- */
function htmlEntrar(modo, msg){
  const criar = modo === 'criar';
  const semConta = abertoPelaLoja() || modoTeste() || !nuvemConfigurada();
  return `
    <div class="auth-wrap"><div class="auth-box">
      <div class="auth-logo"><img src="icon-192.png" alt="" /></div>
      <h1 class="auth-title">Lista de Compras</h1>
      <p class="auth-sub">${criar ? 'Crie sua conta para guardar suas listas e usar em mais de um celular.' : 'Entre para ver suas listas em qualquer celular.'}</p>
      ${msg ? `<p class="auth-msg">${esc(msg)}</p>` : ''}
      ${criar ? `<label class="form-label" for="au-nome">Seu nome</label>
      <input class="text-input" id="au-nome" autocomplete="given-name" placeholder="Como quer ser chamado(a)" />` : ''}
      <label class="form-label" for="au-email">E-mail</label>
      <input class="text-input" id="au-email" type="email" autocomplete="email" inputmode="email" placeholder="seuemail@exemplo.com" />
      <label class="form-label" for="au-senha">Senha</label>
      <input class="text-input" id="au-senha" type="password" autocomplete="${criar ? 'new-password' : 'current-password'}" placeholder="${criar ? 'Mínimo 6 caracteres' : 'Sua senha'}" />
      <button class="cta" style="margin-top:16px" data-act="${criar ? 'au-criar' : 'au-entrar'}">${criar ? 'Criar conta' : 'Entrar'}</button>
      ${criar ? `<button class="ghost-btn" data-act="au-tela" data-val="entrar">Já tenho conta</button>`
              : `<button class="ghost-btn" data-act="au-tela" data-val="criar">Criar conta grátis</button>
                 <button class="link-btn" data-act="au-esqueci">Esqueci minha senha</button>`}
      ${semConta ? `<button class="link-btn" data-act="au-sem-conta">Usar sem conta (só neste celular)</button>` : ''}
    </div></div>`;
}
function mostrarEntrar(modo, msg){
  if(state.sheet) closeSheet();
  state.screen = 'entrar'; state.authModo = modo || 'entrar';
  document.getElementById('app').innerHTML = htmlEntrar(state.authModo, msg);
}
function htmlSoNaLoja(){
  const play = APP_CFG.PLAY_URL;
  return `
    <div class="auth-wrap"><div class="auth-box">
      <div class="auth-logo"><img src="icon-192.png" alt="" /></div>
      <h1 class="auth-title">Lista de Compras</h1>
      <p class="auth-sub">Organize o mercado, economize e planeje o cardápio da semana. 🛒</p>
      ${play ? `<a class="cta" style="text-decoration:none" href="${esc(play)}">📲 Baixar na Google Play</a>` : `<p class="auth-msg">Em breve na Google Play.</p>`}
      <p class="hint" style="text-align:center;margin-top:14px">Sua conta ainda não tem acesso pelo navegador.${conta.user ? ` Você entrou como <b>${esc(conta.user.email)}</b>.` : ''}</p>
      ${conta.user ? `<button class="ghost-btn" data-act="au-sair">Sair desta conta</button>` : `<button class="ghost-btn" data-act="au-tela" data-val="entrar">Já tenho conta</button>`}
    </div></div>`;
}
function precisaBloquearNavegador(){
  // Fora do app da loja, só entra quem tem acesso liberado à mão (ex.: iPhone da dona do app)
  if(abertoPelaLoja() || modoTeste() || !nuvemConfigurada()) return false;
  return !(conta.user && conta.acessoWeb);
}

async function entrarOuCriar(criar){
  const email = (document.getElementById('au-email').value || '').trim();
  const senha = document.getElementById('au-senha').value || '';
  if(!/^\S+@\S+\.\S+$/.test(email)) return mostrarEntrar(criar ? 'criar' : 'entrar', 'Digite um e-mail válido.');
  if(senha.length < 6) return mostrarEntrar(criar ? 'criar' : 'entrar', 'A senha precisa ter pelo menos 6 caracteres.');
  const client = getSb(); if(!client) return mostrarEntrar('entrar', 'Sem conexão com o servidor. Tente de novo.');
  const btn = document.querySelector('[data-act="au-criar"],[data-act="au-entrar"]'); if(btn){ btn.disabled = true; btn.textContent = 'Aguarde…'; }
  try{
    if(criar){
      const nomeEl = document.getElementById('au-nome'), nome = nomeEl ? nomeEl.value.trim() : '';
      if(nome) try{ localStorage.setItem(LS_NOME, nome); }catch(e){}
      const { data, error } = await client.auth.signUp({ email, password: senha, options: { data: { nome }, emailRedirectTo: location.origin + location.pathname } });
      if(error) throw error;
      if(!data.session) return mostrarEntrar('entrar', '📧 Enviamos um e-mail de confirmação. Abra o link e depois entre aqui.');
    } else {
      const { error } = await client.auth.signInWithPassword({ email, password: senha });
      if(error) throw error;
    }
  }catch(e){
    const m = String(e && e.message || '');
    const txt = /invalid login/i.test(m) ? 'E-mail ou senha incorretos.' : /already registered/i.test(m) ? 'Esse e-mail já tem conta. Toque em "Já tenho conta".' : /email not confirmed/i.test(m) ? 'Confirme seu e-mail pelo link que enviamos.' : 'Não deu certo: ' + m;
    return mostrarEntrar(criar ? 'criar' : 'entrar', txt);
  }
}
async function esqueciSenha(){
  const email = (document.getElementById('au-email').value || '').trim();
  if(!/^\S+@\S+\.\S+$/.test(email)) return mostrarEntrar('entrar', 'Digite seu e-mail acima e toque de novo em "Esqueci minha senha".');
  const client = getSb(); if(!client) return;
  const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname + '?nova-senha=1' });
  mostrarEntrar('entrar', error ? 'Não deu certo: ' + error.message : '📧 Enviamos um link para criar uma nova senha.');
}
function limparDadosLocais(){
  try{
    COLLS.forEach(c => localStorage.removeItem(c.ls));
    [LS_DIRTY, LS_LOCAL_BACKUP, LS_ENT].forEach(k => localStorage.removeItem(k));
    Object.keys(localStorage).filter(k => k.startsWith(LS_CLOUD_BACKUP_DONE)).forEach(k => localStorage.removeItem(k));
  }catch(e){}
  COLLS.forEach(c => { state[c.field] = []; });
  conta.planos = new Set(); conta.acessoWeb = false;
}
async function sair(){
  const client = getSb();
  try{ if(client) await client.auth.signOut(); }catch(e){}
  limparDadosLocais();
  try{ localStorage.removeItem(LS_SEM_CONTA); localStorage.removeItem(LS_NOME); }catch(e){}
  conta.user = null;
  mostrarEntrar('entrar');
}
async function excluirConta(){
  const client = getSb(); if(!client || !conta.user) return;
  const { error } = await client.rpc('excluir_minha_conta');
  if(error){ toast('Não foi possível excluir agora. Tente de novo.', null, null, 4000); return; }
  closeSheet();
  await sair();
  mostrarEntrar('criar', 'Sua conta e seus dados foram apagados.');
}

/* quando entra alguém: separa os dados de pessoas diferentes no mesmo celular */
function prepararDadosDoUsuario(uid){
  let ultimo = null;
  try{ ultimo = localStorage.getItem(LS_LAST_UID); }catch(e){}
  if(ultimo && ultimo !== uid) limparDadosLocais();
  // ultimo vazio = dados de antes de existir conta: ficam e sobem para a nuvem dessa conta
  try{ localStorage.setItem(LS_LAST_UID, uid); localStorage.removeItem(LS_SEM_CONTA); }catch(e){}
}
function contaUid(){ return conta.user ? conta.user.id : null; }

/* ---------- janela "Minha conta" ---------- */
function abrirConta(){
  state.sheet = { type: 'conta' };
  const meus = PLANOS.filter(p => conta.planos.has(p.id));
  const email = APP_CFG.SUPORTE_EMAIL;
  openSheetHtml(`
    <p class="overlay-title">👤 Minha conta</p>
    <p class="overlay-sub">${conta.user ? `Entrou como <b>${esc(conta.user.email)}</b>` : 'Usando sem conta: seus dados ficam só neste celular.'}</p>
    <div class="plano-card" style="--pc:var(--navy)">
      <div class="plano-top"><span class="plano-nome">Seu plano</span></div>
      <p style="margin:6px 0 0;font-weight:700">${meus.length ? meus.map(p => p.emoji + ' ' + p.nome).join(' · ') : '🟢 Básico: Listas + Receitas'}</p>
    </div>
    <div class="sheet-actions">
      <button class="cta" data-act="pw-abrir">⭐ Ver planos Premium</button>
      <button class="ghost-btn" data-act="pw-restaurar">Restaurar compras</button>
      ${conta.user ? `<button class="ghost-btn" data-act="au-sair">Sair da conta</button>` : nuvemConfigurada() ? `<button class="ghost-btn" data-act="au-tela" data-val="criar">Criar conta e guardar na nuvem</button>` : ''}
      <a class="link-btn" href="privacidade.html" target="_blank" rel="noopener">Política de privacidade</a>
      ${email ? `<a class="link-btn" href="mailto:${esc(email)}">Falar com o suporte</a>` : ''}
      ${conta.user ? `<button class="link-btn" style="color:#B3261E" data-act="au-excluir">Excluir minha conta</button>` : ''}
      <button class="ghost-btn" data-act="sheet-close">Fechar</button>
    </div>`);
}
function confirmarExclusao(){
  state.sheet = { type: 'conta-excluir' };
  openSheetHtml(`
    <p class="overlay-title">Excluir conta?</p>
    <p class="overlay-sub">Isso apaga sua conta e <b>todas</b> as suas listas, receitas e cardápios da nuvem. Não dá para desfazer.<br/><br/>Assinaturas da Google Play precisam ser canceladas na Play Store.</p>
    <div class="sheet-actions">
      <button class="danger-btn" data-act="au-excluir-sim">Sim, excluir tudo</button>
      <button class="ghost-btn" data-act="sheet-close">Cancelar</button>
    </div>`);
}

/* ---------- cliques desta parte ---------- */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if(!el) return;
  const act = el.dataset.act, val = el.dataset.val;
  switch(act){
    case 'pw-abrir': abrirPlanos(); break;
    case 'pw-plano': abrirPlanos(val); break;
    case 'pw-tipo': if(state.sheet && state.sheet.type === 'planos'){ state.sheet.tipo = val; openSheetHtml(htmlPlanos()); } break;
    case 'pw-comprar': comprar(val); break;
    case 'pw-restaurar': restaurarCompras(); break;
    case 'nav-conta': abrirConta(); break;
    case 'au-tela': closeSheet(); mostrarEntrar(val); break;
    case 'au-entrar': entrarOuCriar(false); break;
    case 'au-criar': entrarOuCriar(true); break;
    case 'au-esqueci': esqueciSenha(); break;
    case 'au-sair': closeSheet(); sair(); break;
    case 'au-excluir': confirmarExclusao(); break;
    case 'au-excluir-sim': excluirConta(); break;
    case 'au-sem-conta':
      try{ localStorage.setItem(LS_SEM_CONTA, '1'); }catch(e){}
      state.screen = 'home'; render();
      break;
  }
});
document.addEventListener('keydown', e => {
  if(e.key === 'Enter' && state.screen === 'entrar' && /^au-/.test(e.target.id || '')){
    e.preventDefault(); entrarOuCriar(state.authModo === 'criar');
  }
});

/* ---------- nova senha (link do e-mail) ---------- */
async function talvezNovaSenha(client){
  if(!new URLSearchParams(location.search).has('nova-senha')) return;
  const senha = prompt('Digite sua nova senha (mínimo 6 caracteres):');
  if(senha && senha.length >= 6){
    const { error } = await client.auth.updateUser({ password: senha });
    toast(error ? 'Não deu certo: ' + error.message : '✅ Senha alterada', null, null, 3500);
  }
  history.replaceState(null, '', location.pathname);
}

/* ---------- início ---------- */
async function iniciarConta(){
  abertoPelaLoja();
  lerAcessoGuardado();
  carregarPrecos();
  const client = getSb();
  if(!client){ // sem Supabase configurado: app funciona só no celular
    conta.pronta = true; render(); syncNow(); atualizarAcesso().then(() => safeRender());
    return;
  }
  let sessao = null;
  try{ sessao = (await client.auth.getSession()).data.session; }catch(e){}
  conta.user = sessao ? sessao.user : null;
  if(conta.user) prepararDadosDoUsuario(conta.user.id);
  conta.pronta = true;

  client.auth.onAuthStateChange((evento, s) => {
    const antes = contaUid();
    conta.user = s ? s.user : null;
    if(conta.user && conta.user.id !== antes){
      prepararDadosDoUsuario(conta.user.id);
      COLLS.forEach(c => { state[c.field] = c.normalize(loadColl(c.ls)); });
      state.screen = 'home';
      atualizarAcesso().then(() => { if(precisaBloquearNavegador()) document.getElementById('app').innerHTML = htmlSoNaLoja(); else { render(); syncNow(); } });
    }
  });
  await talvezNovaSenha(client);

  let semConta = false;
  try{ semConta = localStorage.getItem(LS_SEM_CONTA) === '1'; }catch(e){}
  if(!conta.user && !semConta){ mostrarEntrar(abertoPelaLoja() ? 'criar' : 'entrar'); return; }

  render();
  await atualizarAcesso();
  if(precisaBloquearNavegador()){ document.getElementById('app').innerHTML = htmlSoNaLoja(); return; }
  safeRender();
  syncNow();
}
