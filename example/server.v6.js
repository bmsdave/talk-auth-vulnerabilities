const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const db = require('./db');
const sql = db.sql();
const conn = db.initConn(sql);

const https = require('https');
const privateKey = fs.readFileSync('./server.key', 'utf8');
const certificate = fs.readFileSync('./server.cert', 'utf8');
const credentials = { key: privateKey, cert: certificate };

const crypto = require('crypto');
const getFuncSHA512Salt = (salt) => {
    return (password) => {
        var hash = crypto.createHmac('sha512', salt);
        hash.update(password);
        var value = hash.digest('hex');
        return value;
    }
};
const cryptoSHA512Salt = getFuncSHA512Salt("HVHSNrRWpP1ZSR4bnjXpiHCS1ENYcUuHO")

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
                    if (cryptoSHA512Salt(req.body.password) === rows[0].password) {
                        loginFlag = true;
                    }
                }
                res.send(loginFlag ? 'logged in' : 'bad news');
            }
        })
})

const httpsServer = https.createServer(credentials, app);
httpsServer.listen(3030);