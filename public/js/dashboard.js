// dashboard.js — updated to use new glassmorphism task-card structure

const getToken = () => `Bearer ${localStorage.getItem('token')}`;

function getPriorityBadge(p) {
    const map = { High: 'badge-high', Medium: 'badge-medium', Low: 'badge-low' };
    return `<span class="badge ${map[p] || 'badge-low'}">${p || 'Low'}</span>`;
}

function getStatusBadge(s) {
    const map = { 'Pending': 'badge-pending', 'In Progress': 'badge-progress', 'Completed': 'badge-completed' };
    const icon = { 'Pending': '⏳', 'In Progress': '🔄', 'Completed': '✅' };
    return `<span class="badge ${map[s] || 'badge-pending'}">${icon[s] || '⏳'} ${s || 'Pending'}</span>`;
}

function formatDeadline(d) {
    if (!d) return '';
    const date = new Date(d);
    const now = new Date();
    const overdue = date < now;
    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `<div class="task-deadline ${overdue ? 'overdue' : ''}">
                <i class="fas fa-calendar${overdue ? '-xmark' : ''}"></i> ${label}${overdue ? ' · Overdue' : ''}
            </div>`;
}

function renderTask(task) {
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
        ${formatDeadline(task.deadline)}
        <div class="task-card-actions">
            <a href="update.html" class="btn btn-edit" style="padding:8px 12px;font-size:0.78rem;border-radius:9px;display:inline-flex;align-items:center;gap:6px;">
                <i class="fas fa-pen-to-square"></i> Edit
            </a>
        </div>
    `;
    return card;
}

function updateStats(tasks) {
    document.getElementById('stat-total').textContent = tasks.length;
    document.getElementById('stat-pending').textContent = tasks.filter(t => t.status === 'Pending').length;
    document.getElementById('stat-inprogress').textContent = tasks.filter(t => t.status === 'In Progress').length;
    document.getElementById('stat-done').textContent = tasks.filter(t => t.status === 'Completed').length;

    const badge = document.getElementById('task-count-badge');
    if (badge) badge.textContent = `${tasks.length} task${tasks.length !== 1 ? 's' : ''}`;
}

document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert('User not logged in!');
        window.location.href = '/login';
        return;
    }

    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '<div class="loading-spinner">Loading tasks…</div>';

    fetch(`tasks/user/${userId}`)
        .then(r => r.json())
        .then(tasks => {
            taskList.innerHTML = '';

            updateStats(tasks);

            if (!tasks.length) {
                taskList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <p>No tasks yet. <a href="create.html" style="color:#a5b4fc;text-decoration:none;font-weight:600;">Create your first task →</a></p>
                    </div>`;
                return;
            }

            tasks.forEach(t => taskList.appendChild(renderTask(t)));
        })
        .catch(err => {
            console.error('Error fetching tasks:', err);
            taskList.innerHTML = `<div class="empty-state"><i class="fas fa-triangle-exclamation"></i><p>Could not load tasks. Check your connection.</p></div>`;
        });

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('userId');
            window.location.href = 'index.html';
        });
    }
});
