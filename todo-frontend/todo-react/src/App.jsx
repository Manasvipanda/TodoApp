import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [removingIds, setRemovingIds] = useState(new Set());
  const [adding, setAdding] = useState(false);
  const [flashCount, setFlashCount] = useState(false);
  const [currentView, setCurrentView] = useState('tasks');

  const fetchTasks = () => {
    fetch("http://localhost:8081/api/tasks")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const sorted = data.sort((a, b) => a.completed - b.completed);
        setTasks(sorted);
      })
      .catch((err) => console.error("Fetch error:", err));
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark-mode");
    } else {
      document.documentElement.classList.remove("dark-mode");
    }
  }, [darkMode]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = () => {
    if (!newTaskTitle.trim() || adding) return;
    setAdding(true);
    setFlashCount(true);
    setTimeout(() => setFlashCount(false), 560);

    fetch("http://localhost:8081/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTaskTitle, completed: false }),
    })
      .then(() => {
        setNewTaskTitle("");
        fetchTasks();
      })
      .catch((err) => console.error(err))
      .finally(() => setAdding(false));
  };

  const handleDeleteTask = (id) => {
    setRemovingIds((prev) => {
      const s = new Set(prev);
      s.add(id);
      return s;
    });

    setTimeout(() => {
      fetch(`http://localhost:8081/api/tasks/${id}`, { method: "DELETE" })
        .then(() => {
          setRemovingIds((prev) => {
            const s = new Set(prev);
            s.delete(id);
            return s;
          });
          fetchTasks();
        })
        .catch((err) => {
          setRemovingIds((prev) => {
            const s = new Set(prev);
            s.delete(id);
            return s;
          });
          console.error(err);
        });
    }, 260);
  };

  const handleToggleTask = (task) => {
    fetch(`http://localhost:8081/api/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...task, completed: !task.completed }),
    })
      .then(() => fetchTasks())
      .catch((err) => console.error(err));
  };

  const handleClearAll = () => {
    Promise.all(
      tasks.map((task) =>
        fetch(`http://localhost:8081/api/tasks/${task.id}`, { method: "DELETE" })
      )
    )
      .then(() => fetchTasks())
      .catch((err) => console.error(err));
  };

  return (
    <div className={`container ${darkMode ? "dark" : ""}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-mark" aria-hidden="true">✓</div>
          <h2>TaskHub</h2>
        </div>
        <nav>
          <ul>
            <li className={currentView === 'tasks' ? 'active' : ''} onClick={() => setCurrentView('tasks')}>
              <span className="nav-icon">📋</span>
              <span>All Tasks</span>
              <span className="nav-count">{tasks.length}</span>
            </li>
            <li className={currentView === 'tasks' ? 'active' : ''} onClick={() => setCurrentView('tasks')}>
              <span className="nav-icon">✅</span>
              <span>Completed</span>
              <span className="nav-count">{tasks.filter(t => t.completed).length}</span>
            </li>
            <li className={currentView === 'tasks' ? 'active' : ''} onClick={() => setCurrentView('tasks')}>
              <span className="nav-icon">⏳</span>
              <span>Pending</span>
              <span className="nav-count">{tasks.filter(t => !t.completed).length}</span>
            </li>
            <li className={currentView === 'dashboard' ? 'active' : ''} onClick={() => setCurrentView('dashboard')}>
              <span className="nav-icon">📊</span>
              <span>Dashboard</span>
            </li>
            <li className={currentView === 'settings' ? 'active' : ''} onClick={() => setCurrentView('settings')}>
              <span className="nav-icon">⚙️</span>
              <span>Settings</span>
            </li>
            <li className={currentView === 'profile' ? 'active' : ''} onClick={() => setCurrentView('profile')}>
              <span className="nav-icon">👤</span>
              <span>Profile</span>
            </li>
            <li className={currentView === 'help' ? 'active' : ''} onClick={() => setCurrentView('help')}>
              <span className="nav-icon">❓</span>
              <span>Help</span>
            </li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          <p>Ready to be productive?</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {currentView === 'tasks' && (
          <>
            <header>
              <div className="header-brand">
                <div className="header-top">
                  <h1>📝 Tasks</h1>
                  <div className="task-stats">
                    <span className="stat-badge">Total: {tasks.length}</span>
                    <span className="stat-badge completed">Completed: {tasks.filter(t => t.completed).length}</span>
                  </div>
                </div>
                <p className="header-subtitle">Stay organized and productive</p>
              </div>
              <button
                className="dark-toggle"
                onClick={() => setDarkMode(!darkMode)}
              >
                {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
              </button>
            </header>

            {/* Add Task */}
            <div className="add-task">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddTask(); }}
                placeholder="Enter new task..."
              />
              <button onClick={handleAddTask} disabled={!newTaskTitle.trim() || adding} className="add-btn">
                {adding ? 'Adding…' : 'Add Task'}
              </button>
            </div>

            {/* Clear All */}
            {tasks.length > 0 && (
              <button className="clear-btn" onClick={handleClearAll}>
                Clear All
              </button>
            )}

            {/* Tasks List */}
            {tasks.length === 0 && <p className="no-tasks">No tasks found</p>}

            <div className="task-list" role="list">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  role="listitem"
                  className={`task-card ${task.completed ? "completed" : ""} ${removingIds.has(task.id) ? "removing" : ""}`}
                >
                  <div className="task-left">
                    <input
                      type="checkbox"
                      className="task-checkbox"
                      checked={!!task.completed}
                      onChange={() => handleToggleTask(task)}
                      aria-label={task.completed ? `Mark ${task.title} as not completed` : `Mark ${task.title} as completed`}
                    />
                    <span>{task.title}</span>
                  </div>
                  <div className="task-actions">
                    <button onClick={() => handleDeleteTask(task.id)} aria-label={`Delete ${task.title}`}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {currentView === 'dashboard' && (
          <div className="view-content">
            <header>
              <div className="header-brand">
                <h1>📊 Dashboard</h1>
                <p className="header-subtitle">Overview of your productivity</p>
              </div>
            </header>
            <div className="dashboard-content">
              <div className="dashboard-stats">
                <div className="stat-card">
                  <h3>Total Tasks</h3>
                  <span className="stat-number">{tasks.length}</span>
                </div>
                <div className="stat-card">
                  <h3>Completed</h3>
                  <span className="stat-number completed">{tasks.filter(t => t.completed).length}</span>
                </div>
                <div className="stat-card">
                  <h3>Pending</h3>
                  <span className="stat-number pending">{tasks.filter(t => !t.completed).length}</span>
                </div>
                <div className="stat-card">
                  <h3>Completion Rate</h3>
                  <span className="stat-number">{tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'settings' && (
          <div className="view-content">
            <header>
              <div className="header-brand">
                <h1>⚙️ Settings</h1>
                <p className="header-subtitle">Customize your experience</p>
              </div>
            </header>
            <div className="settings-content">
              <div className="setting-group">
                <h3>Appearance</h3>
                <div className="setting-item">
                  <label>Dark Mode</label>
                  <button
                    className="dark-toggle"
                    onClick={() => setDarkMode(!darkMode)}
                  >
                    {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
                  </button>
                </div>
              </div>
              <div className="setting-group">
                <h3>Notifications</h3>
                <div className="setting-item">
                  <label>Enable notifications</label>
                  <input type="checkbox" />
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'profile' && (
          <div className="view-content">
            <header>
              <div className="header-brand">
                <h1>👤 Profile</h1>
                <p className="header-subtitle">Manage your account</p>
              </div>
            </header>
            <div className="profile-content">
              <div className="profile-info">
                <div className="profile-avatar">👤</div>
                <div className="profile-details">
                  <h3>User Name</h3>
                  <p>user@example.com</p>
                </div>
              </div>
              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-label">Tasks Created</span>
                  <span className="stat-value">{tasks.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Tasks Completed</span>
                  <span className="stat-value">{tasks.filter(t => t.completed).length}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'help' && (
          <div className="view-content">
            <header>
              <div className="header-brand">
                <h1>❓ Help & Support</h1>
                <p className="header-subtitle">Get help and learn more</p>
              </div>
            </header>
            <div className="help-content">
              <div className="help-section">
                <h3>Getting Started</h3>
                <ul>
                  <li>Add tasks by typing in the input field and clicking "Add Task"</li>
                  <li>Mark tasks as complete by checking the checkbox</li>
                  <li>Delete tasks using the delete button</li>
                  <li>Use the sidebar to navigate between different sections</li>
                </ul>
              </div>
              <div className="help-section">
                <h3>Features</h3>
                <ul>
                  <li>Task management with completion tracking</li>
                  <li>Dark mode toggle</li>
                  <li>Dashboard with productivity stats</li>
                  <li>Settings for customization</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <footer>
          <p>© 2025 My ToDo App. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}

export default App;
