const request = require("request");
const {promisify} = require('util');
const requestAsync= promisify(request);

module.exports = {
	fetchPrice: async function (pair) {
		let result = false;
		let response = await requestAsync({url:'https://api.binance.com/api/v3/ticker/price?symbol='+pair.toUpperCase().replace("_","")}).catch(function () {
			return false
		})
		let price = JSON.parse(response.body).price;
		if (price) result = parseFloat(price);
		return result;
	}
}