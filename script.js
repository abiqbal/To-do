// ===== SELECTORS =====
const input        = document.getElementById('todo-input');
const addBtn       = document.getElementById('add-btn');
const todoList     = document.getElementById('todo-list');
const filters      = document.querySelectorAll('.filter');
const themeToggle  = document.getElementById('theme-toggle');
const themeSelect  = document.getElementById('theme-select');
const appTitle     = document.getElementById('app-title');
const greetingH2   = document.getElementById('user-greeting');
const dailyDoseTxt = document.getElementById('daily-dose-text');
const motivationP  = document.getElementById('motivation');

const themeNames = {
  "theme-focus":  "🧘 ZenBoard",
  "theme-hype":   "⚡ PowerGrid",
  "theme-hacker": "💻 Terminal Todo",
  "theme-flirty": "💖 RizzList"
};

// ===== STATE =====
let todos = JSON.parse(localStorage.getItem('todos')) || [];

// ===== HELPERS =====
function removeAllThemes() {
  Object.keys(themeNames).forEach(t => document.body.classList.remove(t));
}
function updateDailyDose() {
  const quotes = [
    "Discipline > Motivation.",
    "One task at a time. You'll win.",
    "Your future self is watching.",
    "Don't stop now.",
    "You're built for this.",
    "Make every second count.",
    "Own it. Crush it."
  ];
  dailyDoseTxt.textContent = quotes[Math.floor(Math.random()*quotes.length)];
}

// ===== INITIAL SETUP =====
document.addEventListener('DOMContentLoaded', () => {
  // 1) Greet you properly
  const name = 'IQ';
  const greets = [
    `What's up, ${name}?`,
    `Let's crush it, ${name}!`,
    `Ready to rock, ${name}?`,
    `Time to slay, ${name}!`
  ];
  greetingH2.textContent = greets[Math.floor(Math.random()*greets.length)];

  // 2) Load saved theme-select
  const savedTheme = localStorage.getItem('themeSelect');
  if (savedTheme) {
    themeSelect.value = savedTheme;
    themeSelect.dispatchEvent(new Event('change'));
  }

  // 3) Render stored todos
  renderTodos();
  updateDailyDose();
});

// ===== EVENTS =====
addBtn.addEventListener('click', addTodo);
filters.forEach(btn => btn.addEventListener('click', filterTodos));
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const dark = document.body.classList.contains('dark');
  themeToggle.textContent = dark ? '☀️ Light Mode' : '🌙 Dark Mode';
  localStorage.setItem('theme', dark ? 'dark' : 'light');
});
themeSelect.addEventListener('change', () => {
  removeAllThemes();
  const sel = themeSelect.value;
  if (sel) {
    document.body.classList.add(sel);
    appTitle.textContent = themeNames[sel] || "🚀 SlayList";
    localStorage.setItem('themeSelect', sel);
  }
});
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
    themeToggle.textContent = '☀️ Light Mode';
  }
});

// ===== TODO FUNCTIONS =====
function addTodo() {
  const task = input.value.trim().toLowerCase();
  // Easter eggs
  if (task === "clear all") {
    if (confirm("This will wipe all your tasks. Proceed?")) {
      todos = [];
      saveAndRender();
    }
    input.value = '';
    return;
  }
  if (task === "motivate me") {
    updateDailyDose();
    input.value = '';
    return;
  }
  if (task === "rizz up") {
    // Sync flirty mode
    removeAllThemes();
    document.body.classList.add('theme-flirty');
    appTitle.textContent = themeNames['theme-flirty'];
    themeSelect.value = 'theme-flirty';
    localStorage.setItem('themeSelect','theme-flirty');
    input.value = '';
    return;
  }

  // Regular add
  const textRaw  = document.getElementById('todo-input').value.trim();
  const date     = document.getElementById('todo-date').value;
  const category = document.getElementById('todo-category').value;
  if (!textRaw) return;

  const emojis = ['🔥','✅','🧠','🎯','🚀','💡','📅'];
  const todo   = {
    id:      Date.now(),
    text:    `${emojis[Math.floor(Math.random()*emojis.length)]} ${textRaw}`,
    completed:false,
    date:    date||null,
    category
  };
  todos.push(todo);
  input.value = '';
  document.getElementById('todo-date').value = '';
  saveAndRender();
}

