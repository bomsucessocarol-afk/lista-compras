// Lê a foto de um produto (etiqueta, embalagem ou print de site) com IA
// e devolve nome, marca, peso/tamanho e preço em formato organizado.
// A chave fica guardada na Vercel (variável ANTHROPIC_API_KEY) — nunca no app.

const MODEL = 'claude-haiku-5-5';
const CATEGORIAS = ['hortifruti', 'acougue', 'padaria', 'laticinios', 'mercearia', 'bebidas', 'limpeza', 'higiene', 'outros'];

const PROMPT = `Você lê fotos de produtos de supermercado: etiquetas de prateleira, embalagens, panfletos ou prints de sites/apps de mercado.
Liste TODOS os produtos que aparecem com nome legível (máximo 10).

Responda SOMENTE com JSON, sem nenhum texto antes ou depois, neste formato:
{"produtos":[{"nome":"Asa de frango congelada","marca":"Friato","tamanho":920,"unidade_tamanho":"g","preco":17.94,"preco_por_kg":19.5,"categoria":"acougue"}]}

Regras:
- "nome": o tipo do produto em português, curto, SEM a marca e SEM o peso (ex: "Leite integral", "Meio da asa de frango congelado").
- "marca": só a marca (ex: "Italac", "Avenorte"). null se não aparecer.
- "tamanho" e "unidade_tamanho": peso/volume da embalagem. unidade_tamanho só pode ser "g", "kg", "ml" ou "L". Ignore palavras como "aprox.". null se não aparecer.
- "preco": o preço que o cliente paga por 1 unidade/embalagem, como número (17,94 vira 17.94). Se houver preço "de/por", use o menor (o atual). null se não aparecer.
- "preco_por_kg": preço por kg ou por litro, se aparecer (ex: "R$ 19,50/Kg" vira 19.5). null se não houver.
- Se o produto é vendido a granel (só tem preço por kg, sem preço de embalagem), deixe "preco" null e preencha "preco_por_kg".
- "categoria": uma destas: ${CATEGORIAS.join(', ')}.
- Ignore botões e avisos (ex: "Adicionar ao carrinho", "Limitado a 10 unidades").
- Não invente: se algo não estiver legível, use null.
- Se não houver nenhum produto, responda {"produtos":[]}.`;

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.'));
  return Number.isFinite(n) && n > 0 && n < 100000 ? Math.round(n * 1000) / 1000 : null;
}
function txt(v, max) {
  const s = v === null || v === undefined ? '' : String(v).replace(/\s+/g, ' ').trim();
  return s && s.toLowerCase() !== 'null' ? s.slice(0, max) : null;
}
function limpar(lista) {
  return (Array.isArray(lista) ? lista : []).slice(0, 10).map(p => {
    const un = String(p && p.unidade_tamanho || '').toLowerCase();
    return {
      nome: txt(p && p.nome, 60),
      marca: txt(p && p.marca, 40),
      tamanho: num(p && p.tamanho),
      unidade_tamanho: un === 'g' || un === 'kg' || un === 'ml' ? un : (un === 'l' ? 'L' : null),
      preco: num(p && p.preco),
      preco_por_kg: num(p && p.preco_por_kg),
      categoria: CATEGORIAS.includes(p && p.categoria) ? p.categoria : null,
    };
  }).filter(p => p.nome);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'use POST' });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(501).json({ erro: 'sem_chave' });

  // Só aceita pedidos vindos do próprio app (evita outras páginas gastarem seus créditos)
  const origin = req.headers.origin || '';
  if (origin && !/^https:\/\/lista-compras[\w-]*\.vercel\.app$/.test(origin) && !/^http:\/\/localhost(:\d+)?$/.test(origin)) {
    return res.status(403).json({ erro: 'origem' });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
  const m = /^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=]+)$/.exec((body && body.image) || '');
  if (!m) return res.status(400).json({ erro: 'imagem' });
  if (m[2].length > 3500000) return res.status(413).json({ erro: 'imagem grande' });

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: m[1], data: m[2] } },
            { type: 'text', text: PROMPT },
          ],
        }],
      }),
    });
    if (!r.ok) {
      const detalhe = await r.text();
      console.error('Anthropic', r.status, detalhe.slice(0, 500));
      return res.status(502).json({ erro: 'ia', status: r.status });
    }
    const data = await r.json();
    const texto = (data.content || []).filter(c => c.type === 'text').map(c => c.text).join('');
    const ini = texto.indexOf('{'), fim = texto.lastIndexOf('}');
    let produtos = [];
    if (ini >= 0 && fim > ini) {
      try { produtos = limpar(JSON.parse(texto.slice(ini, fim + 1)).produtos); } catch (e) { produtos = []; }
    }
    return res.status(200).json({ produtos });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ erro: 'falha' });
  }
};
