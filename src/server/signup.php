<?php
session_start();
require 'db_connect.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Retrieve and sanitize input
    $firstname = trim($_POST['firstname']);
    $lastname = trim($_POST['lastname']);
    $username = trim($_POST['username']);
    $email = trim($_POST['email']);
    $password = $_POST['password'];
    $confirm_password = $_POST['confirm-password'];
    $city = trim($_POST['city']);
    $state = trim($_POST['state']);
    $zipcode = trim($_POST['zipcode']);

    // Validate input
    if (
        empty($firstname) || empty($lastname) || empty($username) || empty($email) ||
        empty($password) || empty($confirm_password) || empty($city) || empty($state) || empty($zipcode)
    ) {
        $_SESSION['error'] = "All fields are required.";
        header("Location: signup.html");
        exit();
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $_SESSION['error'] = "Invalid email format.";
        header("Location: signup.html");
        exit();
    }

    if ($password !== $confirm_password) {
        $_SESSION['error'] = "Passwords do not match.";
        header("Location: signup.html");
        exit();
    }

    // Hash the password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Check if username or email already exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
    $stmt->bind_param("ss", $username, $email);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $_SESSION['error'] = "Username or email already exists.";
        header("Location: signup.html");
        exit();
    }

    // Insert the new user into the database
    $stmt = $conn->prepare("INSERT INTO users (firstname, lastname, username, email, password, city, state, zipcode) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssssss", $firstname, $lastname, $username, $email, $hashed_password, $city, $state, $zipcode);
    $stmt->execute();

    $_SESSION['success'] = "Account created successfully!";
    header("Location: login.html");
    exit();
}
