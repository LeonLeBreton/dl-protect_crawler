# Dl-Protect Crawler
Permet d'obtenir un lien protégé par dl-protect à l'aide de anti-captcha

## Configuration : 
Pour fonctionner un **compte 2Captcha avec des fonds** est nécessaire (il est sûrement possible d'un autre service anti-captcha avec quelque modification). Le token doit être renseigné dans le fichier **"anticaptchakey.json"**

## Utilisation via cli :

### Paramètres : 
| Arguments                                          | Description                                                                           |
| :------------------------------------------------- | :------------------------------------------------------------------------------------ |
| -v<br> --verbose                                   | Permet d'avoir des logs                                                               |
| -l "\<lien1,lien2\>"<br> --links "\<lien1,lien2\>" | Permet d'ajouter un ou plusieurs liens, les liens doivent être séparé par une virgule |
| -s<br> --save                                      | Sauvegarde les liens obtenu dans un fichier liens.txt                                 |
### Exemple :
```console
$ node main.js -v -s -l "lien1,lien2"
```

## Utilisation via import
```js
const getLink = require("./function/getLink.js")

let liens = await getLink(URL); //Sans Verbose
let liens = await getLink(URL, true); //Avec Verbose 
```
