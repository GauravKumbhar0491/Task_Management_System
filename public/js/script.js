document.getElementById('search-form').addEventListener('submit', function (event) {
    event.preventDefault();  // Prevent form from submitting the traditional way

    // Get the values from the search form
    const title = document.getElementById('search-title').value;
    const priority = document.getElementById('search-priority').value;
    const status = document.getElementById('search-status').value;
    const userId = document.getElementById('search-user_id').value;

    // Construct the query string
    const query = `?title=${title}&priority=${priority}&status=${status}&user_id=${userId}`;

    // Fetch the search results from the server
    fetch(`/tasks/search${query}`)
        .then(response => response.json())  // Parse the response into JSON
        .then(tasks => {
            const resultsDiv = document.getElementById('search-results');
            resultsDiv.innerHTML = '';  // Clear previous results

            if (tasks.length === 0) {
                resultsDiv.innerHTML = '<p>No tasks found</p>';
                return;
            }

            // Iterate through the tasks and display them
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
        .catch(error => console.error('Error fetching search results:', error));  // Error handling
});
