/* ---------- NAV ---------- */
const pages = {
  welcome: document.getElementById('page-welcome'),
  sudoku: document.getElementById('page-sudoku'),
  cards: document.getElementById('page-cards'),
  bomb: document.getElementById('page-bomb'),
  success: document.getElementById('page-success')
};
function show(page){
  Object.values(pages).forEach(p => p.classList.add('hidden'));
  page.classList.remove('hidden');
}
document.getElementById('start-btn').addEventListener('click', ()=> show(pages.sudoku));

/* ---------- SUDOKU ---------- */
const solution = [
  [5,3,4,6,7,8,9,1,2],
  [6,7,2,1,9,5,3,4,8],
  [1,9,8,3,4,2,5,6,7],
  [8,5,9,7,6,1,4,2,3],
  [4,2,6,8,5,3,7,9,1],
  [7,1,3,9,2,4,8,5,6],
  [9,6,1,5,3,7,2,8,4],
  [2,8,7,4,1,9,6,3,5],
  [3,4,5,2,8,6,1,7,9]
];
const puzzle = [
  [5,3,0,0,7,0,0,0,0],
  [6,0,0,1,9,5,0,0,0],
  [0,9,8,0,0,0,0,6,0],
  [8,0,0,0,6,0,0,0,3],
  [4,0,0,8,0,3,0,0,1],
  [7,0,0,0,2,0,0,0,6],
  [0,6,0,0,0,0,2,8,0],
  [0,0,0,4,1,9,0,0,5],
  [0,0,0,0,8,0,0,7,9]
];

