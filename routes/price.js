var express = require('express');
var bodyParser = require('body-parser'); //parses information from POST
var md5 = require("md5");
var moment = require("moment");

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('./modules/price/manual_price.json')
db = low(adapter)


let configs = require('./../modules/price/config.json');
var app = express()
app.use(bodyParser.json())



app.get("/:pair/manual", async function (req, res) {
    var matched_pair = configs.find(config => config.pair === req.params.pair)
    if (!matched_pair) {
        res.send("Pair "+ req.params.pair +" has not been configured")
        return
    }
    let manual_price = db.has(req.params.pair).value() ? db.get(req.params.pair).value() : 0
    let html = `
    <input name=manual_price type=number id=manual_price placeholder="Manual price in USD" value="` + manual_price + `"></input>
<button id=submit_price>Set Manual Price</button>    
<button id=cancel_price>Cancel Manual Price</button>
<br>Password: <input name=password id=password placeholder="Enter Password" onchange="storePassword()"></input>
<div id=request_status style="margin-top: 20px; color: green"></div>
<script>
    document.getElementById("submit_price").onclick = function () {
        updateManualPrice();
    }
    document.getElementById("cancel_price").onclick = function () {
        document.getElementById("request_status").textContent = "Processing..."
        document.getElementById("cancel_price").disabled = true;
        fetch("/price/`+ req.params.pair +`/setmanualprice", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({manual_price:0, password: document.getElementById("password").value})
          }).catch(err => {
            document.getElementById("cancel_price").disabled = false;
            document.getElementById("request_status").textContent = "Some error happened"
          }).then (res => {
            response = res.clone()
            return response.text();
        }).then(res => {
          document.getElementById("cancel_price").disabled = false;
          getPrice();
          document.getElementById("request_status").textContent = res
        });
    }
    updateManualPrice = function() {
        document.getElementById("request_status").textContent = "Processing..."
        document.getElementById("submit_price").disabled = true;
        fetch("/price/`+ req.params.pair +`/setmanualprice", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({manual_price:document.getElementById("manual_price").value, password: document.getElementById("password").value})
          }).catch(err => {
            document.getElementById("submit_price").disabled = false;
            document.getElementById("request_status").textContent = "Some error happened"
            setTimeout(() => {
                document.getElementById("manual_price").focus()
            }, 200);
          }).then (res => {
              response = res.clone()
              return response.text();
          }).then(res => {
            document.getElementById("submit_price").disabled = false;
            getPrice();
            document.getElementById("request_status").textContent = res
            setTimeout(() => {
                document.getElementById("manual_price").focus()
            }, 200);
          });
    }
    getPrice = async function() {
        document.getElementById("manual_price").disabled = true;
        fetch("/price/`+ req.params.pair +`/getprice", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
          }).catch(err => {
            document.getElementById("request_status").textContent = "Some error happened"
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


app.get("/manual", async function (req, res) {
    let html = `<h1>Select pair to config:</h1>`
    for (key = 0; key < configs.length; key++) {
        html += `<a href="/price/`+ configs[key].pair +`/manual">`+ configs[key].pair +`</a><br/>`
    }
    res.send(html)
})

app.post('/:pair/setmanualprice', async function (req, res) {
    var matched_pair = configs.find(config => config.pair === req.params.pair)
    if (!matched_pair) {
        res.send("Pair "+ req.params.pair +" has not been configured")
        return
    }
    //console.log(md5(req.body.password))
    if (md5(req.body.password) != "dfc639c030af8bfc2566e8d9fd52cc63") {
        res.send("Incorrect password")
        return
    }
    let manual_price = req.body.manual_price
    console.log("Set MANUAL_PRICE to: ", manual_price)
    db.set(req.params.pair, req.body.manual_price).write()
    res.send("Manual Price Updated to: " + manual_price)
    //Write file
})

app.get('/:pair/getprice', async function (req, res) {
    var matched_pair = configs.find(config => config.pair === req.params.pair)
    if (!matched_pair) {
        res.send("Pair "+ req.params.pair +" has not been configured")
        return
    }
    let manual_price = db.has(req.params.pair).value() ? db.get(req.params.pair).value() : 0
    res.send(""+manual_price+"")
})


app.get('/:pair', async function(req, res) {
    var matched_pair = configs.find(config => config.pair === req.params.pair)
    if (!matched_pair) {
        res.send("Pair "+ req.params.pair +" has not been configured")
        return
    }
    let manual_price = db.has(req.params.pair).value() ? db.get(req.params.pair).value() : 0
    let timestamp = moment().unix();
    if (manual_price) {
        res.json({"exchange":"manual","price":manual_price,timestamp})
        return;
    }

    //Get random exchange
    let exchange = matched_pair.exchanges[Math.floor(Math.random()*matched_pair.exchanges.length)];

    if (!exchange.name) {
        res.send("At least one exchange is needed");
        return;
    }
    let exchange_script = require("./../modules/price/" + exchange.path)
    let price = await exchange_script.fetchPrice(req.params.pair);
    if (!price) {
        console.log("Error during fetching price!");
        return;
    }
    res.json({"exchange":exchange.name,price,timestamp})
})

module.exports = app;