// delete.js — updated to use new glassmorphism task-card structure

function getPriorityBadge(p) {
    const map = { High: 'badge-high', Medium: 'badge-medium', Low: 'badge-low' };
    return `<span class="badge ${map[p] || 'badge-low'}">${p || 'Low'}</span>`;
}

function getStatusBadge(s) {
    const map = { 'Pending': 'badge-pending', 'In Progress': 'badge-progress', 'Completed': 'badge-completed' };
    const icon = { 'Pending': '⏳', 'In Progress': '🔄', 'Completed': '✅' };
    return `<span class="badge ${map[s] || 'badge-pending'}">${icon[s] || '⏳'} ${s || 'Pending'}</span>`;
}

// Load tasks when the button is clicked
document.getElementById('load-tasks').addEventListener('click', loadTasks);

function loadTasks() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert('User not logged in!');
        window.location.href = '/login';
        return;
    }

    const taskListDiv = document.getElementById('task-list');
    taskListDiv.innerHTML = '<div class="loading-spinner">Loading tasks…</div>';

    fetch(`/tasks/user/${userId}`)
        .then(r => {
            if (!r.ok) throw new Error('Network response was not ok');
            return r.json();
        })
        .then(tasks => {
            taskListDiv.innerHTML = '';

            if (!tasks.length) {
                taskListDiv.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <p>No tasks found for this account.</p>
                    </div>`;
                return;
            }

            tasks.forEach(task => {
                const card = document.createElement('div');
                card.className = 'task-card';
                card.id = `task-${task.id}`;
                card.innerHTML = `
                    <div class="task-card-header">
                        <div class="task-card-title">${task.title}</div>
                        <span class="task-id-chip">#${task.id}</span>
                    </div>
                    ${task.description ? `<p class="task-card-desc">${task.description}</p>` : ''}
                    <div class="task-card-meta">
                        ${getPriorityBadge(task.priority)}
                        ${getStatusBadge(task.status)}
                    </div>
                    <div class="task-card-actions">
                        <button class="btn btn-delete-task delete-task-button" data-task-id="${task.id}" style="width:100%;padding:9px 14px;font-size:0.8rem;border-radius:9px;display:inline-flex;align-items:center;justify-content:center;gap:6px;">
                            <i class="fas fa-trash-can"></i> Delete Task
                        </button>
                    </div>
                `;
                taskListDiv.appendChild(card);
            });

            setupDeleteButtons();
        })
        .catch(err => {
            console.error('Error loading tasks:', err);
            taskListDiv.innerHTML = `<div class="empty-state"><i class="fas fa-triangle-exclamation"></i><p>Could not load tasks. Check your connection.</p></div>`;
        });
}

function setupDeleteButtons() {
    document.querySelectorAll('.delete-task-button').forEach(btn => {
        btn.addEventListener('click', function () {
            const taskId = this.getAttribute('data-task-id');
            const userId = localStorage.getItem('userId');

            if (confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
                fetch(`/task/${taskId}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: userId })
                })
                    .then(r => {
                        if (!r.ok) throw new Error('Delete failed');
                        return r.json();
                    })
                    .then(data => {
                        const el = document.getElementById(`task-${taskId}`);
                        if (el) {
                            el.style.transition = 'opacity 0.3s, transform 0.3s';
                            el.style.opacity = '0';
                            el.style.transform = 'scale(0.9)';
                            setTimeout(() => el.remove(), 300);
                        }
                    })
                    .catch(err => console.error('Error deleting task:', err));
            }
        });
    });
}
