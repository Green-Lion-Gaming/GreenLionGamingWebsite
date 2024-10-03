const express = require("express")
const app = express();
const bodyParser = require("body-parser");
const mysql = require('mysql2');

require("dotenv").config()

const connection = mysql.createConnection({
    "user": process.env.database_user,
    "password": process.env.database_password,
    "database": process.env.database_name,
    "host": process.env.database_host,
    "enableKeepAlive": true,
    "idleTimeout": 60 * 60 * 1000 // One Hour
});

app.use(bodyParser.json());


app.get("/customer/get-customer/:id", async function (req, res) {
    try {
        connection.query(
            'SELECT * FROM `customers` WHERE `customer_id` = ?',
            [req.params.id], function(err, results) {
                if (results && results[0] != undefined) {
                    res.send(results[0])
                } else {
                    res.status(404).send({ message: "User not found." })
                }  
            }
        );
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "Internal server error, please try again." })
    }
});

app.post("/customer/register", async function (req, res) {
    try {
        connection.query(
            'INSERT INTO `customers` (first_name, last_name, billing_street, billing_city, billing_state, billing_zipcode) '
            + 'VALUES (?, ?, ?, ?, ?, ?)', [req.body.first_name, req.body.last_name, req.body.street, req.body.city, req.body.state, req.body.zipcode],
            function(err, results, fields) {
                console.log(results)
                if (results) {
                    res.send({"message": `Registered account: ${req.body.first_name + " " + req.body.last_name}`})
                } else {
                    res.status(400).send({ message: "Cannot register" })
                }
            }
        );
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "Internal server error, please try again." })
    }
})


app.listen(3000);
console.log("App listening on port 3000!");