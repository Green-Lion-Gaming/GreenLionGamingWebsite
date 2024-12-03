document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('login-form');

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        event.stopPropagation();

        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        try {
            const response = await fetch('/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, rememberMe }),
            });

            if (response.ok) {
                const data = await response.json();

                // Create a cookie with the session token
                const sessionToken = data.sessionToken;
                const cookieExpiration = rememberMe
                    ? '; max-age=604800'
                    : '';

                document.cookie = `sessionToken=${sessionToken}; path=/;${cookieExpiration}`;

                // Redirect
                window.location.href = '/home';
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An unexpected error occurred. Please try again later.');
        }
    });
})
