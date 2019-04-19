const request = require("request");
const {promisify} = require('util');
const requestAsync= promisify(request);

var result = 1.0;

module.exports = {
	fetchPrice: async function (pair) {
		if (Math.random() < 0.3) {
			var price = result + Math.random() * 0.2 - 0.1;
			console.log(price + ' (outlier)');
			return price;
		} else {
			result += Math.random() * 0.01 - 0.005;
			console.log(result);
			return result
		}
	}
}