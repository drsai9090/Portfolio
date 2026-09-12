import { profile, projects, stages, tourStages } from './journey-content.js';
import { resolveRoute } from './routes.js';

const main=document.querySelector('#main'), status=document.querySelector('#scene-status'), tourPanel=document.querySelector('#tour-panel');
const media=matchMedia('(prefers-reduced-motion: reduce)');
let preference=true;
try { preference=localStorage.getItem('production-motion')!=='off'; } catch {}
let motion=preference&&!media.matches, scene=null, routeSerial=0, currentRoute={page:'home'}, disposeView=()=>{}, filter='all';
let tourActive=false, tourPlaying=false, tourIndex=0, tourTimer=null;
let flowPhase='source';
const flowLabels={source:'Source code',contributions:'Frontend · Backend · Data',merge:'Merge changes',build:'Build',test:'Run tests',deploy:'Deployment setup'};
const usesScene=page=>['home','stage','project','contact'].includes(page);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arrow='<span aria-hidden="true">↗</span>';
const tags=list=>'<div class="tags">'+list.map(t=>'<span>'+esc(t)+'</span>').join('')+'</div>';
const getStage=id=>stages.find(s=>s.id===id);
const getProject=id=>projects.find(p=>p.id===id);
const destinationFor=route=>route.page==='stage'?route.id:route.page==='project'?'project:'+route.id:null;
const stageSymbols=['▤','{ }','▥','⌘','✓','↗'];
function external(url,label,cls='text-link') {
  try { if(new URL(url).protocol!=='https:')return ''; } catch{return '';}
  return `<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ${arrow}</a>`;
}
function copyFeedback(){return '<div class="copy-feedback"><p data-copy-status role="status"></p><input data-copy-fallback readonly hidden aria-label="Select and copy this value"></div>';}
async function copyValue(button,value,label) {
  const scope=button.closest('[data-copy-scope]'), feedback=scope.querySelector('[data-copy-status]'), input=scope.querySelector('[data-copy-fallback]');
  input.hidden=true;
  try { await navigator.clipboard.writeText(value);if(scope.isConnected)feedback.textContent=label+' copied.'; }
  catch { if(scope.isConnected){feedback.textContent='Copy is unavailable here. Select the value below and copy it.';input.value=value;input.hidden=false;input.focus();input.select();} }
}
function stageLinks(selected=null) {
  return `<nav class="stage-dock" aria-label="Explore the development process">${stages.map((s,i)=>`<a href="#/stage/${s.id}" data-stage="${s.id}" style="--accent:${s.color}" ${selected===s.id?'aria-current="page"':''}><span class="stage-symbol" aria-hidden="true">${stageSymbols[i]}</span><span><small>0${i+1}</small><strong>${esc(s.title)}</strong></span><span class="dock-arrow" aria-hidden="true">↗</span></a>`).join('')}</nav>`;
}
function homeView() {
  return `<section class="home-view home-scene-first"><div class="home-copy"><h1>Full-stack<br><span>software engineer.</span></h1><p class="hero-subtitle">Web applications, APIs and data tools.</p><div class="home-actions"><button class="button primary" type="button" data-tour-start><span class="play-symbol" aria-hidden="true">▶</span> Explore workflow <span aria-hidden="true">→</span></button></div></div><div class="scene-caption" aria-hidden="true"><span>CODE TO PRODUCTION</span><strong data-flow-caption>${esc(flowLabels[flowPhase])}</strong><small>WORKFLOW DIAGRAM</small></div><div class="dock-wrap"><div class="dock-heading"><span>APPLICATION</span><span>BUILD → TEST → DEPLOY</span></div>${stageLinks()}</div></section>`;
}

