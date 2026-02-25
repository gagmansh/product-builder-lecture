// ======= 설정 =======
const SET_COUNT = 5;
const NUM_PER_SET = 6;
const MIN = 1;
const MAX = 45;

// ======= 유틸 =======
function randInt(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawOneSet(){
  const picked = new Set();
  while(picked.size < NUM_PER_SET){
    picked.add(randInt(MIN, MAX));
  }
  return Array.from(picked).sort((a,b) => a - b);
}

function colorClass(n){
  if(n <= 10) return "c1";
  if(n <= 20) return "c2";
  if(n <= 30) return "c3";
  if(n <= 40) return "c4";
  return "c5";
}

function formatSetText(nums){
  return nums.join(", ");
}

function showToast(msg){
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 1100);
}

async function copyText(text){
  try{
    await navigator.clipboard.writeText(text);
    showToast("복사 완료");
  }catch(e){
    // fallback
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    showToast("복사 완료");
  }
}

// ======= 테마 =======
function getTheme(){
  return localStorage.getItem("lotto_theme") || "dark";
}
function setTheme(theme){
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("lotto_theme", theme);
  updateThemeButton(theme);
}
function toggleTheme(){
  const next = (getTheme() === "dark") ? "light" : "dark";
  setTheme(next);
}
function updateThemeButton(theme){
  const btn = document.getElementById("btnTheme");
  btn.textContent = theme === "dark" ? "🌙 다크" : "☀️ 라이트";
  btn.setAttribute("aria-label", "테마 전환");
}

// ======= 렌더링 =======
const state = {
  sets: Array.from({length: SET_COUNT}, () => drawOneSet()),
  lastDrawAt: null
};

function render(){
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  state.sets.forEach((nums, idx) => {
    const setEl = document.createElement("div");
    setEl.className = "set";

    const head = document.createElement("div");
    head.className = "set-head";

    const title = document.createElement("div");
    title.className = "set-title";
    title.textContent = `세트 ${idx + 1}`;

    const actions = document.createElement("div");
    actions.className = "set-actions";

    const btnRedraw = document.createElement("button");
    btnRedraw.className = "btn small";
    btnRedraw.textContent = "🔁 다시 뽑기";
    btnRedraw.addEventListener("click", () => {
      state.sets[idx] = drawOneSet();
      state.lastDrawAt = new Date();
      render();
    });

    const btnCopy = document.createElement("button");
    btnCopy.className = "btn small";
    btnCopy.textContent = "📋 복사";
    btnCopy.addEventListener("click", () => {
      copyText(`세트 ${idx + 1}: ${formatSetText(state.sets[idx])}`);
    });

    actions.appendChild(btnRedraw);
    actions.appendChild(btnCopy);

    head.appendChild(title);
    head.appendChild(actions);

    const balls = document.createElement("div");
    balls.className = "balls";

    nums.forEach(n => {
      const b = document.createElement("div");
      b.className = `ball ${colorClass(n)}`;
      b.textContent = n;
      b.title = `${n}번`;
      balls.appendChild(b);
    });

    setEl.appendChild(head);
    setEl.appendChild(balls);
    grid.appendChild(setEl);
  });

  const status = document.getElementById("status");
  const now = state.lastDrawAt ? state.lastDrawAt : new Date();
  const timeText = now.toLocaleString("ko-KR");
  status.textContent = `마지막 추첨: ${timeText}`;

  const seedInfo = document.getElementById("seedInfo");
  seedInfo.textContent = `총 ${SET_COUNT}세트 · 세트당 ${NUM_PER_SET}개`;
}

// ======= 전체 이벤트 =======
document.getElementById("btnDrawAll").addEventListener("click", () => {
  state.sets = Array.from({length: SET_COUNT}, () => drawOneSet());
  state.lastDrawAt = new Date();
  render();
});

document.getElementById("btnCopyAll").addEventListener("click", () => {
  const lines = state.sets.map((nums, i) => `세트 ${i+1}: ${formatSetText(nums)}`);
  copyText(lines.join("\n"));
});

document.getElementById("btnTheme").addEventListener("click", toggleTheme);

// ======= 초기화 =======
setTheme(getTheme());
state.lastDrawAt = new Date();
render();
