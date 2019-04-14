const request = require("request");
const {promisify} = require('util');
const requestAsync= promisify(request);

var result = 1.0;

module.exports = {
	fetchPrice: async function (pair) {
		result += Math.random() * 0.01 - 0.005;
		return result;
	}
}