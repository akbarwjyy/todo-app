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

// PWA Features

// Check if app is running in standalone mode
function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone === true ||
         document.referrer.includes('android-app://');
}

// Enhanced local storage with sync capabilities
function syncData() {
  // This function could be extended to sync with a backend
  const lastSync = localStorage.getItem('lastSync');
  const now = new Date().toISOString();
  
  console.log('Data sync check:', { lastSync, now });
  localStorage.setItem('lastSync', now);
  
  // Could add cloud sync logic here
  return Promise.resolve();
}

// Background sync registration (when service worker supports it)
function registerBackgroundSync() {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then(registration => {
      return registration.sync.register('background-sync');
    }).catch(err => {
      console.log('Background sync registration failed:', err);
    });
  }
}

// Handle app visibility changes (for battery optimization)
function handleVisibilityChange() {
  if (document.hidden) {
    console.log('App is hidden - pausing non-essential operations');
    // Could pause animations, reduce polling, etc.
  } else {
    console.log('App is visible - resuming operations');
    // Resume operations, check for updates
    syncData();
  }
}

// Enhanced notification system for PWA
function showPWANotification(title, options = {}) {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      ...options
    });
    
    notification.onclick = function() {
      window.focus();
      notification.close();
    };
    
    return notification;
  }
}

// Request notification permission
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        showNotification('Notifications enabled! 🔔', 'success');
      }
    });
  }
}

// Add task reminder functionality
function scheduleTaskReminder(task, minutes = 60) {
  if ('Notification' in window && Notification.permission === 'granted') {
    setTimeout(() => {
      if (!task.completed) {
        showPWANotification(`Reminder: ${task.text}`, {
          body: 'Don\'t forget about this task!',
          tag: `reminder-${task.id}`,
          requireInteraction: true
        });
      }
    }, minutes * 60 * 1000);
  }
}

// Enhanced error handling and recovery
function handleStorageError(error) {
  console.error('Storage error:', error);
  
  if (error.name === 'QuotaExceededError') {
    showNotification('Storage quota exceeded. Consider clearing completed tasks.', 'warning');
    return false;
  }
  
  // Try to recover from corruption
  if (error.name === 'SyntaxError') {
    console.log('Attempting to recover from corrupted data');
    localStorage.removeItem('todoAppTasks');
    tasks = [];
    showNotification('Data was corrupted and has been reset.', 'error');
    return true;
  }
  
  return false;
}

// Enhanced save with error recovery
function saveTasks() {
  try {
    const data = JSON.stringify(tasks);
    localStorage.setItem("todoAppTasks", data);
    
    // Also save backup
    localStorage.setItem("todoAppTasks_backup", data);
    localStorage.setItem("todoAppTasks_timestamp", Date.now().toString());
    
  } catch (error) {
    if (!handleStorageError(error)) {
      showNotification("Failed to save tasks", "error");
    }
  }
}

// Load tasks with recovery
function loadTasks() {
  try {
    const data = localStorage.getItem("todoAppTasks");
    if (data) {
      tasks = JSON.parse(data);
    } else {
      // Try to load from backup
      const backup = localStorage.getItem("todoAppTasks_backup");
      if (backup) {
        tasks = JSON.parse(backup);
        showNotification("Loaded from backup", "info");
      }
    }
  } catch (error) {
    if (handleStorageError(error)) {
      renderTasks();
      updateStats();
    }
  }
}

// PWA lifecycle management
function setupPWALifecycle() {
  // Handle app installation
  if (isStandalone()) {
    console.log('App is running in standalone mode');
    document.body.classList.add('standalone');
  }
  
  // Handle visibility changes
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Register for background sync
  registerBackgroundSync();
  
  // Setup periodic sync (when supported)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      if ('periodicSync' in registration) {
        registration.periodicSync.register('data-sync', {
          minInterval: 24 * 60 * 60 * 1000 // 24 hours
        });
      }
    });
  }
  
  // Auto-request notification permission after user interaction
  let hasInteracted = false;
  function handleFirstInteraction() {
    if (!hasInteracted) {
      hasInteracted = true;
      setTimeout(() => {
        requestNotificationPermission();
      }, 2000);
      
      // Remove listeners
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    }
  }
  
  document.addEventListener('click', handleFirstInteraction);
  document.addEventListener('keydown', handleFirstInteraction);
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  loadTasks(); // Load with error recovery
  init();
  setupPWALifecycle();
});

// Handle online/offline events
window.addEventListener('online', () => {
  console.log('App is online');
  syncData();
  showNotification('Back online! 🌐', 'success');
});

window.addEventListener('offline', () => {
  console.log('App is offline');
  showNotification('You\'re offline - changes will be saved locally 📴', 'info');
});

// Make functions globally available for onclick handlers
window.toggleTask = toggleTask;
window.editTask = editTask;
window.editTaskInline = editTaskInline;
window.deleteTask = deleteTask;
window.exportTasks = exportTasks;
window.clearCompleted = clearCompleted;
window.requestNotificationPermission = requestNotificationPermission;
