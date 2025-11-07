// DOM Elements
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const totalTasksEl = document.getElementById("total-tasks");
const pendingTasksEl = document.getElementById("pending-tasks");
const completedTasksEl = document.getElementById("completed-tasks");
const filterBtns = document.querySelectorAll(".filter-btn");

// App state
let tasks = JSON.parse(localStorage.getItem("todoAppTasks")) || [];
let currentFilter = "all";

// Initialize app
function init() {
  renderTasks();
  updateStats();
  setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
  // Form submission
  taskForm.addEventListener("submit", handleAddTask);

  // Filter buttons
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", handleFilterChange);
  });

  // Keyboard shortcuts
  document.addEventListener("keydown", handleKeyboardShortcuts);
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(e) {
  // Ctrl/Cmd + Enter to add task quickly
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    taskInput.focus();
  }

  // Escape to clear input
  if (e.key === "Escape" && document.activeElement === taskInput) {
    taskInput.value = "";
    taskInput.blur();
  }
}

// Add new task
function handleAddTask(e) {
  e.preventDefault();
  const text = taskInput.value.trim();

  if (text === "") return;

  const newTask = {
    id: generateId(),
    text: text,
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };

  tasks.unshift(newTask); // Add to beginning
  saveTasks();
  renderTasks();
  updateStats();
  taskInput.value = "";

  // Add success feedback
  showNotification("Task added successfully!", "success");
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Save tasks to localStorage with error handling
function saveTasks() {
  try {
    localStorage.setItem("todoAppTasks", JSON.stringify(tasks));
  } catch (error) {
    console.error("Failed to save tasks:", error);
    showNotification("Failed to save tasks", "error");
  }
}

// Filter tasks based on current filter
function getFilteredTasks() {
  switch (currentFilter) {
    case "pending":
      return tasks.filter((task) => !task.completed);
    case "completed":
      return tasks.filter((task) => task.completed);
    default:
      return tasks;
  }
}

// Render tasks
function renderTasks() {
  const filteredTasks = getFilteredTasks();
  taskList.innerHTML = "";

  if (filteredTasks.length === 0) {
    emptyState.classList.add("show");
    return;
  }

  emptyState.classList.remove("show");

  filteredTasks.forEach((task) => {
    const taskElement = createTaskElement(task);
    taskList.appendChild(taskElement);
  });
}

// Create task element
function createTaskElement(task) {
  const li = document.createElement("li");
  li.className = `task-item ${task.completed ? "completed" : ""}`;
  li.setAttribute("data-task-id", task.id);

  li.innerHTML = `
    <div class="task-checkbox" onclick="toggleTask('${task.id}')"></div>
    <span class="task-text" ondblclick="editTaskInline('${
      task.id
    }')">${escapeHtml(task.text)}</span>
    <div class="task-actions">
      <button class="task-btn btn-edit" onclick="editTask('${
        task.id
      }')" title="Edit task">✏️</button>
      <button class="task-btn btn-delete" onclick="deleteTask('${
        task.id
      }')" title="Delete task">🗑️</button>
    </div>
  `;

  return li;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Toggle task completion
function toggleTask(taskId) {
  const taskIndex = tasks.findIndex((task) => task.id === taskId);
  if (taskIndex === -1) return;

  tasks[taskIndex].completed = !tasks[taskIndex].completed;
  tasks[taskIndex].completedAt = tasks[taskIndex].completed
    ? new Date().toISOString()
    : null;

  saveTasks();
  renderTasks();
  updateStats();

  const action = tasks[taskIndex].completed ? "completed" : "uncompleted";
  showNotification(`Task ${action}!`, "success");
}

// Edit task with prompt
function editTask(taskId) {
  const task = tasks.find((task) => task.id === taskId);
  if (!task) return;

  const newText = prompt("Edit task:", task.text);
  if (newText === null || newText.trim() === "") return;

  if (newText.trim() === task.text) return;

  task.text = newText.trim();
  task.updatedAt = new Date().toISOString();

  saveTasks();
  renderTasks();
  showNotification("Task updated!", "success");
}

// Edit task inline (double-click functionality)
function editTaskInline(taskId) {
  const task = tasks.find((task) => task.id === taskId);
  if (!task) return;

  const taskElement = document.querySelector(
    `[data-task-id="${taskId}"] .task-text`
  );
  const originalText = task.text;

  // Create input element
  const input = document.createElement("input");
  input.type = "text";
  input.value = originalText;
  input.className = "task-input";
  input.style.background = "transparent";
  input.style.border = "2px solid var(--primary-color)";
  input.style.borderRadius = "var(--radius-sm)";
  input.style.padding = "var(--spacing-xs) var(--spacing-sm)";
  input.style.fontSize = "1rem";
  input.style.width = "100%";

  // Replace span with input
  taskElement.replaceWith(input);
  input.focus();
  input.select();

  // Handle save
  function saveEdit() {
    const newText = input.value.trim();
    if (newText && newText !== originalText) {
      task.text = newText;
      task.updatedAt = new Date().toISOString();
      saveTasks();
      showNotification("Task updated!", "success");
    }
    renderTasks();
  }

  // Handle cancel
  function cancelEdit() {
    renderTasks();
  }

  // Event listeners
  input.addEventListener("blur", saveEdit);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveEdit();
    if (e.key === "Escape") cancelEdit();
  });
}