const table = document.getElementById('sudoku-table');
function buildSudoku(){
  table.innerHTML = '';
  for(let r=0;r<9;r++){
    const tr = document.createElement('tr');
    for(let c=0;c<9;c++){
      const td = document.createElement('td');
      if((c+1)%3===0 && c!==8) td.classList.add('thick-right');
      if((r+1)%3===0 && r!==8) td.classList.add('thick-bottom');
      const val = puzzle[r][c];
      if(val !== 0){
        const span = document.createElement('div');
        span.textContent = val;
        span.classList.add('prefilled');
        td.appendChild(span);
      } else {
        const input = document.createElement('input');
        input.setAttribute('type','text');
        input.setAttribute('maxlength','1');
        input.dataset.r = r;
        input.dataset.c = c;
        input.addEventListener('input', e => {
          const v = e.target.value.replace(/[^1-9]/g,'');
          e.target.value = v;
        });
        td.appendChild(input);
      }
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  document.getElementById('sudoku-status').textContent = '';
}
buildSudoku();
document.getElementById('reset-sudoku').addEventListener('click', buildSudoku);
function readSudoku(){
  const grid = [];
  for(let r=0;r<9;r++){
    grid[r] = [];
    for(let c=0;c<9;c++){
      if(puzzle[r][c] !== 0){
        grid[r][c] = puzzle[r][c];
      } else {
        const input = table.querySelector(`input[data-r="${r}"][data-c="${c}"]`);
        const v = parseInt(input.value) || 0;
        grid[r][c] = v;
      }
    }
  }
  return grid;
}
function gridsEqual(a,b){
  for(let i=0;i<9;i++) for(let j=0;j<9;j++) if(a[i][j] !== b[i][j]) return false;
  return true;
}
document.getElementById('check-sudoku').addEventListener('click', ()=>{
  const user = readSudoku();
  const status = document.getElementById('sudoku-status');
  for(let r=0;r<9;r++){
    for(let c=0;c<9;c++){
      if(user[r][c] < 1 || user[r][c] > 9){
        status.innerHTML = '<span class="bad">Please fill every cell with numbers 1–9.</span>';
        return;
      }
    }
  }
  if(gridsEqual(user, solution)){
    status.innerHTML = '<span class="ok">Correct! Great job — moving to the next task.</span>';
    setTimeout(()=> show(pages.cards), 900);
  } else {
    status.innerHTML = '<span class="bad">Not quite right — double check your numbers.</span>';
  }
});

/* ---------- CARD QUIZ ---------- */
const quizArea = document.getElementById('quiz-area');
const quizStatus = document.getElementById('quiz-status');
const questions = [
  {q: "Probability of drawing an Ace from a standard 52-card deck?", a: "1/13"},
  {q: "Probability of drawing a Heart?", a: "1/4"},
  {q: "Probability of drawing a Red card?", a: "1/2"},
  {q: "Probability of drawing a King or a Queen?", a: "2/13"},
  {q: "Probability of drawing a face card (J, Q, K)?", a: "3/13"}
];
function normalizeFraction(str){
  str = (''+str).trim();
  if(str.includes('.')){
    const val = parseFloat(str);
    if(isNaN(val)) return null;
    const tol = 1e-6;
    for(let den=1; den<=1000; den++){
      const num = Math.round(val * den);
      if(Math.abs(num/den - val) < tol){
        const g = gcd(num, den);
        return [num/g, den/g];
      }
    }
    return null;
  }
  if(str.includes('/')){
    const parts = str.split('/');
    if(parts.length!==2) return null;
    const n = parseInt(parts[0]); const d = parseInt(parts[1]);
    if(isNaN(n)||isNaN(d)||d===0) return null;
    const g = gcd(Math.abs(n), Math.abs(d));
    return [n/g, d/g];
  }
  const n = parseInt(str);
  if(!isNaN(n)) return [n,1];
  return null;
}
function gcd(a,b){ if(b===0) return a; return gcd(b,a%b); }
function fractionEquals(userStr, targetStr){
  const u = normalizeFraction(userStr);
  const t = normalizeFraction(targetStr);
  if(!u || !t) return false;
  return u[0]*t[1] === t[0]*u[1];
}
function buildQuiz(){
  quizArea.innerHTML = '';
  for(let i=0;i<questions.length;i++){
    const div = document.createElement('div');
    div.className = 'question';
    div.innerHTML = `<div style="font-weight:600">Q${i+1}.</div><div style="margin-top:6px">${questions[i].q}</div><div style="margin-top:8px"><input class="small" type="text" id="ans-${i}" placeholder="e.g. 1/13 or 0.0769"></div>`;
    quizArea.appendChild(div);
  }
  quizStatus.textContent = '';
}
buildQuiz();
document.getElementById('reset-quiz').addEventListener('click', buildQuiz);
document.getElementById('check-quiz').addEventListener('click', ()=>{
  let allCorrect = true;
  let anyEmpty = false;
  for(let i=0;i<questions.length;i++){
    const val = document.getElementById(`ans-${i}`).value.trim();
    if(val === '') { anyEmpty = true; allCorrect = false; continue;}
    if(!fractionEquals(val, questions[i].a)) allCorrect = false;
  }
  if(anyEmpty){
    quizStatus.innerHTML = '<span class="bad">Please answer all 5 questions.</span>';
    return;
  }
  if(allCorrect){
    quizStatus.innerHTML = '<span class="ok">All answers correct! Proceeding to the final task.</span>';
    setTimeout(()=> show(pages.bomb), 900);
  } else {
    quizStatus.innerHTML = '<span class="bad">Some answers are incorrect — double-check the fractions/decimals.</span>';
  }
});

/* ---------- BOMB ---------- */
const timerEl = document.getElementById('bomb-timer');
const wiresEl = document.getElementById('wires');
const explosionEl = document.getElementById('explosion');
let bombInterval = null;
let bombTimeLeft = 60;
let bombActive = false;
function startBomb(){
  bombTimeLeft = 60;
  updateTimerDisplay();
  explosionEl.style.display = 'none';
  bombActive = true;
  Array.from(wiresEl.children).forEach(w => {
    w.style.pointerEvents = 'auto';
    w.classList.remove('disabled');
  });
  if(bombInterval) clearInterval(bombInterval);
  bombInterval = setInterval(()=>{
    bombTimeLeft--;
    updateTimerDisplay();
    if(bombTimeLeft <= 0){
      clearInterval(bombInterval);
      bombActive = false;
      triggerExplosion();
    }
  }, 1000);
}
function updateTimerDisplay(){
  const mm = String(Math.floor(bombTimeLeft/60)).padStart(2,'0');
  const ss = String(bombTimeLeft%60).padStart(2,'0');
  timerEl.textContent = `${mm}:${ss}`;
}
function triggerExplosion(){
  explosionEl.style.display = 'block';
  explosionEl.style.animation = 'none';
  void explosionEl.offsetWidth;
  explosionEl.style.animation = 'boom 700ms ease-out forwards';
  Array.from(wiresEl.children).forEach(w => w.style.pointerEvents = 'none');
  setTimeout(()=> {
    explosionEl.style.display = 'none';
    setTimeout(() => { startBomb(); }, 700);
  }, 900);
}
wiresEl.addEventListener('click', e=>{
  const target = e.target.closest('.wire');
  if(!target || !bombActive) return;
  Array.from(wiresEl.children).forEach(w => w.style.pointerEvents = 'none');
  target.textContent = target.textContent + ' — CUT';
  bombActive = false;
  clearInterval(bombInterval);
  setTimeout(()=> show(pages.success), 900);
});
const origShow = show;
show = function(page){
  origShow(page);
  if(page === pages.bomb) startBomb();
  if(page === pages.success){
    if(bombInterval) clearInterval(bombInterval);
  }
};
document.getElementById('restart-all').addEventListener('click', ()=>{
  buildSudoku();
  buildQuiz();
  show(pages.welcome);
});
