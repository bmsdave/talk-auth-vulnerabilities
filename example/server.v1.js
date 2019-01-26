const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.get('/api/v1/login', (req, res) => {
    res.send('hello')
});

app.listen(3030, () => {
    console.log('start');
});