function productArt(p) {
  let body='';
  if(p.id==='your-senior')body='<div class="mock-top"><i></i><i></i><i></i><b>your senior.</b><span>⌘</span></div><div class="mock-chat"><small>ASK YOUR DOCUMENTS</small><div class="mock-input">Search documents <b>↑</b></div><div class="mock-answer"><span>✦</span> Answer with source excerpts</div><div class="mock-sources"><span>↳ Source passage</span><span>↳ Document context</span></div></div>';
  if(p.id==='ubuntu-tool')body='<div class="mock-top"><i></i><i></i><i></i><b>ubuntu / configuration</b></div><div class="mock-terminal"><span>Ubuntu configuration</span><p>config.yaml <em>→</em> apply <em>→</em> validate</p><div>✓ packages</div><div>✓ hostname & timezone</div><small>system state → JSON report</small></div>';
  if(p.id==='mindful-u')body='<div class="mock-top"><i></i><i></i><i></i><b>mindful-u / interface study</b></div><div class="mock-mindful"><span class="breathe-orbit">✳</span><div><small>ACTIVITIES</small><strong>Choose an activity</strong><div class="activity-pills"><span>Focus</span><span>Relax</span><span>Sleep</span></div></div></div>';
  if(p.id==='emotion-classifier')body='<div class="mock-top"><i></i><i></i><i></i><b>text / features / prediction</b></div><div class="mock-classifier"><span>Input text</span><div class="feature-pixels">▥ ▤ ▥ ▤ ▦ ▤ ▥</div><div class="emotion-labels"><span>joy</span><span>sadness</span><span>fear</span><span>surprise</span></div><small>Per-class evaluation</small></div>';
  return `<div class="project-art art-${p.id}" aria-hidden="true">${body}<span class="art-caption">Interface mockup</span></div>`;
}
function projectCard(p,compact=false) {
  return `<a class="project-card ${compact?'compact':''}" href="#/project/${p.id}" data-project="${p.id}">${compact?`<span class="project-monogram" aria-hidden="true">${{'your-senior':'Y/S','ubuntu-tool':'>_','mindful-u':'m/u','emotion-classifier':'{x}'}[p.id]}</span>`:productArt(p)}<div class="project-card-copy"><small>${esc(p.category)}</small><h3>${esc(p.title)} ${arrow}</h3><p>${esc(p.summary)}</p>${compact?'':tags(p.stack)}</div></a>`;
}

function projectsView() {
  return `<section class="projects-view page-view"><div class="page-heading"><div><h1>Projects</h1></div><p>Selected applications, developer tools and design studies.</p></div><div class="filters" aria-label="Filter projects">${[['all','All projects'],['frontend','Frontend / UI·UX'],['backend','Backend / APIs'],['data','Data'],['delivery','Delivery']].map(([id,label])=>`<button type="button" data-filter="${id}" aria-pressed="${filter===id}">${label}</button>`).join('')}</div><div class="project-grid" id="project-grid">${filteredProjects()}</div><p class="sr-only" role="status" id="filter-status"></p></section>`;
}
function filteredProjects(){return projects.filter(p=>filter==='all'||p.districts.includes(filter)).map(p=>projectCard(p)).join('');}
function showFlow(phase) {
  if(!Object.hasOwn(flowLabels,phase))return;
  flowPhase=phase;
  const caption=document.querySelector('[data-flow-caption]');
  if(caption)caption.textContent=flowLabels[phase];
  document.querySelectorAll('.home-view [data-stage]').forEach(link=>link.classList.toggle('is-flow-active',phase==='contributions'?['frontend','backend','data'].includes(link.dataset.stage):link.dataset.stage===phase));
}

