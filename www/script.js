const stages = [
  { id:'in',     title:'Вхід даних',   sub:'input',      x:20,
    desc:'Точка входу конвеєра. Сюди потрапляють сирі дані — наприклад, файл, запит або подія з іншої системи. На цьому етапі дані ще не перевірені й не оброблені.' },
  { id:'proc',   title:'Обробка',      sub:'process',    x:240,
    desc:'Дані трансформуються: очищуються, приводяться до потрібного формату, рахуються проміжні значення. Це «серце» конвеєра.' },
  { id:'valid',  title:'Валідація',    sub:'validate',   x:460,
    desc:'Перевірка результату обробки на коректність (типи, діапазони, обов’язкові поля). Якщо перевірка не проходить — конвеєр зупиняється з помилкою.' },
  { id:'out',    title:'Вихід',        sub:'output',     x:680,
    desc:'Готові дані передаються далі: у сховище, іншу систему або користувачу. Успішне завершення роботи конвеєра.' },
];
const NODE_W=170, NODE_H=70, Y=75;

const svg = document.getElementById('scheme');
svg.innerHTML = stages.map((s,i)=>{
  let pipe='';
  if(i>0){
    const x1=stages[i-1].x+NODE_W, x2=s.x;
    pipe = `<path class="pipe" id="pipe-${i}" d="M${x1},${Y+NODE_H/2} L${x2},${Y+NODE_H/2}" marker-end="url(#arrow)"/>`;
  }
  return `${pipe}
  <g class="node" id="node-${s.id}" data-i="${i}" style="cursor:pointer">
    <rect x="${s.x}" y="${Y}" width="${NODE_W}" height="${NODE_H}" rx="9"/>
    <text x="${s.x+16}" y="${Y+30}">${s.title}</text>
    <text class="sub" x="${s.x+16}" y="${Y+48}">${s.sub}</text>
  </g>
  <circle class="token" id="token-${i}" cx="${s.x+NODE_W/2}" cy="${Y+NODE_H/2}" r="6"/>`;
}).join('') + `
  <defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
    <path d="M0,0 L6,3 L0,6 z" fill="var(--border)"/>
  </marker></defs>`;

const infoTitle = document.getElementById('infoTitle');
const infoText = document.getElementById('infoText');
const log = document.getElementById('log');
const runBtn = document.getElementById('runBtn');
const runErrBtn = document.getElementById('runErrBtn');
const resetBtn = document.getElementById('resetBtn');

stages.forEach((s,i)=>{
  document.getElementById(`node-${s.id}`).addEventListener('click', ()=>{
    document.querySelectorAll('.node').forEach(n=>n.classList.remove('selected'));
    document.getElementById(`node-${s.id}`).classList.add('selected');
    infoTitle.textContent = s.title;
    infoText.textContent = s.desc;
  });
});

function logLine(text, cls){
  const d = document.createElement('div');
  if(cls) d.className = cls;
  d.textContent = text;
  log.appendChild(d);
  log.scrollTop = log.scrollHeight;
}

function resetVisuals(){
  document.querySelectorAll('.node').forEach(n=>n.classList.remove('active','done','error'));
  document.querySelectorAll('.pipe').forEach(p=>p.classList.remove('flowing'));
  document.querySelectorAll('.token').forEach(t=>t.style.opacity=0);
  log.innerHTML = '';
}

let running = false;
function setButtons(disabled){
  runBtn.disabled = disabled; runErrBtn.disabled = disabled;
}

async function runPipeline(failAt){
  if(running) return;
  running = true; setButtons(true);
  resetVisuals();
  logLine('> запуск конвеєра...');

  for(let i=0;i<stages.length;i++){
    const s = stages[i];
    const node = document.getElementById(`node-${s.id}`);
    const token = document.getElementById(`token-${i}`);
    if(i>0) document.getElementById(`pipe-${i}`).classList.add('flowing');
    token.style.opacity = 1;

    await new Promise(r=>setTimeout(r, 550));
    if(i>0) document.getElementById(`pipe-${i}`).classList.remove('flowing');
    node.classList.add('active');
    logLine(`[${i+1}/${stages.length}] ${s.title}: виконується...`);
    await new Promise(r=>setTimeout(r, 700));

    if(failAt === i){
      node.classList.remove('active');
      node.classList.add('error');
      logLine(`✗ помилка на етапі «${s.title}»: перевірка не пройдена, конвеєр зупинено`, 'err');
      running = false; setButtons(false);
      return;
    }
    node.classList.remove('active');
    node.classList.add('done');
    logLine(`✓ ${s.title}: успішно`, 'ok');
    token.style.opacity = 0;
  }
  logLine('> конвеєр завершив роботу успішно', 'ok');
  running = false; setButtons(false);
}

runBtn.addEventListener('click', ()=>runPipeline(-1));
runErrBtn.addEventListener('click', ()=>{
  const failAt = Math.floor(Math.random()*stages.length);
  runPipeline(failAt);
});
resetBtn.addEventListener('click', ()=>{ resetVisuals(); infoTitle.textContent='Оберіть елемент схеми'; infoText.textContent='Клікніть по будь-якому блоку на схемі, щоб побачити пояснення, що він робить.'; });