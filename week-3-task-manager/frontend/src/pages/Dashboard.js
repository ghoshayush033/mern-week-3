import React, { useState, useEffect, useCallback } from 'react';
import API from '../services/api';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Personal');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchTasks = useCallback(async () => {
    try {
      const params = {};
      if (filterCategory) params.category = filterCategory;
      if (filterStatus) params.status = filterStatus;
      const res = await API.get('/tasks', { params });
      setTasks(res.data);
    } catch (err) {
      console.error('Error loading tasks:', err);
    }
  }, [filterCategory, filterStatus]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', title);
    data.append('description', description);
    data.append('category', category);
    if (image) data.append('image', image);

    try {
      await API.post('/tasks', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTitle('');
      setDescription('');
      setImage(null);
      setPreview(null);
      fetchTasks();
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      await API.put(`/tasks/${id}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await API.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="task-form-card">
        <h3>Add New Task</h3>
        <form onSubmit={handleCreateTask}>
          <input
            type="text"
            placeholder="Task Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="form-group-row">
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Personal">Personal</option>
              <option value="Work">Work</option>
              <option value="Urgent">Urgent</option>
            </select>
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </div>
          {preview && (
            <div className="preview-container">
              <p>Image Preview:</p>
              <img src={preview} alt="Upload preview" className="preview-img" />
            </div>
          )}
          <button type="submit" className="btn-add">Create Task</button>
        </form>
      </div>

      <div className="task-list-section">
        <div className="filters-bar">
          <h3>My Tasks</h3>
          <div className="filter-controls">
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="">All Categories</option>
              <option value="Personal">Personal</option>
              <option value="Work">Work</option>
              <option value="Urgent">Urgent</option>
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="task-grid">
          {tasks.length === 0 ? (
            <p>No tasks found.</p>
          ) : (
            tasks.map((task) => (
              <div key={task._id} className={`task-card ${task.status}`}>
                {task.imageUrl && (
                  <img
                    src={`http://localhost:5000${task.imageUrl}`}
                    alt={task.title}
                    className="task-card-img"
                  />
                )}
                <div className="task-content">
                  <div className="badge-wrapper">
                    <span className="badge category-badge">{task.category}</span>
                    <span className={`badge status-badge ${task.status}`}>{task.status}</span>
                  </div>
                  <h4>{task.title}</h4>
                  <p>{task.description}</p>
                </div>
                <div className="task-actions">
                  <button onClick={() => toggleStatus(task._id, task.status)} className="btn-toggle">
                    {task.status === 'completed' ? 'Mark Pending' : 'Mark Complete'}
                  </button>
                  <button onClick={() => deleteTask(task._id)} className="btn-delete">Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
