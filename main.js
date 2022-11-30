const pup = require("puppeteer");
const ac = require("@antiadmin/anticaptchaofficial");
const {antiCaptchaKey} = require("./anticaptchakey.json");

ac.setAPIKey(antiCaptchaKey);
const url = '';

(async () => {
    
    console.log("Résolution du captcha");
    let token = await ac.solveTurnstileProxyless(url, '0x4AAAAAAABKK-fmValRCMjW');
    console.log("Captcha résolu : " + token);

    console.log("Ouverture du navigateur");
    const browser = await pup.launch();
    const page = await browser.newPage();
    await page.goto(url);

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
    await browser.close();
})();