// Delete task with confirmation
function deleteTask(taskId) {
  const task = tasks.find((task) => task.id === taskId);
  if (!task) return;

  if (!confirm(`Are you sure you want to delete "${task.text}"?`)) return;

  tasks = tasks.filter((task) => task.id !== taskId);
  saveTasks();
  renderTasks();
  updateStats();
  showNotification("Task deleted!", "success");
}

// Handle filter change
function handleFilterChange(e) {
  const filter = e.target.dataset.filter;
  currentFilter = filter;

  // Update active button
  filterBtns.forEach((btn) => btn.classList.remove("active"));
  e.target.classList.add("active");

  renderTasks();
}

// Update statistics
function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const pending = total - completed;

  totalTasksEl.textContent = total;
  pendingTasksEl.textContent = pending;
  completedTasksEl.textContent = completed;
}

// Show notification
function showNotification(message, type = "info") {
  // Remove existing notification
  const existing = document.querySelector(".notification");
  if (existing) existing.remove();

  // Create notification
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  // Styles
  Object.assign(notification.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    padding: "12px 24px",
    backgroundColor:
      type === "success"
        ? "var(--success-color)"
        : type === "error"
        ? "var(--danger-color)"
        : "var(--primary-color)",
    color: "white",
    borderRadius: "var(--radius-md)",
    boxShadow: "var(--shadow-lg)",
    zIndex: "1000",
    transform: "translateX(100%)",
    transition: "transform var(--transition-normal)",
    fontSize: "0.875rem",
    fontWeight: "500",
  });

  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 10);

  // Remove after delay
  setTimeout(() => {
    notification.style.transform = "translateX(100%)";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Export data (utility function)
function exportTasks() {
  const dataStr = JSON.stringify(tasks, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `todo-tasks-${new Date().toISOString().split("T")[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

// Import data (utility function)
function importTasks(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedTasks = JSON.parse(e.target.result);
      if (Array.isArray(importedTasks)) {
        tasks = importedTasks;
        saveTasks();
        renderTasks();
        updateStats();
        showNotification("Tasks imported successfully!", "success");
      }
    } catch (error) {
      showNotification("Failed to import tasks", "error");
    }
  };
  reader.readAsText(file);
}

// Clear all completed tasks
function clearCompleted() {
  const completedCount = tasks.filter((task) => task.completed).length;
  if (completedCount === 0) {
    showNotification("No completed tasks to clear", "info");
    return;
  }

  if (!confirm(`Delete ${completedCount} completed task(s)?`)) return;

  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
  updateStats();
  showNotification(`${completedCount} completed task(s) deleted!`, "success");
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", init);

// Make functions globally available for onclick handlers
window.toggleTask = toggleTask;
window.editTask = editTask;
window.editTaskInline = editTaskInline;
window.deleteTask = deleteTask;
window.exportTasks = exportTasks;
window.clearCompleted = clearCompleted;
