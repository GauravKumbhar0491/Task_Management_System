document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('task-form');

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const userId = localStorage.getItem('userId');
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const priority = document.getElementById('priority').value;
        const deadline = document.getElementById('deadline').value;
        const status = document.getElementById('status').value;

        const taskData = {
            user_id: userId,
            title,
            description,
            priority,
            deadline,
            status
        };

        fetch('/task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        })
        .then(response => response.json())
        .then(data => {
            
            console.log('Task added:', data);
            // Display the new task immediately
            addTaskToDisplay({
                id: data.taskId,
                title,
                description,
                priority,
                deadline,
                status
            });
            // Clear the form
            form.reset();
        })
        .catch(error => console.error('Error:', error));
    });

    // Function to add a task to the display
    function addTaskToDisplay(task) {
        const taskList = document.getElementById('task-list');

        const taskDiv = document.createElement('div');
        taskDiv.classList.add('task');
        taskDiv.innerHTML = `
            <h3>Task ID: ${task.id} - ${task.title}</h3>
            <p>Description: ${task.description}</p>
            <p>Priority: ${task.priority}</p>
            <p>Deadline: ${task.deadline}</p>
            <p>Status: ${task.status}</p>
        `;
        taskList.appendChild(taskDiv);
    }

    // Function to display all tasks (fetch from the server)
    function displayTasks() {
        fetch('/tasks')
            .then(response => response.json())
            .then(tasks => {
                const taskList = document.getElementById('task-list');
                taskList.innerHTML = ''; // Clear the list

                tasks.forEach(task => {
                    addTaskToDisplay(task);
                });
            })
            .catch(error => console.error('Error fetching tasks:', error));
    }

    // Fetch tasks initially
    displayTasks();
});
