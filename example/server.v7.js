const express = require('express');
const bodyParser = require('body-parser');
const sql = require("sqlite3").verbose();
const bcrypt = require('bcrypt');

const initConn = (sqlite3) => {
    const conn = new sqlite3.Database('db/users.db', (err) => {
        if (err) {
            console.log('Could not connect to database', err)
        } else {
            console.log('Connected to database')
        }
    });
    return conn;
}

const initTable = (conn) => {
    conn.serialize(function () {
        conn.run("CREATE TABLE IF NOT EXISTS users (login TEXT NOT NULL UNIQUE, password TEXT NOT NULL)");
    });
}

const deleteUser = (db, login) => {
    db.serialize(() => {
        db.run(`DELETE FROM users WHERE login = $login;`, {
            $login: login
        })
    })
}

const createUser = (db, login, password) => {
    db.serialize(() => {
        db.run(`INSERT INTO users (login, password) VALUES ($login, $password);`, {
            $login: login,
            $password: password
        })
    })
}

const conn = initConn(sql);
initTable(conn);

const crypto = require('crypto');
const getFuncSHA256Salt = (salt) => {
    return (password) => {
        var hash = crypto.createHmac('sha256', salt);
        hash.update(password);
        var value = hash.digest('hex');
        return value;
    }
};
const cryptoSHA256Salt = getFuncSHA256Salt("HVHSNrRWpP1ZSR4bnjXpiHCS1ENYcUuHO")

deleteUser(conn, 'v7')
createUser(conn, 'v7', cryptoSHA256Salt("whatthefoxsay"))

const app = express();
app.use(bodyParser.json());

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
                let loginFlag = false
                if (rows && rows.length > 0) {
                    res.send( (cryptoSHA256Salt(req.body.password) === rows[0].password) ? 'logged in' : 'bad news' )
                } else {
                    res.send(loginFlag ? 'logged in' : 'bad news');
                }
            }
        })
})

app.listen(3030, () => {
    console.log('start');
})