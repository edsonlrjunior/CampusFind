const posts=[
{id:1,title:'Mochila preta',type:'Perdido',cat:'Acessórios',date:'30/09/2026',place:'Bloco B',desc:'Mochila preta com detalhe vermelho. Possui dois bolsos frontais.',status:'Ativa'},
{id:2,title:'Chave com chaveiro azul',type:'Encontrado',cat:'Outros',date:'29/09/2026',place:'Biblioteca',desc:'Chave encontrada próxima às mesas de estudo.',status:'Ativa'},
{id:3,title:'Carteira marrom',type:'Encontrado',cat:'Documentos',date:'25/09/2026',place:'Cantina',desc:'Carteira entregue após contato com o proprietário.',status:'Resolvida'}
];

const app=document.getElementById('app');

const card=p=>`<div class="card">
  <div class="card-top">
    <div><h3>${p.title}</h3><p class="muted">${p.cat} • ${p.place} • ${p.date}</p></div>
    <span class="tag ${p.type==='Perdido'?'lost':'found'}">${p.type}</span>
  </div>
  <p>${p.desc}</p>
  <a class="btn secondary" href="#detail/${p.id}">Ver detalhes</a>
</div>`;

function home(){
  app.innerHTML=`<section class="hero">
    <div><h1>Achados e Perdidos</h1><p class="muted">Encontre ou registre objetos dentro da universidade.</p></div>
    <a class="btn" href="#new">+ Nova publicação</a>
  </section>
  <div class="toolbar">
    <input id="q" class="input" placeholder="Buscar por objeto...">
    <select id="cat" class="select">
      <option>Todas as categorias</option>
      <option>Documentos</option><option>Eletrônicos</option><option>Acessórios</option>
      <option>Material Escolar</option><option>Outros</option>
    </select>
    <select id="type" class="select">
      <option>Todos os tipos</option><option>Perdido</option><option>Encontrado</option>
    </select>
    <button class="btn" id="search">Buscar</button>
  </div>
  <div id="results" class="cards">${posts.filter(p=>p.status==='Ativa').map(card).join('')}</div>`;

  document.getElementById('search').onclick=()=>{
    const q=document.getElementById('q').value.toLowerCase();
    const t=document.getElementById('type').value;
    const c=document.getElementById('cat').value;
    const r=posts.filter(p=>
      p.status==='Ativa' &&
      (!q||(p.title+' '+p.desc).toLowerCase().includes(q)) &&
      (t==='Todos os tipos'||p.type===t) &&
      (c==='Todas as categorias'||p.cat===c)
    );
    document.getElementById('results').innerHTML=r.length?r.map(card).join(''):'<div class="notice">Nenhum resultado encontrado.</div>';
  };
}

function login(){
  app.innerHTML=`<div class="card login">
    <div class="center"><h1>Entrar</h1><p class="muted">Acesse sua conta do CampusFind.</p></div>
    <div class="field"><label>E-mail</label><input class="input" type="email" placeholder="nome@exemplo.com"></div>
    <div class="field"><label>Senha</label><input class="input" type="password" placeholder="••••••••"></div>
    <button class="btn" style="width:100%" onclick="alert('Login simulado no protótipo')">Entrar</button>
    <p class="center muted">Ainda não possui conta? <a href="#signup">Criar conta</a></p>
  </div>`;
}

function signup(){
  app.innerHTML=`<div class="card form-card">
    <h1>Criar conta</h1>
    <p class="muted">Cadastre seus dados para publicar objetos perdidos ou encontrados.</p>
    <div class="grid2">
      <div class="field"><label>Nome *</label><input class="input" placeholder="Nome completo"></div>
      <div class="field"><label>Telefone / Contato *</label><input class="input" placeholder="(47) 99999-9999"></div>
    </div>
    <div class="field"><label>E-mail *</label><input class="input" type="email" placeholder="nome@exemplo.com"></div>
    <div class="grid2">
      <div class="field"><label>Senha *</label><input class="input" type="password" placeholder="••••••••"></div>
      <div class="field"><label>Confirmar senha *</label><input class="input" type="password" placeholder="••••••••"></div>
    </div>
    <div class="actions">
      <a class="btn secondary" href="#login">Cancelar</a>
      <button class="btn" onclick="alert('Conta criada — simulação do protótipo')">Criar conta</button>
    </div>
  </div>`;
}

