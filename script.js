// ===== SELECTORS =====
const input = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const filters = document.querySelectorAll('.filter');
const h1 = document.querySelector('h1');
const hour = new Date().getHours();

if (hour < 12) h1.textContent = "Morning Grind 💼";
else if (hour < 18) h1.textContent = "Afternoon Hustle ☀️";
else h1.textContent = "Evening Wrap-Up 🌙";

// ===== STATE =====
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

// ===== EVENTS =====
addBtn.addEventListener('click', addTodo);
filters.forEach(btn => btn.addEventListener('click', filterTodos));
document.addEventListener('DOMContentLoaded', renderTodos);

// ===== FUNCTIONS =====

// Add a new todo
function addTodo() {
  const task = input.value.trim();
  // Easter Egg Commands
if (task.toLowerCase() === "clear all") {
  if (confirm("This will wipe all your tasks. Proceed?")) {
    todos = [];
    saveAndRender();
  }
  input.value = '';
  return;
}

if (task.toLowerCase() === "motivate me") {
  const quotes = [
    "Discipline > Motivation.",
    "One task at a time. You'll win.",
    "Your future self is watching.",
    "Don't stop now.",
    "You're built for this."
  ];
  alert(quotes[Math.floor(Math.random() * quotes.length)]);
  input.value = '';
  return;
}

if (task.toLowerCase() === "rizz up") {
  document.body.className = '';
  document.body.classList.add('theme-flirty');
  alert("Flirty Mode Activated 💋");
  input.value = '';
  return;
}

  const date = document.getElementById('todo-date').value;
  const category = document.getElementById('todo-category').value;

  if (task === '') return;
  const funEmojis = ['🔥', '✅', '🧠', '🎯', '🚀', '💡', '📅'];
  const randomEmoji = funEmojis[Math.floor(Math.random() * funEmojis.length)];

  const newTodo = {
    id: Date.now(),
    text: `${randomEmoji} ${task}`,
    completed: false,
    date: date || null,
    category
  };

  todos.push(newTodo);
  input.value = '';
  document.getElementById('todo-date').value = '';
  saveAndRender();
}


// Render todos to DOM
function renderTodos() {
  todoList.innerHTML = '';

  let filtered = todos;
  if (currentFilter === 'active') {
    filtered = todos.filter(todo => !todo.completed);
  } else if (currentFilter === 'completed') {
    filtered = todos.filter(todo => todo.completed);
  }

  filtered.forEach(todo => {
    const li = document.createElement('li');
    li.setAttribute('draggable', true);

    li.className = 'todo-item' + (todo.completed ? ' completed' : '');
li.innerHTML = `
  <span class="drag-handle">≡</span>
  <div style="flex: 1;">
    <span class="todo-text" ondblclick="editTodo(${todo.id})">${todo.text}</span>
    <div style="font-size: 0.8rem; color: gray;">
      ${todo.category} ${todo.date ? `| 📅 ${todo.date}` : ''}
    </div>
  </div>
  <div>
    <button onclick="toggleTodo(${todo.id})">✔</button>
    <button onclick="editTodo(${todo.id})">✏️</button>
    <button onclick="deleteTodo(${todo.id})">✖</button>
  </div>
`;


    todoList.appendChild(li);
    updateProgressBar();
  });
}

// Mark as done/undone
function toggleTodo(id) {
  todos = todos.map(todo => {
    if (todo.id === id) todo.completed = !todo.completed;
    return todo;
  });
  saveAndRender();
}

// Delete a todo
function deleteTodo(id) {
  todos = todos.filter(todo => todo.id !== id);
  saveAndRender();
}
function editTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;

  const li = [...todoList.children].find(el =>
    el.querySelector('.todo-text')?.textContent === todo.text
  );

  const input = document.createElement('input');
  input.type = 'text';
  input.value = todo.text;
  input.className = 'edit-input';

  const span = li.querySelector('.todo-text');
  span.replaceWith(input);
  input.focus();

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const updatedText = input.value.trim();
      if (updatedText) {
        todo.text = updatedText;
        saveAndRender();
      }
    } else if (e.key === 'Escape') {
      saveAndRender();
    }
  });
}

// Filter button clicked
function filterTodos(e) {
  filters.forEach(btn => btn.classList.remove('active'));
  e.target.classList.add('active');
  currentFilter = e.target.dataset.filter;
  renderTodos();
}

// Save to localStorage and re-render
function saveAndRender() {
  localStorage.setItem('todos', JSON.stringify(todos));
  renderTodos();
  updateProgressBar();
}
// Theme toggle
const toggleBtn = document.getElementById('theme-toggle');

toggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const dark = document.body.classList.contains('dark');
  toggleBtn.textContent = dark ? '☀️ Light Mode' : '🌙 Dark Mode';
  localStorage.setItem('theme', dark ? 'dark' : 'light');
});

// Keep theme on reload
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    toggleBtn.textContent = '☀️ Light Mode';
  }
});
// Enable drag-and-drop
let draggedItem = null;

todoList.addEventListener('dragstart', (e) => {
  if (e.target.classList.contains('todo-item')) {
    draggedItem = e.target;
    e.dataTransfer.effectAllowed = "move";
  }
});

todoList.addEventListener('dragover', (e) => {
  e.preventDefault();
  const target = e.target.closest('.todo-item');
  if (target && target !== draggedItem) {
    const rect = target.getBoundingClientRect();
    const next = (e.clientY - rect.top) > (rect.height / 2);
    todoList.insertBefore(draggedItem, next ? target.nextSibling : target);
  }
});

todoList.addEventListener('drop', () => {
  const newOrder = [];
  [...todoList.children].forEach(item => {
    const text = item.querySelector('.todo-text')?.textContent || item.querySelector('.edit-input')?.value;
    const id = todos.find(t => t.text === text)?.id;
    if (id) {
      const original = todos.find(t => t.id === id);
      newOrder.push(original);
    }
  });
  todos = newOrder;
  saveAndRender();
});
function updateProgressBar() {
  const bar = document.getElementById('progress-bar');
  if (!bar) return;

  const total = todos.length;
  const done = todos.filter(t => t.completed).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  bar.style.width = percent + '%';
  const messageBox = document.getElementById('motivation');
if (percent === 0) messageBox.textContent = "Let’s get started!";
else if (percent < 50) messageBox.textContent = "You're making moves 🔄";
else if (percent < 100) messageBox.textContent = "Almost there 🏁";
else messageBox.textContent = "YOU DID IT 💥🔥";
if (percent === 100) {
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 }
  });
}


}
const themeSelect = document.getElementById('theme-select');

themeSelect.addEventListener('change', () => {
  document.body.className = ''; // Reset classes
  const selected = themeSelect.value;
  if (selected) document.body.classList.add(selected);
});
const themeNames = {
  "theme-focus": "🧘 ZenBoard",
  "theme-hype": "⚡ PowerGrid",
  "theme-hacker": "💻 Terminal Todo",
  "theme-flirty": "💖 RizzList"
};

themeSelect.addEventListener('change', () => {
  document.body.className = ''; // Clear classes
  const selected = themeSelect.value;
  if (selected) {
    document.body.classList.add(selected);
    document.getElementById('app-title').textContent = themeNames[selected] || "🚀 SlayList";
  }
});
