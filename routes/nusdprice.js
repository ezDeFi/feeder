var express = require('express');
var bodyParser = require('body-parser'); //parses information from POST
var md5 = require("md5");

var request = require("request");
var moment = require("moment");
const path = require('path')
const fs = require('fs')
let {MANUAL_PRICE} = require('./../manual_price.json')

var app = express()
app.use(bodyParser.json())


app.get("/config", async function (req, res) {
    let html = `
    <input name=manual_price type=number id=manual_price placeholder="Manual price in USD" value="` + MANUAL_PRICE + `"></input>
<button id=submit_price>Set Manual Price</button>    
<button id=cancel_price>Cancel Manual Price</button>
<br>Password: <input name=password id=password placeholder="Enter Password" onchange="storePassword()"></input>
<script>
    document.getElementById("submit_price").onclick = function () {
        updateManualPrice();
    }
    document.getElementById("cancel_price").onclick = function () {
        document.getElementById("cancel_price").disabled = true;
        fetch("/nusd-price/setmanualprice", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({manual_price:0, password: document.getElementById("password").value})
          }).catch(err => {
            document.getElementById("cancel_price").disabled = false;
            alert("Some error happened");
          }).then (res => {
            response = res.clone()
            return response.text();
        }).then(res => {
          document.getElementById("cancel_price").disabled = false;
          getPrice();
          alert(res);
        });
    }
    updateManualPrice = function() {
        document.getElementById("submit_price").disabled = true;
        fetch("/nusd-price/setmanualprice", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({manual_price:document.getElementById("manual_price").value, password: document.getElementById("password").value})
          }).catch(err => {
            document.getElementById("submit_price").disabled = false;
            alert("Some error happened");
            setTimeout(() => {
                document.getElementById("manual_price").focus()
            }, 200);
          }).then (res => {
              response = res.clone()
              return response.text();
          }).then(res => {
            document.getElementById("submit_price").disabled = false;
            getPrice();
            alert(res);
            setTimeout(() => {
                document.getElementById("manual_price").focus()
            }, 200);
          });
    }
    getPrice = async function() {
        document.getElementById("manual_price").disabled = true;
        fetch("/nusd-price/getprice", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
          }).catch(err => {
            alert("Some error happened");
          }).then (res => {
            response = res.clone()
            return response.text();
        }).then(res => {
          document.getElementById("manual_price").value = new Number(res);
          document.getElementById("manual_price").disabled = false;
        });
    }
    storePassword = function () {
        localStorage.setItem("password", document.getElementById("password").value);
    }
    //Update password on start
    document.getElementById("password").value = localStorage.getItem("password");
    //Listening to input enter
    document.getElementById("manual_price")
    .addEventListener("keyup", function(event) {
        event.preventDefault();
        if (event.keyCode === 13) {
            updateManualPrice();
        }
    });
    </script>

    `
    res.send(html)
})

app.post('/setmanualprice', async function (req, res) {
    //console.log(md5(req.body.password))
    if (md5(req.body.password) != "dfc639c030af8bfc2566e8d9fd52cc63") {
        res.send("Incorrect password")
        return
    }
    MANUAL_PRICE = req.body.manual_price;
    console.log("Set MANUAL_PRICE to: ", MANUAL_PRICE)
    fs.writeFile( "manual_price.json", JSON.stringify({MANUAL_PRICE}), "utf8", function () {
        res.send("Manual Price Updated to: " + MANUAL_PRICE)
    } );
    //Write file
})

app.get('/getprice', async function (req, res) {
    res.send(""+MANUAL_PRICE+"")
})


app.get('/:pair', async function(req, res) {
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
    let price = await exchange.fetchPrice(req.params.pair);
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

module.exports = app;