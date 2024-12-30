// Load tasks when the button is clicked
document.getElementById('load-tasks').addEventListener('click', loadTasks);

// Function to load tasks from the server
function loadTasks() {
    const userId = localStorage.getItem('userId'); // Retrieve userId from localStorage

    if (!userId) {
        alert('User not logged in!');
        window.location.href = '/login'; // Redirect to login page
        return;
    }

    fetch(`/tasks/user/${userId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(tasks => {
            const taskListDiv = document.getElementById('task-list');
            taskListDiv.innerHTML = ''; // Clear previous tasks

            // Check if there are any tasks to load
            if (tasks.length === 0) {
                taskListDiv.innerHTML = `<p>No tasks to load</p>`; // Display message if no tasks
                return;
            }

            tasks.forEach(task => {
                const taskDiv = document.createElement('div');
                taskDiv.classList.add('task');
                taskDiv.id = `task-${task.id}`; // Set unique ID for each task

                taskDiv.innerHTML = `
                    <h3>${task.title}</h3>
                    <p>Description: ${task.description}</p>
                    <p>Priority: ${task.priority}</p>
                    <p>Status: ${task.status}</p>
                    <button class="delete-task-button" data-task-id="${task.id}">Delete Task</button>
                `;

                taskListDiv.appendChild(taskDiv);
            });

            // Setup delete buttons for each task
            setupDeleteButtons();
        })
        .catch(error => console.error('Error fetching tasks:', error));
}

// Function to handle task deletion
function setupDeleteButtons() {
    document.querySelectorAll('.delete-task-button').forEach(button => {
        button.addEventListener('click', function() {
            const taskId = this.getAttribute('data-task-id');
            const userId = localStorage.getItem('userId'); // Retrieve userId from localStorage

            if (confirm('Are you sure you want to delete this task?')) { // Confirmation prompt
                fetch(`/task/${taskId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ user_id: userId }) // Send userId with the request
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    alert(data.message); // Show success message
                    document.getElementById(`task-${taskId}`).remove(); // Remove task from DOM
                })
                .catch(error => console.error('Error deleting task:', error));
            }
        });
    });
}
