const express = require("express")
const http = require('http');
const https = require('https');
const session = require('express-session')
const bodyParser = require("body-parser");
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { constants } = require("buffer");
const { listeners } = require("process");

const publicDir = path.join(__dirname, '../client/public');

var privateKey = fs.readFileSync('./src/server/server.key');
var sslCert = fs.readFileSync('./src/server/server.crt');

require("dotenv").config()

let connection = mysql.createConnection({
    "user": process.env.database_user,
    "password": process.env.database_password,
    "database": process.env.database_name,
    "host": process.env.database_host,
    "enableKeepAlive": true,
    "idleTimeout": 6 * 60 * 60 * 1000 // 12 Hour
});

// Keep alive
setInterval(() => {
    connection.query('SELECT 1', (err) => {
        if (err) {
            console.error('Error running keep-alive query:', err.message);
        } else {
            console.log('Pinged db successfully');
        }
    });
}, 60 * 1000); // 1 min

// Handle connection errors
connection.on('error', (err) => {
    console.error('Database error:', err.message);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Reconnecting...');
        connection = mysql.createConnection({
            "user": process.env.database_user,
            "password": process.env.database_password,
            "database": process.env.database_name,
            "host": process.env.database_host,
            "enableKeepAlive": true,
            "idleTimeout": 6 * 60 * 60 * 1000 // 12 Hour
        });
    }
});

const app = express();
let credentials = {key: privateKey, cert: sslCert};

app.use(bodyParser.json());
app.use(express.static(publicDir));
app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: process.env["session_key"],
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}))

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);



app.get("/customer/get-customer/:id", async function (req, res) {
    try {
        connection.query(
            'SELECT * FROM `customers` WHERE `customer_id` = ?',
            [req.params.id], function (err, results) {
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


app.get("/marketplace/products", async function (req, res) {
    let pageLimit = req.query.size ? Number(req.query.size) : 50

    if (pageLimit > 50) {
        pageLimit = 50;
    }
    try {
        connection.query(
            'SELECT * from `products` LIMIT ?', [pageLimit],
            function (err, results, fields) {
                if (results && results != undefined) {
                    res.json(results)
                } else {
                    res.status(400).send({ message: "Cannot retreive store products" })
                }
            }
        )
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "Internal server error, please try again." })
    }
})

app.post("/customer/get-cart", async function (req, res) {
    const productIds = req.body;

    if (!productIds) {
        return res.status(200).send({ message: "No products found."})
    }

    const query = `SELECT * FROM products WHERE id IN (${productIds.map(id => `"${id}"`).join(", ")});`;
    let mapProducts = productIds.map(id => `"${id}"`).join(", ")

    connection.query(query, function(err, rows) {
        if (rows && rows.length === 0) {
            return res.status(200).send({ message: "No products found."})
        }

        res.status(200).send({ products: rows });
    })
})

app.post("/customer/register", async function (req, res) {
    try {
        connection.query(
            'INSERT INTO `customers` (first_name, last_name, billing_street, billing_city, billing_state, billing_zipcode) '
            + 'VALUES (?, ?, ?, ?, ?, ?)', [req.body.first_name, req.body.last_name, req.body.street, req.body.city, req.body.state, req.body.zipcode],
            function (err, results, fields) {
                console.log(results)
                if (results) {
                    res.send({ "message": `Registered account: ${req.body.first_name + " " + req.body.last_name}` })
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

app.post('/users/login', async function (req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    try {

        // Fetch user details from database
        connection.query(
            'SELECT user_id, password, session FROM users WHERE email = ?',
            [email],
            async function (err, rows, fields) {
                if (rows.length != 0) {
                    const user = rows[0];
                    const isPasswordValid = await bcrypt.compare(password, user.password);

                    if (!isPasswordValid) {
                        return res.status(401).json({ message: 'Invalid email or password.' });
                    }
                    // Generate a session token and save it in the database
                    const sessionToken = req.sessionID; // Use the session ID as the token
                    req.session.userId = user.user_id; // Save user ID in session

                    connection.query(
                        'UPDATE users SET session = ? WHERE user_id = ?',
                        [sessionToken, user.user_id]
                    );
                    res.status(200).json({ message: 'Login successful', sessionToken });
                } else {
                    res.status(400).send({ message: "Invalid email or password." })
                }
            });
    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

app.post('/users/logout', async function (req, res) {
    const { sessionToken } = req.body;

    if (!sessionToken) {
        return res.status(400).json({ message: "No user is logged in!" });
    }

    try {
        connection.query('SELECT user_id,username FROm users WHERE session = ?', [sessionToken],
            async function (err, results) {
                if (results.length != 0) {
                    let user = results[0];
                    connection.query(
                        'UPDATE users SET session = ? WHERE user_id = ?',
                        ["", user.user_id]
                    );

                    res.status(200).json({ message: 'Logged out successfully' });
                }
            });
    } catch (error) {
        console.error('Error during logout:', error.message);
        res.status(500).json({ message: 'Internal server error.' });
    }
})


app.post("/users/register", async function (req, res) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).send({ message: "Username, email, and password are required." });
    }

    try {
        // Hash the password for security
        const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds = 10

        // Insert user into the database
        connection.query(
            'INSERT INTO `users` (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword],
            function (err, results, fields) {
                if (err) {
                    console.log(err);
                    return res.status(400).send({ message: "Cannot register user at this time." });
                }

                res.status(200).send({ message: "User registered successfully!" });
            }
        );
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "Internal server error, please try again." });
    }
});

app.post('/users/session', async function (req, res) {
    const { sessionToken } = req.body;

    if (!sessionToken) {
        return res.status(400).json({ message: 'Session token is required.' });
    }
    try {

        connection.query(
            'SELECT username,email FROM users WHERE session = ?',
            [sessionToken],
            async function (err, rows) {
                if (rows.length === 0) {
                    return res.status(401).json({ message: 'Invalid or expired session.' });
                }
                const user = rows[0];

                res.status(200).json({ message: 'Validated session', username: user.username });
            }
        );
    } catch (error) {
        console.error('Error validating session:', error.message);
        res.status(500).json({ message: 'Internal server error.' });
    }
});



function getSubdirectories(srcPath) {
    return fs.readdirSync(srcPath).filter(file => {
        return fs.statSync(path.join(srcPath, file)).isDirectory();
    });
}

app.get(`/`, (req, res) => {
    res.redirect("/home");
})

// Handle server-side routing
getSubdirectories(publicDir).forEach(subDir => {
    app.get(`/${subDir}`, (req, res) => {
        const htmlFilePath = path.join(publicDir, subDir, 'index.html');

        if (fs.existsSync(htmlFilePath)) {
            res.sendFile(htmlFilePath);
        } else {
            res.status(404).send(`<h1>404 - Page not found in ${subDir}</h1>`);
        }
    });
});


httpServer.listen(80);
console.log("App listening on HTTP");
httpsServer.listen(3000);
console.log("App listening on HTTPS")
