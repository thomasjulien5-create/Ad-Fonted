const API = 'https://categpt.chat/api/v1/feast';
let selected = new Date();
let currentPayload = null;
let deferredPrompt = null;

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

function isoLocal(date) { const y=date.getFullYear(); const m=String(date.getMonth()+1).padStart(2,'0'); const d=String(date.getDate()).padStart(2,'0'); return `${y}-${m}-${d}`; }
function mdKey(date) { return `${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
function formatDate(date) { return new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(date); }
function stripUnsafe(html='') { const tpl=document.createElement('template'); tpl.innerHTML=html; tpl.content.querySelectorAll('script,style,iframe,object,embed').forEach(n=>n.remove()); tpl.content.querySelectorAll('*').forEach(el=>[...el.attributes].forEach(a=>{ if(a.name.startsWith('on')) el.removeAttribute(a.name); })); return tpl.innerHTML; }
function litColor(color='') { const map={blanc:'#f7f0d8',rouge:'#8d3b36',vert:'#365d47',violet:'#5a4669',rose:'#b56f81',noir:'#272727'}; return map[color?.toLowerCase()] || '#a98745'; }

async function loadDay() {
  const iso=isoLocal(selected);
  $('#displayDate').textContent=formatDate(selected); $('#datePicker').value=iso;
  $('#feastName').textContent='Chargement…'; $('#feastMeta').textContent=''; $('#commemoration').textContent='';
  $('#massReadings').innerHTML='<div class="reading-card">Chargement des textes…</div>';
  $('#massCommentary').innerHTML='<div class="reading-card">Chargement du commentaire…</div>';
  renderMeditation();
  renderMassCommentary(iso);
  try {
    const r=await fetch(`${API}?date=${iso}&locale=fr`,{headers:{'Accept':'application/json'}});
    if(!r.ok) throw new Error(`HTTP ${r.status}`);
    const data=await r.json(); if(!data.vom) throw new Error('Aucune donnée Vetus Ordo pour ce jour.');
    currentPayload=data; renderLiturgy(data.vom); localStorage.setItem(`adfontes:${iso}`,JSON.stringify(data));
  } catch(err) {
    const cached=localStorage.getItem(`adfontes:${iso}`);
    if(cached){ currentPayload=JSON.parse(cached); renderLiturgy(currentPayload.vom); } else renderError(err.message);
  }
}

function renderLiturgy(vom) {
  $('#feastName').textContent=vom.name||'Jour liturgique';
  $('#feastMeta').textContent=[vom.rank,vom.line].filter(Boolean).join(' · ');
  $('#commemoration').textContent=vom.commemorationLine||'';
  document.documentElement.style.setProperty('--liturgical',litColor(vom.color));
  $('#massDayTitle').textContent=vom.name||'';
  renderMass(vom.mass||[]);
}
function renderMass(items){ const keys=new Set(['epistle','reading','gospel']); const readings=items.filter(x=>keys.has(x.key)); $('#massReadings').innerHTML=readings.length?readings.map((x,i)=>readingCard(x,i,'mass')).join(''):'<div class="error">Les lectures de la messe ne sont pas disponibles dans la réponse du jour.</div>'; bindLatinToggles(); }
function readingCard(x,i,prefix){ const latin=x.source?.text?`<button class="latin-toggle" data-target="${prefix}-la-${i}">Afficher le latin</button><div id="${prefix}-la-${i}" class="latin liturgical-text">${stripUnsafe(x.source.text)}</div>`:''; return `<article class="reading-card"><div class="ref">${x.ref||''}</div><h3>${x.label||x.key}</h3><div class="liturgical-text">${stripUnsafe(x.text||'')}</div>${latin}</article>`; }
function bindLatinToggles(){ $$('.latin-toggle').forEach(btn=>btn.onclick=()=>{ const target=document.getElementById(btn.dataset.target); target.classList.toggle('open'); btn.textContent=target.classList.contains('open')?'Masquer le latin':'Afficher le latin'; }); }

function paraList(value){
  if(!value) return '';
  if(Array.isArray(value)) return value.map(p=>`<p>${p}</p>`).join('');
  return `<p>${value}</p>`;
}

function paintMeditation(med){
  $('#medTitle').textContent=med.title;
  $('#medQuote').textContent=med.quote||'';
  const sourceText = med.text ? paraList(med.text) : paraList(med.body);
  const analysisText = med.analysis ? paraList(med.analysis) : paraList(med.body);
  $('#medText').innerHTML=sourceText;
  $('#medSource').textContent=med.source||'';
  $('#medAnalysis').innerHTML=analysisText;
  $('#medRefs').innerHTML=med.refs?.length ? `<strong>Références</strong><ul>${med.refs.map(r=>`<li>${r}</li>`).join('')}</ul>` : '';
  $('#medRefs').style.display=med.refs?.length?'block':'none';
  $('#medPractice').innerHTML=`<strong>Résolution :</strong> ${med.practice||''}`;
}

async function renderMeditation(){
  const key=mdKey(selected);
  try {
    const r=await fetch(`./meditations/${key}.json`,{cache:'no-store'});
    if(r.ok){ paintMeditation(await r.json()); return; }
  } catch(_) {}
  const fallback=window.MEDITATIONS?.[key];
  if(fallback){ paintMeditation(fallback); return; }
  $('#medTitle').textContent='Méditation à intégrer';
  $('#medQuote').textContent='Cette journée n’est pas encore archivée dans l’application.';
  $('#medText').innerHTML='<p>Le texte n’est pas affiché tant qu’il n’a pas été vérifié dans l’édition source. Ad Fontes ne fabrique jamais une méditation manquante.</p>';
  $('#medSource').textContent='';
  $('#medAnalysis').innerHTML='<p>Le commentaire sera ajouté en même temps que le texte vérifié.</p>';
  $('#medRefs').style.display='none';
  $('#medPractice').innerHTML='<strong>Principe éditorial :</strong> priorité à la fidélité au texte et à la vérification des dates.';
}

function normalizeMassSections(data){
  if(Array.isArray(data.sections)) return data.sections;
  const sections=[];
  if(data.epistle) sections.push({label:'Épître',...data.epistle});
  if(data.reading) sections.push({label:'Lecture',...data.reading});
  if(data.gospel) sections.push({label:'Évangile',...data.gospel});
  return sections;
}

function massSources(sources=[]){
  if(!sources.length) return '';
  return `<div class="mass-sources"><strong>Sources</strong><ul>${sources.map(s=>{
    if(typeof s==='string') return `<li>${s}</li>`;
    const label=s.label||s.title||'Source';
    const url=(s.url||'').startsWith('http')?s.url:'';
    return `<li>${url?`<a href="${url}" target="_blank" rel="noopener">${label}</a>`:label}</li>`;
  }).join('')}</ul></div>`;
}

function massCommentaryCard(section){
  return `<article class="mass-commentary-card">
    <div class="ref">${section.ref||''}</div>
    <p class="mass-author-label">${section.label||section.key||'Lecture'}</p>
    <h3>${section.title||'Commentaire'}</h3>
    <div class="prose">${paraList(section.commentary||section.analysis)}</div>
    ${massSources(section.sources)}
  </article>`;
}

function paintMassCommentary(data){
  const sections=normalizeMassSections(data);
  let html=sections.map(massCommentaryCard).join('');
  if(data.synthesis){
    html+=`<article class="mass-synthesis"><p class="med-section-title">Unité des lectures</p><div class="prose">${paraList(data.synthesis)}</div></article>`;
  }
  if(data.resolution){
    html+=`<div class="practice mass-resolution"><strong>Résolution du jour :</strong> ${data.resolution}</div>`;
  }
  $('#massCommentary').innerHTML=html||'<div class="error">Le commentaire de cette journée n’est pas encore disponible.</div>';
}

async function renderMassCommentary(iso){
  try {
    const r=await fetch(`./mass-commentaries/${iso}.json`,{cache:'no-store'});
    if(r.ok){ paintMassCommentary(await r.json()); return; }
  } catch(_) {}
  $('#massCommentary').innerHTML='<div class="reading-card commentary-pending"><strong>Commentaire non encore archivé.</strong><p>Les sources patristiques et thomistes de cette journée n’ont pas encore été vérifiées et intégrées.</p></div>';
}

function renderError(message){ $('#feastName').textContent='Données indisponibles'; $('#feastMeta').textContent=message; $('#massReadings').innerHTML='<div class="error">Impossible de charger les textes liturgiques. Vérifie la connexion Internet.</div>'; }
function switchView(name){ $$('.view').forEach(v=>v.classList.remove('active')); $$('.nav-btn').forEach(b=>b.classList.remove('active')); $(`#view-${name}`).classList.add('active'); $(`.nav-btn[data-view="${name}"]`).classList.add('active'); window.scrollTo({top:0,behavior:'smooth'}); }
$$('.nav-btn').forEach(b=>b.addEventListener('click',()=>switchView(b.dataset.view))); $$('[data-go]').forEach(b=>b.addEventListener('click',()=>switchView(b.dataset.go)));
$('#prevDay').onclick=()=>{ selected.setDate(selected.getDate()-1); loadDay(); }; $('#nextDay').onclick=()=>{ selected.setDate(selected.getDate()+1); loadDay(); };
$('#datePicker').onchange=e=>{ const [y,m,d]=e.target.value.split('-').map(Number); selected=new Date(y,m-1,d,12); loadDay(); };
window.addEventListener('beforeinstallprompt',e=>{ e.preventDefault(); deferredPrompt=e; $('#installBtn').classList.remove('hidden'); });
$('#installBtn').onclick=async()=>{ if(!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt=null; $('#installBtn').classList.add('hidden'); };
if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
loadDay();
