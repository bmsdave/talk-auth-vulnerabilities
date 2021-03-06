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

db.deleteUser('v1');
db.createUser('v1', '123456');

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
                let loginFlag = false;
                if (rows && rows.length > 0) {
                    if (req.body.password === rows[0].password) {
                        loginFlag = true;
                    }
                }
                res.send(loginFlag ? 'logged in' : 'bad news');
            }
        })
});

const httpsServer = https.createServer(credentials, app);
httpsServer.listen(3030);