function labView() {
  return `<section class="lab-view page-view"><div class="page-heading"><div><h1>Demos</h1></div><p>Try the CSV validator with sample data.</p></div><div class="demo-lead"><span aria-hidden="true">{ csv }</span><p>Edit records, check duplicates and download the results as JSON.</p></div><div id="csv-lab"></div></section>`;
}
function aboutView() {
  return `<section class="about-view page-view"><div class="page-heading"><div><h1>About</h1></div><p>${esc(profile.intro)}</p></div>
    <div class="about-grid"><div class="about-story">${profile.story.map(p=>`<p>${esc(p)}</p>`).join('')}</div></div>
    <div class="resume-grid"><section><p class="eyebrow">EXPERIENCE</p>${profile.experience.map(r=>`<div class="resume-row"><small>${esc(r.period)}</small><h2>${esc(r.title)}</h2><strong>${esc(r.place)}</strong>${r.description?`<p>${esc(r.description)}</p>`:''}</div>`).join('')}</section><section><p class="eyebrow">EDUCATION</p>${profile.education.map(r=>`<div class="resume-row"><small>${esc(r.year)}</small><h2>${esc(r.title)}</h2><strong>${esc(r.place)}</strong></div>`).join('')}</section></div>
    <section class="about-process"><div class="section-heading"><h2>Development process</h2><a class="text-link" href="#/projects">Projects ↗</a></div>${stageLinks()}</section></section>`;
}
function contactView() {
  return `<section class="contact-view interior-view" data-copy-scope>
    <h1>Contact</h1>
    <p class="interior-intro">For work enquiries, email me or connect on LinkedIn.</p>
    <a class="email-link" href="mailto:${esc(profile.email)}">${esc(profile.email)} ${arrow}</a>
    <div class="contact-email-actions"><span class="contact-note">Email me directly.</span><button type="button" class="button quiet" data-copy-email>Copy email</button></div>${copyFeedback()}
    <div class="contact-links">${external(profile.github,'GitHub')}${external(profile.linkedin,'LinkedIn')}</div>
    <div class="contact-signature"><span class="brand-mark" aria-hidden="true">&lt;/&gt;</span><div>${esc(profile.name)}<small>FULL-STACK SOFTWARE ENGINEER</small></div></div>
  </section>`;
}


