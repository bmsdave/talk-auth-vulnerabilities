const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());

const db = require('./db');
const sql = db.sql();
const conn = db.initConn(sql);

const fs = require('fs');
const https = require('https');
const privateKey = fs.readFileSync('./server.key', 'utf8');
const certificate = fs.readFileSync('./server.cert', 'utf8');
const credentials = {key: privateKey, cert: certificate};

const bcrypt = require('bcrypt');
bcrypt.hash("whatthefoxsay", 10, function (err, hash) {
    db.deleteUser(conn, 'v6');
    // Store secure hash in user record
    db.createUser(conn, 'v7', hash)
});

app.post('/api/v1/login', (req, res) => {
    conn.all(`
        SELECT rowid AS id, login, password
           FROM users
            WHERE login = $login
        `, {
            $login: req.body.login
        },
        function (err, rows) {
            if (err) {
                res.send(err.message);
            } else {
                if (rows && rows.length > 0) {
                    // compare a provided password input with saved hash
                    bcrypt.compare(
                        req.body.password,
                        rows[0].password,
                        function (err, match) {
                            res.send(match ? 'logged in' : 'bad news');
                        }
                    );
                } else {
                    res.send('bad news');
                }
            }
        })
})
const httpsServer = https.createServer(credentials, app);
httpsServer.listen(3030);
