const form = document.getElementById("signupForm");

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Define the request payload
    const requestData = {
        username: username,
        email: email,
        password: password
    };

    try {
        // Send the POST request to the /users/register endpoint
        const response = await fetch("/users/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestData)
        });

        // Handle the response
        if (response.ok) {
            const data = await response.json();
            alert("Registration successful!");
            console.log(data);
        } else {
            const errorData = await response.json();
            alert(`Registration failed: ${errorData.message}`);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred during registration. Please try again.");
    }
});