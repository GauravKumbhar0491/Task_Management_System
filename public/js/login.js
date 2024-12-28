document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const loginData = {
        username,
        password
    };

//     fetch('/login', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(loginData)
//     })
//     .then(response => {
//         console.log(response.status);
//         response.json();
//     })
//     .then(data => {
//         // document.getElementById('login-result').innerText = data.message;
//         if (data.token) {
//             // Save the token for future authenticated requests
//             localStorage.setItem('token', data.token);
//             localStorage.setItem('userId', data.userId); // Store userId in localStorage
//             // Optionally, redirect to another page
//             window.location.href = '/dashboard'; // Change to your dashboard URL
//         }
//     })
//     .catch(error => console.error('Error:', error));
// 

fetch('/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(loginData)
})
.then(response => {
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
})
.then(data => {
    console.log('Server response:', data); // Log the full response from the server
    if (data.token) {
        localStorage.setItem('token', data.token); // Save token to local storage
        localStorage.setItem('userId', data.userId);
        alert('Login Successful');
        window.location.href = '/dashboard';
    } else {
        alert('Login failed');
    }
})
.catch(error => {
    console.error('Error:', error);
    document.getElementById('login-result').innerText = `Login failed: ${error.message}`;
});
});
