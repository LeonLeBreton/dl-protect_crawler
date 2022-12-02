const pup = require("puppeteer");
const ac = require("@antiadmin/anticaptchaofficial");
const { antiCaptchaKey } = require("../anticaptchakey.json");


async function dl_protect_crawler(urls, verbose = false) {
    /*
    Récupère les liens de téléchargement des liens dl-protect fourni
    Prends un array d'url en entrée
    Verbose permet d'avoir plus d'information sur le déroulement du script
    Retourne un array de lien de téléchargement
    */
    if (!verbose) {
        console.log = function () { };
        ac.shutUp();
    }
    var links = [];
    ac.setAPIKey(antiCaptchaKey);
    for (let url of urls) {
        try {
            console.log("Ouverture du navigateur");
            var browser = await pup.launch();
            var page = await browser.newPage();
            await page.goto(url);

            console.log("Résolution du captcha");
            var token = await ac.solveTurnstileProxyless(url, '0x4AAAAAAABKK-fmValRCMjW');
            console.log("Captcha résolu : " + token);

            console.log("Remplissage du captcha");
            await page.waitForSelector('[id^="cf-chl-widget-"][id*="_response"]');
            await page.evaluate(`document.querySelector('[id^="cf-chl-widget-"][id*="_response"]')["value"] = "${token}";`);

            console.log("Validation du captcha");
            await page.evaluate('document.getElementById("subButton").removeAttribute("disabled")');
            await Promise.all([
                page.click('#subButton', button => button.click()),
                page.waitForNavigation({ waitUntil: "networkidle0" })
            ]);

            console.log("Récupération du lien");
            let lien = await page.evaluate('document.querySelectorAll("div.col-md-12.urls.text-center")[0]["innerHTML"]');
            lien = lien.replace(/<[^>]*>/g, "").replace("-->", "").trim();

            console.log("Lien : " + lien);
            links.push(lien);
            console.log("Fermeture du navigateur");
            await browser.close();
        } catch (err) {
            console.log("Erreur, le lien sera retraîté");
            await page.screenshot({ path: 'error.png' });
            urls.push(url); // On rajoute l'url à la liste des urls à traiter
        }
    }
    return links;
}

module.exports = dl_protect_crawler;

