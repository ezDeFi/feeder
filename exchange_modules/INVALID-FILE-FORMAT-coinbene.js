//This is an invalid file format for price feeding logic from exchanges. Correct one is _exchangename.js
const request = require("request");
const {promisify} = require('util');
const requestAsync= promisify(request);

module.exports = {
	fetchPrice: async function () {
		let result = false;
		let response = await requestAsync({url:'https://openapi.idax.pro/api/v2/ticker?pair=NTY_USDT'}).catch(function () {
			return false
		})
		let ticker = JSON.parse(response.body).ticker;
		if (ticker[0].last) result = parseFloat(ticker[0].last);
		return result;
	}
}