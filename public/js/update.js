// Function to load task details
function loadTaskDetails(taskId) {
    fetch(`/task/${taskId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(task => {
            // Populate the update form with task details
            document.getElementById('update-task-id').value = task.id;
            document.getElementById('update-user-id').value = task.user_id; // Set user ID
            document.getElementById('update-title').value = task.title;
            document.getElementById('update-description').value = task.description;
            document.getElementById('update-priority').value = task.priority;
            document.getElementById('update-status').value = task.status;
        })
        .catch(error => console.error('Error fetching task details:', error));
}

// Event listener for the form submission
document.getElementById('update-task-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form from submitting the traditional way

    const taskId = document.getElementById('update-task-id').value; // Get task ID from input
    const userId = localStorage.getItem('userId');
    const updatedTask = {
        user_id: userId, // Include user ID
        title: document.getElementById('update-title').value,
        description: document.getElementById('update-description').value,
        priority: document.getElementById('update-priority').value,
        status: document.getElementById('update-status').value
    };

    fetch(`/task/${taskId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('update-result').innerText = data.message || 'Task updated successfully';
        // Optionally, you can clear the form or provide further feedback
    })
    .catch(error => {
        console.error('Error updating task:', error);
        document.getElementById('update-result').innerText = 'Failed to update task.';
    });
});

// Load task details when the task ID is provided in the form
document.getElementById('update-task-id').addEventListener('blur', function () {
    const taskId = this.value;
    if (taskId) {
        loadTaskDetails(taskId);
    }
});