function renderTodos() {
  todoList.innerHTML = '';
  const filter = document.querySelector('.filter.active').dataset.filter;
  const list = todos.filter(t => filter==='all' ||
                   (filter==='active' && !t.completed) ||
                   (filter==='completed' && t.completed));
  list.forEach(todo => {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.completed?' completed':'');
    li.setAttribute('draggable', true);
    li.innerHTML = `
      <span class="drag-handle">≡</span>
      <div style="flex:1;">
        <span class="todo-text" ondblclick="editTodo(${todo.id})">${todo.text}</span>
        <div style="font-size:.8rem;color:gray;">
          ${todo.category} ${todo.date?`| 📅 ${todo.date}`:''}
        </div>
      </div>
      <div>
        <button onclick="toggleTodo(${todo.id})">✔</button>
        <button onclick="editTodo(${todo.id})">✏️</button>
        <button onclick="deleteTodo(${todo.id})">✖</button>
      </div>
    `;
    todoList.appendChild(li);
  });
  updateProgressBar();
}

function toggleTodo(id) {
  todos = todos.map(t => t.id===id?{...t,completed:!t.completed}:t);
  saveAndRender();
}
function deleteTodo(id) {
  todos = todos.filter(t => t.id!==id);
  saveAndRender();
}
function editTodo(id) {
  const todo = todos.find(t=>t.id===id);
  if (!todo) return;
  const li = [...todoList.children].find(el =>
    el.querySelector('.todo-text')?.textContent===todo.text
  );
  const inp = document.createElement('input');
  inp.type  = 'text';
  inp.value = todo.text;
  inp.className = 'edit-input';
  const span = li.querySelector('.todo-text');
  span.replaceWith(inp);
  inp.focus();
  inp.addEventListener('keydown', e => {
    if (e.key==='Enter' && inp.value.trim()) {
      todo.text = inp.value.trim();
      saveAndRender();
    }
    if (e.key==='Escape') saveAndRender();
  });
}

function filterTodos(e) {
  filters.forEach(b=>b.classList.remove('active'));
  e.target.classList.add('active');
  renderTodos();
}

function saveAndRender() {
  localStorage.setItem('todos', JSON.stringify(todos));
  renderTodos();
}

// ===== PROGRESS BAR & CONFETTI =====
function updateProgressBar() {
  const bar   = document.getElementById('progress-bar');
  const total = todos.length;
  const done  = todos.filter(t=>t.completed).length;
  const pct   = total?Math.round(done/total*100):0;
  bar.style.width = pct+'%';

  motivationP.textContent = 
    pct===0   ? "Let’s get started!" :
    pct<50    ? "You're making moves 🔄" :
    pct<100   ? "Almost there 🏁" :
               "YOU DID IT 💥🔥";

  if (pct===100) confetti({ particleCount:150, spread:70, origin:{ y:0.6 } });
}

// ===== DRAG & DROP =====
let dragged = null;
todoList.addEventListener('dragstart', e=>{
  if (e.target.classList.contains('todo-item')) {
    dragged = e.target;
    e.dataTransfer.effectAllowed = 'move';
  }
});
todoList.addEventListener('dragover', e=>{
  e.preventDefault();
  const targ = e.target.closest('.todo-item');
  if (!targ || targ===dragged) return;
  const rect = targ.getBoundingClientRect();
  const next = (e.clientY - rect.top) > rect.height/2;
  todoList.insertBefore(dragged, next? targ.nextSibling : targ);
});
todoList.addEventListener('drop', ()=>{
  const newOrder = [...todoList.children].map(li=>{
    const txt = li.querySelector('.todo-text')?.textContent;
    return todos.find(t=>t.text===txt);
  }).filter(Boolean);
  todos = newOrder;
  saveAndRender();
});
