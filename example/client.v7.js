const request = require('request');

const sendRequest = function (login, password) {
    const result = {
        login,
        password
    };
    const promise = new Promise(function (res, rej) {
        result.start = Date.now(),
            request.post(
                'http://127.0.0.1:3030/api/v1/login',
                {json: {login, password}},
                function (error, response, body) {
                    if (!error && response.statusCode === 200) {
                        result.end = Date.now();
                        res(result);
                    }
                }
            );
    });
    return promise;
}

function makePassword(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

const run = async () => {
    const responseArray = [];
    for (let i = 0; i < 20; i++) {
        const res = await sendRequest((i % 2 === 0) ? "v7" : "v7_wrong", makePassword(8));
        responseArray.push(res);
    }
    return responseArray
};

run().then((responseArray) => {
    responseArray.map((response) => {
        console.log(response.login, response.end - response.start)
    })
});
