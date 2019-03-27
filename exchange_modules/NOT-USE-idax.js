const request = require("request");
const {promisify} = require('util');
const requestAsync= promisify(request);

module.exports = {
	fetchPrice: async function (pair) {
		//return 1.03 - Math.round((Math.random() * 6),2) / 100; //Test logic while we dont have nUSD listed
		let result = false;
		let response = await requestAsync({url:'https://openapi.idax.pro/api/v2/ticker?pair='+pair.toUpperCase()}).catch(function () {
			return false
		})
		let ticker = JSON.parse(response.body).ticker;
		if (ticker[0].last) result = parseFloat(ticker[0].last);
		return result;
	}
}