function stageView(stage) {
  const index=stages.indexOf(stage), next=stages[(index+1)%stages.length];
  return `<section class="stage-view interior-view" style="--accent:${stage.color}"><a class="back-link" href="#/" data-back-overview>← Back to overview</a><p class="eyebrow">${esc(stage.eyebrow)}</p><h1>${esc(stage.title)}<span>.</span></h1><p class="interior-intro">${esc(stage.description)}</p>${tags(stage.skills)}<section class="process-card"><p class="section-label">${index<3?'APPLICATION':'DELIVERY'}</p><div class="process-steps">${stage.steps.map((step,i)=>`<button type="button" data-step="${i}" aria-pressed="${i===0}"><span>0${i+1}</span>${esc(step.label)}</button>`).join('')}</div><p class="step-body" data-step-body aria-live="polite">${esc(stage.steps[0].body)}</p></section><div class="section-heading"><h2>Related projects</h2><span>${stage.projectIds.length} PROJECT${stage.projectIds.length===1?'':'S'}</span></div><div class="related-work">${stage.projectIds.map(id=>projectCard(getProject(id),true)).join('')}</div><a class="next-stage" href="#/stage/${next.id}" data-stage="${next.id}"><span>NEXT STAGE</span><strong>${esc(next.title)} →</strong></a></section><div class="exhibit-label" aria-hidden="true"><span>0${index+1} / DEVELOPMENT</span><strong>${esc(stage.shortDescription)}</strong></div>`;
}
function projectView(p) {
  const next=projects[(projects.indexOf(p)+1)%projects.length];
  const highlights=[p.problem,p.overview,p.outcome];
  return `<article class="project-view project-exhibit-page" data-project-id="${esc(p.id)}">
    <header class="project-header" data-copy-scope>
      <div class="project-topline"><a class="back-link" href="#/projects">← Back to projects</a><p class="eyebrow">${esc(p.category)}</p></div>
      <div class="project-heading-row"><div><h1>${esc(p.title)}</h1><p class="project-summary">${esc(p.summary)}</p></div><div class="project-actions">${external(p.repo,'View source','button primary')}<button type="button" class="button quiet" data-copy-project="${esc(p.id)}">Copy link <span aria-hidden="true">↗</span></button></div></div>
      <span class="status-tag">${esc(p.status)}</span>
      ${copyFeedback()}
    </header>
    <figure class="project-exhibit" aria-labelledby="project-exhibit-caption">
      <div class="project-exhibit-space" aria-hidden="true"><div class="project-exhibit-fallback">${productArt(p)}</div></div>
      <figcaption class="project-exhibit-caption" id="project-exhibit-caption">Interface mockup</figcaption>
    </figure>
    <div class="project-summary-cards">${['Problem','Built','Result'].map((title,i)=>`<section><span class="summary-card-icon" aria-hidden="true">${['⌁','{ }','✓'][i]}</span><h2>${title}</h2><p>${esc(highlights[i])}</p></section>`).join('')}</div>
    <section class="project-context"><div><h2>My contribution</h2><p>${esc(p.role)}</p>${tags(p.stack)}</div><div><h2>Development stages</h2><nav class="project-process-links" aria-label="Development stages in ${esc(p.title)}">${stages.filter(s=>s.projectIds.includes(p.id)).map(s=>`<a href="#/stage/${s.id}">${esc(s.title)} <span aria-hidden="true">↗</span></a>`).join('')}</nav></div></section>
    <details class="project-details"><summary>Technical details</summary><div class="project-details-body">
      <section><h2>How it works</h2><p>${esc(p.approach)}</p><ol class="architecture-flow">${p.flow.map(s=>`<li>${esc(s)}</li>`).join('')}</ol></section>
      <section><h2>Implementation decisions</h2><ul class="decision-list">${p.decisions.map(s=>`<li>${esc(s)}</li>`).join('')}</ul></section>
      <section class="boundary-note"><h2>Limitations and next steps</h2><p>${esc(p.limitations)}</p><p>${esc(p.next)}</p></section>
    </div></details>
    <a class="next-stage" href="#/project/${next.id}"><span>NEXT PROJECT</span><strong>${esc(next.title)} ↗</strong></a>
  </article>`;
}
function renderView(route) {
  if(route.page==='home')return homeView();
  if(route.page==='stage')return stageView(getStage(route.id));
  if(route.page==='projects')return projectsView();
  if(route.page==='project')return projectView(getProject(route.id));
  if(route.page==='lab')return labView();
  if(route.page==='about')return aboutView();
  if(route.page==='contact')return contactView();
  return '<section class="page-view empty-view"><p class="eyebrow">404</p><h1>Page not found</h1><a class="button primary" href="#/">Back to overview →</a></section>';
}
function clearTourTimer(){clearTimeout(tourTimer);tourTimer=null;}
function stopTour(){clearTourTimer();tourActive=false;tourPlaying=false;updateTour();}
function updateTour() {
  const focusedControl=tourPanel.contains(document.activeElement)?document.activeElement.getAttributeNames().find(name=>name.startsWith('data-tour-')):null;
  tourPanel.hidden=!tourActive;document.body.classList.toggle('tour-active',tourActive);
  if(!tourActive)return;
  const stage=getStage(tourStages[tourIndex]);
  tourPanel.dataset.step=String(tourIndex);tourPanel.dataset.playing=String(tourPlaying);
  tourPanel.innerHTML=`<div class="tour-heading"><span class="tour-orbit" aria-hidden="true">⑂</span><div><small>${tourIndex===tourStages.length-1?'TOUR COMPLETE':'WORKFLOW TOUR'}</small><strong>${esc(stage.title)} <span>${tourIndex+1} of ${tourStages.length}</span></strong></div></div><div class="tour-track" aria-hidden="true">${tourStages.map((id,i)=>`<i class="${i<=tourIndex?'is-complete':''}"></i>`).join('')}</div><div class="tour-controls"><button type="button" data-tour-prev aria-label="Previous stage" ${tourIndex===0?'disabled':''}>←</button><button type="button" data-tour-toggle aria-label="${tourPlaying?'Pause':'Play'} guided tour" aria-pressed="${!tourPlaying}" ${!motion||tourIndex===tourStages.length-1?'disabled':''}><span aria-hidden="true">${tourPlaying?'Ⅱ':'▶'}</span><span>${tourPlaying?'Pause tour':'Resume tour'}</span></button><button type="button" data-tour-next aria-label="${tourIndex===tourStages.length-1?'Restart tour':'Next stage'}">${tourIndex===tourStages.length-1?'↺':'→'}</button><button type="button" class="tour-exit" data-tour-exit>Exit <span aria-hidden="true">×</span></button></div>`;
  if(focusedControl)tourPanel.querySelector(`[${focusedControl}]:not(:disabled)`)?.focus({preventScroll:true});
}
function scheduleTour() {
  clearTourTimer();
  if(tourActive&&tourPlaying&&motion&&tourIndex<tourStages.length-1&&!document.hidden)tourTimer=setTimeout(()=>moveTour(tourIndex+1),4200);
}
function moveTour(index) {
  clearTourTimer();tourIndex=Math.max(0,Math.min(tourStages.length-1,index));if(tourIndex===tourStages.length-1)tourPlaying=false;updateTour();
  const hash='#/stage/'+tourStages[tourIndex];
  if(location.hash===hash)render();else location.hash=hash;
}
function startTour(){tourActive=true;tourPlaying=motion;tourIndex=0;moveTour(0);}
function syncMotion() {
  motion=preference&&!media.matches;document.body.classList.toggle('reduce-motion',!motion);
  const button=document.querySelector('#motion-toggle');button.setAttribute('aria-pressed',String(!motion));button.disabled=media.matches;
  button.title=media.matches?'Scene motion follows your device preference':motion?'Pause scene motion':'Resume scene motion';
  button.innerHTML=`<span aria-hidden="true">${motion?'Ⅱ':'▷'}</span><span>Scene motion ${motion?'on':'off'}</span>`;
  scene?.setMotion(motion&&usesScene(document.body.dataset.view));
  if(!motion){tourPlaying=false;clearTourTimer();}
  updateTour();
}
import('./production-scene.js').then(async({mountProduction})=>{
  scene=await mountProduction(document.querySelector('#production-canvas'),{
    reducedMotion:!motion,
    onSelect:id=>{stopTour();location.hash=id==='projects'?'/projects':id.startsWith('project:')?'/project/'+id.slice(8):'/stage/'+id;},
    onHover:id=>{document.querySelectorAll('.home-view [data-stage]').forEach(a=>a.classList.toggle('is-hovered',a.dataset.stage===id));},
    onFlowStage:showFlow,
    onProgress:t=>{document.querySelector('#journey-progress').style.transform=`scaleX(${Math.max(0,Math.min(1,t))})`;}
  });
  syncMotion();scene.travelTo(destinationFor(currentRoute),{immediate:true});status.dataset.state='ready';status.hidden=true;document.body.classList.add('scene-ready');return scene;
}).catch(()=>{
  status.dataset.state='fallback';status.hidden=false;status.textContent='3D view unavailable. Use the navigation links to browse the portfolio.';
  document.body.classList.add('scene-fallback');document.querySelector('#production-canvas').replaceChildren();return null;
});
async function render(initial=false) {
  const serial=++routeSerial, route=resolveRoute(location.hash,projects.map(p=>p.id),stages.map(s=>s.id));
  const destination=destinationFor(route);
  const title=route.page==='home'?'Full-stack Software Engineer':route.page==='stage'?getStage(route.id).title:route.page==='project'?getProject(route.id).title:({projects:'Projects',lab:'Demos',about:'About',contact:'Contact'}[route.page]||'Page not found');
  if(tourActive&&(route.page!=='stage'||route.id!==tourStages[tourIndex]))stopTour();
  clearTourTimer();disposeView();disposeView=()=>{};
  main.classList.remove('view-is-ready');main.classList.add('is-travelling');main.setAttribute('aria-busy','true');
  main.inert=!initial;
  document.body.classList.add('is-travelling');document.body.dataset.view=route.page;
  document.querySelector('#journey-label').textContent=route.page==='home'?'Returning to overview':'Moving to '+title;
  document.querySelector('#journey-progress').style.transform='scaleX(0)';
  if(initial){main.innerHTML=renderView(route);main.classList.remove('is-travelling');}
  window.scrollTo({top:0,behavior:'instant'});
  const world=scene;
  world?.setMotion(motion&&usesScene(route.page));
  const flight=world?world.travelTo(destination,{immediate:!motion||!usesScene(route.page)||(initial&&route.page==='home')}):Promise.resolve(true);
  if(!initial&&motion&&world&&usesScene(route.page))await new Promise(resolve=>setTimeout(resolve,160));
  if(serial!==routeSerial)return;
  main.innerHTML=renderView(route);currentRoute=route;document.title=title+' | '+profile.name;showFlow(flowPhase);
  document.querySelectorAll('[data-nav]').forEach(a=>{const selected=a.dataset.nav===(route.page==='project'?'projects':route.page==='stage'?'home':route.page);if(selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  await flight;if(serial!==routeSerial)return;
  main.classList.remove('is-travelling');main.classList.add('view-is-ready');main.removeAttribute('aria-busy');document.body.classList.remove('is-travelling');
  main.inert=false;
  document.querySelector('#route-status').textContent=tourActive?`${tourIndex+1} of ${tourStages.length}: ${title}`:title;
  if(!initial&&!tourPlaying&&!(tourActive&&tourPanel.contains(document.activeElement)))main.focus({preventScroll:true});
  updateTour();scheduleTour();
  if(route.page==='lab')import('./lab.js').then(({mountLab})=>{if(serial===routeSerial)disposeView=mountLab(document.querySelector('#csv-lab'))||(()=>{});}).catch(()=>{if(serial===routeSerial)document.querySelector('#csv-lab').innerHTML='<p role="alert">The demo could not load. Refresh to try again.</p>';});
}
document.addEventListener('click',event=>{
  const target=event.target;
  if(target.closest('.skip-link')){event.preventDefault();main.focus();return;}
  const copyProject=target.closest('[data-copy-project]');
  if(copyProject){const url=new URL(location.href);url.hash='/project/'+copyProject.dataset.copyProject;copyValue(copyProject,url.href,'Project link');return;}
  const copyEmail=target.closest('[data-copy-email]');
  if(copyEmail){copyValue(copyEmail,profile.email,'Email address');return;}
  if(target.closest('[data-tour-start]')){startTour();return;}
  if(target.closest('[data-tour-exit]')){stopTour();main.focus({preventScroll:true});return;}
  if(target.closest('[data-tour-prev]')){moveTour(tourIndex-1);return;}
  if(target.closest('[data-tour-next]')){if(tourIndex===tourStages.length-1)startTour();else moveTour(tourIndex+1);return;}
  if(target.closest('[data-tour-toggle]')){tourPlaying=!tourPlaying;updateTour();if(tourPlaying&&main.classList.contains('view-is-ready'))scheduleTour();else clearTourTimer();return;}
  const link=target.closest('a[href^="#/"]');
  if(link){stopTour();if(link.getAttribute('href')===location.hash){event.preventDefault();if(location.hash==='#/')scene?.travelTo(null,{immediate:!motion});}}
  const filterButton=target.closest('[data-filter]');
  if(filterButton){filter=filterButton.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===filterButton)));document.querySelector('#project-grid').innerHTML=filteredProjects();document.querySelector('#filter-status').textContent=projects.filter(p=>filter==='all'||p.districts.includes(filter)).length+' projects shown';}
  const stepButton=target.closest('[data-step]');
  if(stepButton&&currentRoute.page==='stage'){
    if(tourActive){tourPlaying=false;clearTourTimer();updateTour();}
    const step=getStage(currentRoute.id).steps[Number(stepButton.dataset.step)];
    if(step){document.querySelectorAll('[data-step]').forEach(b=>b.setAttribute('aria-pressed',String(b===stepButton)));document.querySelector('[data-step-body]').textContent=step.body;}
  }
});
document.addEventListener('pointermove',event=>{if(motion&&event.pointerType!=='touch')scene?.setPointer(event.clientX/innerWidth*2-1,event.clientY/innerHeight*2-1);},{passive:true});
document.addEventListener('pointerleave',()=>scene?.setPointer(0,0));
document.addEventListener('visibilitychange',()=>{if(document.hidden)clearTourTimer();else if(main.classList.contains('view-is-ready'))scheduleTour();});
document.querySelector('#motion-toggle').addEventListener('click',()=>{preference=!preference;try{localStorage.setItem('production-motion',preference?'on':'off');}catch{}syncMotion();});
media.addEventListener('change',syncMotion);window.addEventListener('hashchange',()=>render());
window.addEventListener('pagehide',()=>{clearTourTimer();disposeView();scene?.destroy();});
window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
syncMotion();render(true);
