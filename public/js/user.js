document.getElementById('user-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the default form submission

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value;
    const confirmpassword = document.getElementById('confirmpassword').value;

    if (password !== confirmpassword){
        alert("Passwords do not match");
        return;
    }

    fetch('/user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, email }),
    })
    .then(response => response.json())
    .then(data => {
        // Display the user ID received from the server
        document.getElementById('result').innerText = 
            data.message + ` Your User ID is: ${data.userId}`;
    })
    .catch(error => {
        console.error('Error adding user:', error);
        document.getElementById('result').innerText = 'Failed to add user.';
    });
});
