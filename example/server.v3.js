const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());

const db = require('./db');
const sql = db.sql();
const conn = db.initConn(sql);

db.deleteUser('v1');
db.createUser('v1', '123456');

app.get('/api/v1/login', (req, res) => {
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
                    if (req.query.password === rows[0].password) {
                        loginFlag = true;
                    }
                }
                res.send(loginFlag ? 'logged in' : 'bad news');
            }
        })
});

app.listen(3030, () => {
    console.log("start");
});
