import React, { useState, useEffect } from 'react';
import api from './api';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Filtering & Pagination State
  const [filter, setFilter] = useState('all'); // 'all', 'completed', 'pending'
  const [page, setPage] = useState(1);
  const tasksPerPage = 5;

  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token, filter, page]);

  const fetchTasks = async (currentFilter = filter, currentPage = page) => {
    try {
      let url = `/tasks/?limit=${tasksPerPage}&skip=${(currentPage - 1) * tasksPerPage}`;
      if (currentFilter === 'completed') {
        url += '&completed=true';
      } else if (currentFilter === 'pending') {
        url += '&completed=false';
      }
      const response = await api.get(url);
      setTasks(response.data);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        logout();
      }
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      if (isLogin) {
        const response = await api.post('/auth/login', { username, password });
        localStorage.setItem('token', response.data.access_token);
        setToken(response.data.access_token);
      } else {
        await api.post('/auth/register', { email, username, password });
        setIsLogin(true);
        setMessage('Registration successful! You can now login.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Server error. Try resetting the database.');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    try {
      await api.post('/tasks/', { title: newTaskTitle, description: newTaskDesc });
      setNewTaskTitle('');
      setNewTaskDesc('');
      setPage(1); // Reset to first page to see the newly created task at the top
      fetchTasks(filter, 1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTask = async (task) => {
    try {
      await api.put(`/tasks/${task.id}`, { is_completed: !task.is_completed });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      // Handle the case where we delete the last task on page > 1
      if (tasks.length === 1 && page > 1) {
        setPage(p => p - 1);
      } else {
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetDB = async () => {
    if (window.confirm("WARNING: This will wipe ALL users and tasks. Proceed?")) {
      try {
        await api.post('/reset-db');
        logout();
        setMessage("Database has been reset successfully.");
      } catch (err) {
        setError("Failed to reset database.");
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setTasks([]);
    setUsername('');
    setPassword('');
    setEmail('');
    setPage(1);
    setFilter('all');
  };

  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-card glass">
          <h2>{isLogin ? 'Welcome Back' : 'Join Us'}</h2>
          <p className="subtitle">{isLogin ? 'Login to manage your tasks' : 'Create an account to get started'}</p>
          
          {error && <div className="alert error">{error}</div>}
          {message && <div className="alert success">{message}</div>}
          
          <form className="auth-form" onSubmit={handleAuth}>
            {!isLogin && (
              <div className="form-group">
                <input 
                  type="text" 
                  placeholder="Email"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
            )}
            <div className="form-group">
              <input 
                type="text" 
                placeholder="Username"
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <input 
                type="password" 
                placeholder="Password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            <button type="submit" className="btn-primary">{isLogin ? 'Login' : 'Register'}</button>
          </form>
          
          <p className="toggle-auth">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => { setIsLogin(!isLogin); setError(''); setMessage(''); }}>
              {isLogin ? 'Register' : 'Login'}
            </span>
          </p>

          <div className="admin-tools">
            <button onClick={handleResetDB} className="btn-secondary">Reset Database (Wipe All Data)</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <nav className="navbar glass">
        <div className="nav-brand">TaskMaster Pro</div>
        <div className="nav-actions">
           <button onClick={handleResetDB} className="btn-text">Reset DB</button>
           <button onClick={logout} className="btn-outline">Logout</button>
        </div>
      </nav>

      <main className="content">
        <div className="dashboard-grid">
          <section className="task-input-section glass">
            <h3>Add New Task</h3>
            <form onSubmit={handleCreateTask} className="task-form">
              <input 
                type="text" 
                placeholder="What needs to be done?" 
                value={newTaskTitle} 
                onChange={(e) => setNewTaskTitle(e.target.value)} 
                required 
              />
              <textarea 
                placeholder="Add some details..." 
                value={newTaskDesc} 
                onChange={(e) => setNewTaskDesc(e.target.value)} 
              />
              <button type="submit" className="btn-primary">Create Task</button>
            </form>
          </section>

          <section className="task-list-section glass">
            <div className="task-list-header">
              <h3>Your Tasks</h3>
              <div className="filter-group">
                <button 
                  className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => { setFilter('all'); setPage(1); }}
                >
                  All
                </button>
                <button 
                  className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                  onClick={() => { setFilter('completed'); setPage(1); }}
                >
                  Completed
                </button>
                <button 
                  className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                  onClick={() => { setFilter('pending'); setPage(1); }}
                >
                  Pending
                </button>
              </div>
            </div>

            {tasks.length === 0 ? (
              <div className="empty-state">
                <p>No tasks found. {filter !== 'all' ? 'Try changing your filter or ' : ''}Time to be productive!</p>
              </div>
            ) : (
              <>
                <div className="task-grid">
                  {tasks.map(task => (
                    <div key={task.id} className={`task-card ${task.is_completed ? 'completed' : ''}`}>
                      <div className="task-header">
                        <input 
                          type="checkbox" 
                          checked={task.is_completed} 
                          onChange={() => handleToggleTask(task)}
                        />
                        <h4>{task.title}</h4>
                      </div>
                      {task.description && <p className="task-desc">{task.description}</p>}
                      <div className="task-footer">
                        <span className="task-date">{new Date(task.created_at).toLocaleDateString()}</span>
                        <button className="delete-icon" onClick={() => handleDeleteTask(task.id)}>
                          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pagination-controls">
                  <button 
                    className="pagination-btn"
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    disabled={page === 1}
                  >
                    &larr; Prev
                  </button>
                  <span className="page-indicator">Page {page}</span>
                  <button 
                    className="pagination-btn"
                    onClick={() => setPage(p => p + 1)}
                    disabled={tasks.length < tasksPerPage}
                  >
                    Next &rarr;
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
