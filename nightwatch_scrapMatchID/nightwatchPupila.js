const fs = require('fs');
//const fsextra = require('fs-extra');
const secret = require('/volume/secretSite.js')


let date = new Date()
let timeLog = date.toISOString()

let url = secret.web

module.exports = {
    beforeEach: function (browser, done) {
        browser.resizeWindow(1920, 1080, done);

    },

    '1xbet e2e test': function (browser) {
        browser
            .url(url)
            .pause(30000)
            

        browser
        
        .execute(function () {


            let arraySoccer = []

            for (let n = 0; n < document.getElementsByClassName('betLive').length; n++) {

                let spid = document.getElementsByClassName('betLive')[n].getAttribute('data-sportid')
                console.log(spid)

                if (spid == "13") {

                    arraySoccer.push(document.getElementsByClassName('betLive')[n].getAttribute('data-matchid'))

                }
            }

            return arraySoccer 
           
            

            }, [],

            function (...arraySoccer) {

                console.log("--------------------------->" ,arraySoccer[0]["value"].length)

                fs.writeFile("/dataJson/partidos.json", JSON.stringify(arraySoccer), function (err) {
                    if (err) throw err;
                }
                );
            })     
        
    }
}

               

