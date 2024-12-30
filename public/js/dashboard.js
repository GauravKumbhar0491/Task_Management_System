// Helper function to get JWT token from local storage
const getToken = () => `Bearer ${localStorage.getItem('token')}`;

document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('userId'); // Get userId from localStorage
    console.log(userId);
    if (!userId) {
        alert('User not logged in!');
        windows.location.href ='/login';
        return;
    }

    // Fetch tasks created by the logged-in user
    fetch(`tasks/user/${userId}`)
        .then(response => response.json())
        .then(tasks => {
            const taskList = document.getElementById('task-list');
            taskList.innerHTML = ''; // Clear any existing tasks

            if (tasks.length === 0) {
                taskList.innerHTML = '<p>No tasks found.</p>';
                return;
            }

            tasks.forEach(task => {
                const taskDiv = document.createElement('div');
                taskDiv.classList.add('task');
                taskDiv.innerHTML = `
                    <h3>${task.id}</h3>
                    <h3>${task.title}</h3>
                    <p>Description: ${task.description}</p>
                    <p>Priority: ${task.priority}</p>
                    <p>Status: ${task.status}</p>
                    <p>Deadline: ${task.deadline}</p>
                `;
                taskList.appendChild(taskDiv);
            });
        })
        .catch(error => {
            console.error('Error fetching tasks:', error);
        });

        // Logout functionality
        const logoutBtn = document.getElementById('logout-btn');
        logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('userId'); // Remove userId from localStorage
        alert('Logged out successfully!');
        window.location.href = '/login'; // Redirect to login page
    });
});