function newPost(){
  app.innerHTML=`<div class="card form-card">
    <h1>Nova publicação</h1><p class="muted">Cadastre um objeto perdido ou encontrado.</p>
    <div class="grid2">
      <div class="field"><label>Tipo *</label><select class="select"><option>Perdido</option><option>Encontrado</option></select></div>
      <div class="field"><label>Categoria *</label><select class="select"><option>Documentos</option><option>Eletrônicos</option><option>Acessórios</option><option>Material Escolar</option><option>Outros</option></select></div>
      <div class="field"><label>Título *</label><input class="input" placeholder="Ex.: Mochila preta"></div>
      <div class="field"><label>Data *</label><input class="input" type="date"></div>
    </div>
    <div class="field"><label>Local *</label><input class="input" placeholder="Ex.: Bloco B"></div>
    <div class="field"><label>Descrição *</label><textarea rows="5" placeholder="Descreva características que ajudem a identificar o objeto"></textarea></div>
    <div class="field"><label>Imagem</label><input class="input" type="file"></div>
    <div class="actions"><a class="btn secondary" href="#home">Cancelar</a><button class="btn" onclick="alert('Publicação criada — simulação do protótipo')">Publicar</button></div>
  </div>`;
}

function editPost(id){
  const p=posts.find(x=>x.id==id)||posts[0];
  app.innerHTML=`<div class="card form-card">
    <h1>Editar publicação</h1>
    <p class="muted">Atualize as informações do seu anúncio. O tipo não pode ser alterado após a criação.</p>
    <div class="grid2">
      <div class="field"><label>Tipo</label><input class="input" value="${p.type}" disabled></div>
      <div class="field"><label>Categoria *</label><select class="select">
        <option ${p.cat==='Documentos'?'selected':''}>Documentos</option>
        <option ${p.cat==='Eletrônicos'?'selected':''}>Eletrônicos</option>
        <option ${p.cat==='Acessórios'?'selected':''}>Acessórios</option>
        <option ${p.cat==='Material Escolar'?'selected':''}>Material Escolar</option>
        <option ${p.cat==='Outros'?'selected':''}>Outros</option>
      </select></div>
      <div class="field"><label>Título *</label><input class="input" value="${p.title}"></div>
      <div class="field"><label>Data *</label><input class="input" value="${p.date}"></div>
    </div>
    <div class="field"><label>Local *</label><input class="input" value="${p.place}"></div>
    <div class="field"><label>Descrição *</label><textarea rows="5">${p.desc}</textarea></div>
    <div class="field"><label>Imagem</label><input class="input" type="file"></div>
    <div class="actions">
      <a class="btn secondary" href="#mine">Cancelar</a>
      <button class="btn" onclick="alert('Alterações salvas — simulação do protótipo')">Salvar alterações</button>
    </div>
  </div>`;
}

function detail(id){
  const p=posts.find(x=>x.id==id)||posts[0];
  app.innerHTML=`<a href="#home" class="muted">← Voltar</a>
  <div class="card" style="margin-top:15px">
    <div class="details">
      <div class="photo">Imagem do objeto</div>
      <div>
        <div class="card-top"><div><h1>${p.title}</h1><p class="muted">${p.cat}</p></div><span class="tag ${p.status==='Resolvida'?'done':p.type==='Perdido'?'lost':'found'}">${p.status}</span></div>
        <p><b>Tipo:</b> ${p.type}</p><p><b>Data:</b> ${p.date}</p><p><b>Local:</b> ${p.place}</p>
        <p><b>Descrição:</b> ${p.desc}</p>
        <div class="notice"><b>Contato:</b> (47) 99999-0000 • usuario@exemplo.com</div>
      </div>
    </div>
  </div>`;
}

function mine(){
  app.innerHTML=`<section class="hero">
    <div><h1>Minhas publicações</h1><p class="muted">Acompanhe seus registros.</p></div>
    <a class="btn" href="#new">+ Nova publicação</a>
  </section>
  <div class="cards">${posts.map(p=>`<div class="card">
    <div class="card-top">
      <div><h3>${p.title}</h3><p class="muted">${p.type} • ${p.place} • ${p.date}</p></div>
      <span class="tag ${p.status==='Resolvida'?'done':''}">${p.status}</span>
    </div>
    <div class="mine-actions">
      <a class="btn secondary" href="#detail/${p.id}">Detalhes</a>
      ${p.status==='Ativa'?`<a class="btn secondary" href="#edit/${p.id}">Editar</a><button class="btn" onclick="alert('Publicação marcada como resolvida — simulação')">Marcar como resolvida</button>`:''}
    </div>
  </div>`).join('')}</div>`;
}

function route(){
  const h=location.hash.replace('#','')||'home';
  if(h==='home')home();
  else if(h==='login')login();
  else if(h==='signup')signup();
  else if(h==='new')newPost();
  else if(h==='mine')mine();
  else if(h.startsWith('detail/'))detail(h.split('/')[1]);
  else if(h.startsWith('edit/'))editPost(h.split('/')[1]);
  else home();
}

window.addEventListener('hashchange',route);
route();
