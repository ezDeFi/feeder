var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser'); //parses information from POST
var request = require("request");
var moment = require("moment");
const path = require('path')
const fs = require('fs')

let MANUAL_PRICE = 0
//MANUAL_PRICE = 1 //Uncomment this line if you dont want to use manual mode

router.get('/', async function(req, res, next) {
    let timestamp = moment().unix();
    if (MANUAL_PRICE) {
        res.json({"exchange":"manual","price":MANUAL_PRICE,timestamp})
        return;
    }
    let exchange_name = randomExchange();
    if (!exchange_name) {
        res.send("At least one exchange is needed");
        return;
    }
    let exchange = require(__dirname + "/../exchange_modules/_" + exchange_name + ".js")
    let price = await exchange.fetchPrice();
    if (!price) {
        console.log("Error during fetching price!");
        return;
    }
    res.json({"exchange":exchange_name,price,timestamp})
})

randomExchange = function () {
    let file_names = fs.readdirSync(__dirname + "/../exchange_modules")
    let matched_files = []
    for (var key in file_names) {
        if (file_names[key].substring(0,1)=="_") {
            matched_files.push(file_names[key])
        }
    }
    let exchange_name  = matched_files[Math.floor(Math.random() * matched_files.length)];
    if (!exchange_name) {
        console.log("At least one exchange is needed")
        return false
    }
    exchange_name = exchange_name.substring(1);
    exchange_name = exchange_name.substring(0,exchange_name.length-3);
    return exchange_name;
}

module.exports = router;