const { Cluster } = require("puppeteer-cluster");
const { twoCaptchaKey, maxConcurrency } = require("../config.json");

async function getCaptcha(URL, sitekey, apikey) {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    var tokenWait = await fetch("https://2captcha.com/in.php", {
        method: "POST",
        body: new URLSearchParams({
            key: apikey,
            method: "turnstile",
            sitekey: sitekey,
            pageurl: URL,
            json: "1",
        }),
    }).then((res) => res.json());
    console.log(tokenWait);
    do {
        await sleep(5000);
        var token = await fetch(
            `https://2captcha.com/res.php?key=${apikey}&action=get&id=${tokenWait.request}`
        ).then((res) => res.text());
        console.log(token);
    } while (token == "CAPCHA_NOT_READY");
    console.log(token);
    if (token.startsWith("ERROR")) {
        throw new Error(token);
    }
    return token.split("|")[1];
}

async function dl_protect_crawler(urls, verbose = false) {
    /*
    Récupère les liens de téléchargement des liens dl-protect fourni
    Prends un array d'url en entrée
    Verbose permet d'avoir plus d'information sur le déroulement du script
    Retourne un array de lien de téléchargement
    */
    if (!verbose) {
        console.log = function () {};
    }
    var links = [];

    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: maxConcurrency,
        retryLimit: 3,
        puppeteerOptions: {
            headless: "new",
        },
        timeout: 60000,
    });
    await cluster.task(async ({ page, data: url }) => {
        await page.goto(url);
        console.log("Résolution du captcha");
        var token = await getCaptcha(
            url,
            "0x4AAAAAAABKK-fmValRCMjW",
            twoCaptchaKey
        );
        console.log("Captcha résolu : " + token);

        console.log("Remplissage du captcha");
        await page.waitForSelector('[id^="cf-chl-widget-"][id*="_response"]');
        await page.evaluate(
            `document.querySelector('[id^="cf-chl-widget-"][id*="_response"]')["value"] = "${token}";`
        );

        console.log("Validation du captcha");
        const elementsToRemove = await page.$$(`body > :not(.container)`);

        for (let element of elementsToRemove) {
            await element.evaluate((el) => el.remove());
        }

        await page.evaluate(
            'document.getElementById("subButton").removeAttribute("disabled")'
        );
        await Promise.all([
            page.click("#subButton", (button) => button.click()),
            page.waitForNavigation({ waitUntil: "networkidle0" }),
        ]);

        console.log("Récupération du lien");
        let lien = await page.evaluate(
            'document.querySelectorAll("div.col-md-12.urls.text-center")[0]["innerHTML"]'
        );
        lien = lien
            .replace(/<[^>]*>/g, "")
            .replace("-->", "")
            .trim();

        console.log("Lien : " + lien);
        links.push(lien);
    });

    cluster.on("taskerror", (err, data, willRetry) => {
        if (willRetry) {
            console.warn(
                `Encountered an error while crawling ${data}. ${err.message}\nThis job will be retried`
            );
        } else {
            console.error(`Failed to crawl ${data}: ${err.message}`);
        }
    });

    for (let url of urls) {
        if (url.startsWith("https://dl-protect.")) {
            cluster.queue(url);
        } else {
            console.log("Lien non supporté : " + url);
        }
    }
    // Shutdown after everything is done
    await cluster.idle();
    await cluster.close();

    return links;
}

module.exports = dl_protect_crawler;
