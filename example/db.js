const sql = () => require("sqlite3").verbose();

const initTable = (db) => {
  db.serialize(function () {
    db.run("CREATE TABLE IF NOT EXISTS users (login TEXT NOT NULL UNIQUE, password TEXT NOT NULL)");
  });
}


const selectAll = (db) => {
  db.serialize(function () {
    db.each("SELECT rowid AS id, login, password FROM users", function (err, row) {
      console.log(`${row.id}: ${row.login} , ${row.password}`);
    });
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

const initConn = (sqlite3) => {
  const db = new sqlite3.Database('db/users.db', (err) => {
    if (err) {
      console.log('Could not connect to database', err)
    } else {
      console.log('Connected to database')
    }
  });
  return db;
}

module.exports = {
  sql,
  initConn,
  initTable,
  createUser,
  deleteUser,
  selectAll
}