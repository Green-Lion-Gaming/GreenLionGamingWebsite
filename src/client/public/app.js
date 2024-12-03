document.addEventListener('DOMContentLoaded', async function () {
    // Utility function to get a cookie value by name
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    document.getElementById('logout-section').style.display = 'none';

    // Check for session token
    const sessionToken = getCookie('sessionToken');

    if (sessionToken) {
        try {
            // Validate session token with the server
            const response = await fetch('/users/session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sessionToken }),
            });

            if (response.ok) {
                const data = await response.json();

                // If the session is valid, update certain elements
                document.getElementById('login-section').style.display = 'none';
                document.getElementById('signup-section').style.display = 'none';
                document.getElementById('logout-section').style.display = '';
                const userSection = document.getElementById('username-display');
                if (userSection) {
                    userSection.textContent = `Welcome, ${data.username}!`; 
                }
                const userNav = document.getElementById('user-nav')
                if (userNav) {
                    userNav.style.display = '';
                    document.getElementById('username-usernav').textContent = `${data.username}`
                    document.getElementById("profile-picture").style.display = ''
                }
            } else {
                console.warn('Session token is invalid or expired.');
                // Optionally, clear the cookie if invalid
                document.cookie = 'sessionToken=; path=/; max-age=0';
            }
        } catch (error) {
            console.error('Error validating session token:', error);
        }
    } else {
        console.log('No session token found.');
    }
});
