document.getElementById('search-form').addEventListener('submit', function (event) {
    event.preventDefault();  // Prevent form from submitting the traditional way

    const title = document.getElementById('search-title').value;
    const priority = document.getElementById('search-priority').value;
    const status = document.getElementById('search-status').value;
    const userId = document.getElementById('search-user_id').value;

    const query = `?title=${title}&priority=${priority}&status=${status}&user_id=${userId}`;

    fetch(`/tasks/search${query}`)
        .then(response => response.json())
        .then(tasks => {
            const resultsDiv = document.getElementById('search-results');
            resultsDiv.innerHTML = '';  // Clear previous results

            if (tasks.length === 0) {
                resultsDiv.innerHTML = '<p>No tasks found</p>';
                return;
            }

            tasks.forEach(task => {
                const taskDiv = document.createElement('div');
                taskDiv.classList.add('task');
                taskDiv.innerHTML = `
                    <h3>${task.title}</h3>
                    <p>Description: ${task.description}</p>
                    <p>Priority: ${task.priority}</p>
                    <p>Deadline: ${task.deadline}</p>
                    <p>Status: ${task.status}</p>
                    <p>User ID: ${task.user_id}</p>
                `;
                resultsDiv.appendChild(taskDiv);
            });
        })
        .catch(error => console.error('Error fetching search results:', error));
});
