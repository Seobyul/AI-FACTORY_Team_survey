const JOB_KEYS = ['nurse','teacher','crew','police','athlete'];
const PRIORITY  = ['nurse','teacher','crew','police','athlete'];

const JOB_INFO = {
  nurse:   { label: '간호사',   desc: '배려·공감, 꼼꼼함과 인내심을 중시하는 유형.' },
  teacher: { label: '선생님',   desc: '설명·코칭, 협력과 관계 형성을 즐기는 유형.' },
  crew:    { label: '승무원',   desc: '대인 서비스와 적응력이 뛰어난 글로벌 지향 유형.' },
  police:  { label: '경찰',     desc: '규칙과 정의감을 중시하며 위기 대처에 강한 유형.' },
  athlete: { label: '운동선수', desc: '체력·도전, 경쟁과 성과를 즐기는 유형.' }
};



let idx = 0;
let gender = null;
const score = { nurse:0, teacher:0, crew:0, police:0, athlete:0 };
let lastDominantJob = null;

const sections = Array.from(document.querySelectorAll('section.question'));
const progress = document.getElementById('progress');
const resultEl = document.getElementById('result');
const resultTitle  = document.getElementById('result-title');
const resultDesc   = document.getElementById('result-desc');
const resultScores = document.getElementById('result-scores');
const retryBtn     = document.getElementById('retryBtn');

const introSection = document.getElementById('intro');
const startBtn = introSection.querySelector('button[data-skip="true"]');

sections.forEach(sec => sec.hidden = true);
progress.style.display = "none";

startBtn.addEventListener('click', () => {
  introSection.hidden = true;
  idx = 0;
  showSection(idx);
});

function updateProgress(current, total) {
  const progress = document.getElementById("progress");
  let bar = progress.querySelector(".bar");

  if (!bar) {
    bar = document.createElement("div");
    bar.className = "bar";
    progress.appendChild(bar);
  }

  const percent = Math.round((current / total) * 100);
  bar.style.width = percent + "%";
  progress.style.display = "block";
}

function showSection(i){
  sections.forEach((sec, n)=> sec.hidden = n !== i);
  resultEl.hidden = true;
  updateProgress(i, 11);
}

function hideAllQuestions(){
  sections.forEach(sec => sec.hidden = true);
}

function onAnswer(n, el){
  if (el.dataset.skip === "true") {
    gender = el.dataset.gender || null;
    idx++;
    showSection(idx);
    return;
  }

  const ds = el.dataset;
  let dominant = null, dominantScore = -Infinity;

  JOB_KEYS.forEach(key => {
    const v = Number(ds[key] || 0);
    if (v > 0) {
      score[key] += v;
      if (v > dominantScore) {
        dominantScore = v;
        dominant = key;
      }
    }
  });

  if (n === sections.length - 1) {
    lastDominantJob = dominant;
    finalize();
  } else {
    idx++;
    showSection(idx);
  }
}

function finalize(){
  hideAllQuestions();
  progress.style.display = "none";

  const maxVal = Math.max(...Object.values(score));
  let candidates = Object.entries(score)
    .filter(([,v]) => v === maxVal)
    .map(([k]) => k);

  if (candidates.length > 1 && lastDominantJob && candidates.includes(lastDominantJob)) {
    candidates = [lastDominantJob];
  }

  if (candidates.length > 1) {
    candidates.sort((a,b)=> PRIORITY.indexOf(a) - PRIORITY.indexOf(b));
    candidates = [candidates[0]];
  }

  const key = candidates[0];
  const info = JOB_INFO[key];

  resultTitle.textContent = `추천 직업: ${info.label}`;
  resultDesc.textContent  = info.desc;

  resultEl.hidden = false;
  resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetAll(){
  idx = 0; gender = null; lastDominantJob = null;
  JOB_KEYS.forEach(k => score[k] = 0);
  showSection(idx);
  resultEl.hidden = true;
  resultTitle.textContent = '';
  resultDesc.textContent = '';
  resultScores.textContent = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 이벤트 바인딩
sections.forEach((sec, n)=>{
  sec.querySelectorAll('.option').forEach(opt=>{
    opt.addEventListener('click', ()=> onAnswer(n, opt));
  });
});

retryBtn.addEventListener('click', resetAll);
