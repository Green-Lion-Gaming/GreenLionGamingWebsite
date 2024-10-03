<?php
// db_connect.php

$servername = "localhost"; 
$username = "if0_37199863";
$password = "aRJNLYVRvg"; 
$dbname = "greenliongaming";

// Create Connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check Connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>