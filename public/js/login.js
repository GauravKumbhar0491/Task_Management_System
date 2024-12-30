document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get the values from the input fields
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Prepare the data to send in the request
    const loginData = {
        username,
        password
    };

    // Send POST request to the server for login
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData) // Send login credentials as JSON
    })
    .then(response => {
        // Check if the response is OK
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Parse JSON response
    })
    .then(data => {
        console.log('Server response:', data); // Log the full response from the server

        // If a token is returned, save it in localStorage and redirect to dashboard
        if (data.token) {
            localStorage.setItem('token', data.token); // Store the JWT token
            localStorage.setItem('userId', data.userId); // Store the userId in localStorage
            alert('Login Successful');
            window.location.href = '/dashboard'; // Redirect to dashboard
        } else {
            alert('Login failed. Please check your username and password.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // Show error message on the page
        document.getElementById('login-result').innerText = `Login failed: ${error.message}`;
    });
});
