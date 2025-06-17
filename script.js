const input = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const filters = document.querySelectorAll('.filter');
const themeSelect = document.getElementById('theme-select');
const toggleBtn = document.getElementById('theme-toggle');
const motivation = document.getElementById('motivation');
const progressBar = document.getElementById('progress-bar');
const title = document.getElementById('app-title');
const dailyQuote = document.getElementById('daily-dose-text');

const moods = {
  "theme-focus": "🧘 ZenBoard",
  "theme-hype": "⚡ PowerGrid",
  "theme-hacker": "💻 Terminal Todo",
  "theme-flirty": "💖 RizzList"
};

const quotes = [
  "You're unstoppable today.",
  "Keep crushing it!",
  "This is your day to slay.",
  "Discipline > Motivation.",
  "One task at a time. You'll win.",
  "You're built for this."
];

// Mapping for category text to Feather Icons (using plain text category names now)
const categoryIcons = {
  "Focus": "target",
  "Fitness": "activity",
  "Shopping": "shopping-cart",
  "Chill": "wind",
  // Add more as needed
};

let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'active';

document.addEventListener('DOMContentLoaded', () => {
  // Set initial theme toggle icon based on localStorage
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
    toggleBtn.innerHTML = '<i data-feather="sun"></i> Light Mode'; // Sun icon for dark mode
  } else {
    toggleBtn.innerHTML = '<i data-feather="moon"></i> Dark Mode'; // Moon icon for light mode
  }
  // IMPORTANT: Re-render Feather icons after setting innerHTML
  feather.replace();

  const savedMood = localStorage.getItem('theme-mode');
  if (savedMood) {
    document.body.classList.add(savedMood);
    title.textContent = moods[savedMood] || "🚀 SlayList";
    themeSelect.value = savedMood;
  }

  // Force default filter to "active" and apply active class
  document.querySelectorAll('.filter').forEach(f => f.classList.remove('active'));
  document.querySelector('[data-filter="active"]').classList.add('active');
  currentFilter = 'active';

  // Set a random daily quote
  dailyQuote.textContent = quotes[Math.floor(Math.random() * quotes.length)];
  renderTodos(); // Initial render of todo items
});

addBtn.addEventListener('click', () => {
  const task = input.value.trim();
  const date = document.getElementById('todo-date').value;
  const category = document.getElementById('todo-category').value; // This will now be plain text, e.g., "Focus"

  if (!task) return; // Prevent adding empty tasks

  todos.push({
    id: Date.now(), // Unique ID for each todo
    text: task,
    date,
    category,
    completed: false
  });

  input.value = ''; // Clear input field
  document.getElementById('todo-date').value = ''; // Clear date field
  localStorage.setItem('todos', JSON.stringify(todos)); // Save to local storage
  renderTodos(); // Re-render the list
});

function renderTodos() {
  todoList.innerHTML = ''; // Clear existing list
  let filtered = todos;
  if (currentFilter === 'active') filtered = todos.filter(t => !t.completed);
  if (currentFilter === 'completed') filtered = todos.filter(t => t.completed);

  filtered.forEach(todo => {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.completed ? ' completed' : ''); // Add 'completed' class if applicable

    // Get the corresponding Feather icon for the category based on its plain text name
    const categoryIconName = categoryIcons[todo.category] || "tag"; // Default to 'tag' if not found

    li.innerHTML = `
      <label class="checkbox-wrapper">
        <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodo(${todo.id})">
        <span class="checkmark"></span>
      </label>
      <div class="todo-content">
        <strong contenteditable="true" onblur="editTodo(${todo.id}, this.innerText)">${todo.text}</strong>
        <div class="todo-meta">
          <i data-feather="${categoryIconName}" class="category-icon"></i> ${todo.category} ${todo.date ? '| ' + todo.date : ''}
        </div>
      </div>
      <button class="icon-button" onclick="deleteTodo(${todo.id})">
        <i data-feather="x-circle"></i> </button>
    `;
    todoList.appendChild(li);
  });

  // IMPORTANT: Re-render Feather icons for newly added items
  feather.replace();

  updateProgress(); // Update progress bar and motivation
}

function toggleTodo(id) {
  todos = todos.map(todo => {
    if (todo.id === id) todo.completed = !todo.completed;
    return todo;
  });
  localStorage.setItem('todos', JSON.stringify(todos));
  renderTodos();
}

function editTodo(id, newText) {
  todos = todos.map(todo => {
    if (todo.id === id) {
      todo.text = newText.trim(); // Update the task text
    }
    return todo;
  });
  localStorage.setItem('todos', JSON.stringify(todos));
}

function deleteTodo(id) {
  todos = todos.filter(todo => todo.id !== id);
  localStorage.setItem('todos', JSON.stringify(todos));
  renderTodos();
}

filters.forEach(btn => {
  btn.addEventListener('click', (e) => {
    filters.forEach(b => b.classList.remove('active')); // Remove active from all filters
    e.target.classList.add('active'); // Add active to clicked filter
    currentFilter = e.target.dataset.filter; // Update current filter
    renderTodos(); // Re-render todos based on new filter
  });
});

function updateProgress() {
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  progressBar.style.width = percent + "%";

  let msg = "✨ Ready to conquer?";
  if (percent === 100) {
    msg = "🔥 You slayed every task!";
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
  } else if (percent >= 75) {
    msg = "💪 You're almost done!";
  } else if (percent >= 50) {
    msg = "🚀 Keep it going!";
  } else if (percent > 0) {
    msg = "👣 First steps taken — stay sharp.";
  }

  motivation.textContent = msg;
}

toggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const dark = document.body.classList.contains('dark');
  // Update the Feather icon based on the theme
  toggleBtn.innerHTML = dark ? '<i data-feather="sun"></i> Light Mode' : '<i data-feather="moon"></i> Dark Mode';
  // IMPORTANT: Re-render Feather icons after changing innerHTML
  feather.replace();
  localStorage.setItem('theme', dark ? 'dark' : 'light');
});

themeSelect.addEventListener('change', () => {
  // Remove all theme-mode classes before adding the new one
  document.body.className = document.body.classList.contains('dark') ? 'dark' : '';
  const selected = themeSelect.value;
  if (selected) {
    document.body.classList.add(selected);
    title.textContent = moods[selected] || "🚀 SlayList";
    localStorage.setItem('theme-mode', selected);
  } else {
    // If no mood is selected (default option)
    title.textContent = "🚀 SlayList";
    localStorage.removeItem('theme-mode');
  }
});
