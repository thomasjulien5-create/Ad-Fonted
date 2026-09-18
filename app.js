const API = 'https://categpt.chat/api/v1/feast';
const API_ALT = 'https://categpt.chat/api/liturgical';
let selected = new Date();
let currentPayload = null;
let currentMassCommentaryData = null;
let deferredPrompt = null;

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

function isoLocal(date) { const y=date.getFullYear(); const m=String(date.getMonth()+1).padStart(2,'0'); const d=String(date.getDate()).padStart(2,'0'); return `${y}-${m}-${d}`; }
function mdKey(date) { return `${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
function formatDate(date) { return new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(date); }
function stripUnsafe(html='') { const tpl=document.createElement('template'); tpl.innerHTML=html; tpl.content.querySelectorAll('script,style,iframe,object,embed').forEach(n=>n.remove()); tpl.content.querySelectorAll('*').forEach(el=>[...el.attributes].forEach(a=>{ if(a.name.startsWith('on')) el.removeAttribute(a.name); })); return tpl.innerHTML; }

function canonicalLitColor(color='') {
  const raw=String(color||'').trim().toLowerCase();
  const aliases={
    blanc:'blanc',white:'blanc',albus:'blanc',
    rouge:'rouge',red:'rouge',ruber:'rouge',
    vert:'vert',green:'vert',viridis:'vert',
    violet:'violet',purple:'violet',violaceus:'violet',
    rose:'rose',pink:'rose',rosaceus:'rose',
    noir:'noir',black:'noir',niger:'noir'
  };
  return aliases[raw]||'';
}
function litColor(color='') {
  const map={blanc:'#f4ecd3',rouge:'#8d3b36',vert:'#365d47',violet:'#5a4669',rose:'#b56f81',noir:'#272727'};
  return map[canonicalLitColor(color)] || '#a98745';
}
function litColorLabel(color='') {
  const c=canonicalLitColor(color);
  const labels={blanc:'Blanc',rouge:'Rouge',vert:'Vert',violet:'Violet',rose:'Rose',noir:'Noir'};
  return labels[c]||'';
}
function litColorMeaning(color='') {
  const meanings={
    blanc:'Lumière · joie · pureté · gloire',
    rouge:'Feu de l’Esprit · charité · sang du martyre',
    vert:'Espérance · croissance · persévérance',
    violet:'Pénitence · conversion · attente',
    rose:'Joie au cœur de l’attente et de la pénitence',
    noir:'Deuil · mort · prière pour les défunts'
  };
  return meanings[canonicalLitColor(color)]||'';
}
function setLiturgicalBanner(color, loading=false){
  const value=litColor(color);
  const canonical=canonicalLitColor(color);
  document.documentElement.style.setProperty('--liturgical',value);
  const hero=$('#liturgicalHero');
  if(hero) hero.dataset.color=canonical||'';
  const label=$('#liturgicalColorName');
  if(label) label.textContent=loading?'Sens de la couleur liturgique…':canonical?litColorMeaning(color):'Sens de la couleur liturgique';
}

async function fetchLiturgicalDay(iso){
  const urls=[`${API}?date=${iso}&locale=fr`,`${API_ALT}/${iso}?locale=fr`];
  let lastError=null;
  for(const url of urls){
    try{
      const r=await fetch(url,{headers:{'Accept':'application/json'},cache:'no-store'});
      if(!r.ok) throw new Error(`HTTP ${r.status}`);
      const data=await r.json();
      if(data?.vom) return data;
      throw new Error('Aucune donnée Vetus Ordo pour ce jour.');
    }catch(err){ lastError=err; }
  }
  throw lastError||new Error('Données liturgiques indisponibles.');
}

async function loadDay() {
  const iso=isoLocal(selected);
  currentMassCommentaryData=null;
  $('#displayDate').textContent=formatDate(selected); $('#datePicker').value=iso;
  $('#feastName').textContent='Chargement…'; $('#feastMeta').textContent=''; $('#commemoration').textContent='';
  $('#massReadings').innerHTML='<div class="reading-card">Chargement des textes…</div>';
  $('#massCommentary').innerHTML='<div class="reading-card">Chargement du commentaire…</div>';
  setLiturgicalBanner('',true);
  renderMeditation();
  renderMassCommentary(iso);
  try {
    const data=await fetchLiturgicalDay(iso);
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
  setLiturgicalBanner(vom.color);
  renderMass(vom.mass||[]);
}

function normalizeMassSections(data){
  if(!data) return [];
  if(Array.isArray(data.sections)) return data.sections;
  const sections=[];
  if(data.epistle) sections.push({label:'Épître',key:'epistle',...data.epistle});
  if(data.reading) sections.push({label:'Lecture',key:'reading',...data.reading});
  if(data.gospel) sections.push({label:'Évangile',key:'gospel',...data.gospel});
  return sections;
}

function findCramponSection(reading){
  const sections=normalizeMassSections(currentMassCommentaryData);
  const key=String(reading.key||'').toLowerCase();
  return sections.find(s=>{
    const skey=String(s.key||'').toLowerCase();
    if(skey && skey===key) return true;
    if(s.ref && reading.ref && s.ref===reading.ref) return true;
    const label=String(s.label||'').toLowerCase();
    if(key==='epistle' && label.includes('épître')) return true;
    if(key==='gospel' && label.includes('évangile')) return true;
    if((key==='reading'||key==='lesson'||key.startsWith('lesson_')) && (label.includes('lecture')||label.includes('leçon'))) return true;
    return false;
  });
}

function readingTextHtml(value){
  if(Array.isArray(value)) return value.map(p=>`<p>${stripUnsafe(p)}</p>`).join('');
  return stripUnsafe(value||'');
}

function cramponSourceLine(section){
  const source=section?.cramponSource;
  if(!source) return '';
  const label=source.label||'Bible Crampon 1923';
  const url=(source.url||'').startsWith('http')?source.url:'';
  return `<div class="reading-source">Source : ${url?`<a href="${url}" target="_blank" rel="noopener">${label}</a>`:label}</div>`;
}

function renderMass(items){
  const accepted=x=>['epistle','reading','gospel','lesson','sequence','hymn','sequentia','hymnus'].includes(x.key)||/^lesson_\d+$/.test(x.key||'');
  const readings=items.filter(accepted);
  $('#massReadings').innerHTML=readings.length?readings.map((x,i)=>readingCard(x,i,'mass')).join(''):'<div class="error">Les lectures de la messe ne sont pas disponibles dans la réponse du jour.</div>';
  bindLatinToggles();
}

function readingCard(x,i,prefix){
  const section=findCramponSection(x);
  const hasCrampon=Boolean(section?.cramponText);
  const french=hasCrampon?readingTextHtml(section.cramponText):readingTextHtml(x.text||'');
  const sourceLine=hasCrampon?cramponSourceLine(section):'<div class="reading-source provisional">Source : texte liturgique du jour · traduction française provisoire.</div>';
  const latin=x.source?.text?`<button class="latin-toggle" data-target="${prefix}-la-${i}">Afficher le latin</button><div id="${prefix}-la-${i}" class="latin liturgical-text">${stripUnsafe(x.source.text)}</div>`:'';
  return `<article class="reading-card"><div class="ref">${x.ref||section?.ref||''}</div><h3>${x.label||section?.label||x.key}</h3><div class="liturgical-text">${french}</div>${sourceLine}${latin}</article>`;
}
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

function massSources(sources=[]){
  if(!sources.length) return '';
  return `<div class="mass-sources">Sources<ul>${sources.map(s=>{
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
    if(r.ok){
      const data=await r.json();
      currentMassCommentaryData=data;
      paintMassCommentary(data);
      if(currentPayload?.vom) renderMass(currentPayload.vom.mass||[]);
      return;
    }
  } catch(_) {}
  currentMassCommentaryData=null;
  $('#massCommentary').innerHTML='<div class="reading-card commentary-pending"><strong>Commentaire non encore archivé.</strong><p>Les sources patristiques et thomistes de cette journée n’ont pas encore été vérifiées et intégrées.</p></div>';
}

function renderError(message){
  $('#feastName').textContent='Données indisponibles';
  $('#feastMeta').textContent=message;
  setLiturgicalBanner('');
  $('#massReadings').innerHTML='<div class="error">Impossible de charger les textes liturgiques. Le commentaire sourcé, lorsqu’il est archivé, reste disponible ci-dessous.</div>';
}
function switchView(name){ $$('.view').forEach(v=>v.classList.remove('active')); $$('.nav-btn').forEach(b=>b.classList.remove('active')); $(`#view-${name}`).classList.add('active'); $(`.nav-btn[data-view="${name}"]`).classList.add('active'); window.scrollTo({top:0,behavior:'smooth'}); }
$$('.nav-btn').forEach(b=>b.addEventListener('click',()=>switchView(b.dataset.view))); $$('[data-go]').forEach(b=>b.addEventListener('click',()=>switchView(b.dataset.go)));
$('#prevDay').onclick=()=>{ selected.setDate(selected.getDate()-1); loadDay(); }; $('#nextDay').onclick=()=>{ selected.setDate(selected.getDate()+1); loadDay(); };
$('#datePicker').onchange=e=>{ const [y,m,d]=e.target.value.split('-').map(Number); selected=new Date(y,m-1,d,12); loadDay(); };
window.addEventListener('beforeinstallprompt',e=>{ e.preventDefault(); deferredPrompt=e; $('#installBtn').classList.remove('hidden'); });
$('#installBtn').onclick=async()=>{ if(!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt=null; $('#installBtn').classList.add('hidden'); };
if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js',{updateViaCache:'none'}).then(r=>r.update()).catch(()=>{}));
loadDay();
