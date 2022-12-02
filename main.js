const crawler = require("./function/dl-protect_crawler.js");
const fs = require("fs");

(async () => {
    var args = process.argv.slice(2);
    var links = [];
    var linkflag = false;
    var verbose = false;
    for (i of args) {
        if (linkflag) {
            links = links.concat(i.replace(" ", "").trim().split(","));
            linkflag = false;
        }
        else if (i === '-l' || i === '--link') {
            linkflag = true;
        }
        else if (i === '-v' || i === '--verbose') {
            verbose = true;
        }
        else if (i === '-s' || i === '--save') {
            var save = true;
        }
    }
    if (links.length === 0) {
        console.log("Aucun lien fourni");
        return;
    }
    let liens = await crawler(links, verbose);
    
    console.log(liens);
    if (save) {
        fs.open("liens.txt", "w", (err, fd) => {
            if (err) {
                console.log("Erreur lors de l'ouverture du fichier");
                return;
            }
            fs.write(fd, liens.join("\r"), (err) => {
                if (err) {
                    console.log("Erreur lors de l'écriture du fichier");
                    return;
                }
                console.log("Fichier écrit");
            }
            );
        })
    }
})();