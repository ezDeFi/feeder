const request = require("request");
const {promisify} = require('util');
const requestAsync= promisify(request);

var result = 1.0;
var resetting = false;

module.exports = {
	fetchPrice: async function (pair) {
		if (!resetting && Math.random() < 0.03) {
			// reset the price every once in a while
			resetting = true;
			console.log('start resetting');
		}

		let delta = Math.random() * 0.02 - 0.01;

		if (resetting) {
			delta = -Math.sign(result - 1.0) * Math.abs(delta)
			resultNew = result + delta;
			if (Math.sign(resultNew - 1.0) != Math.sign(result - 1.0)) {
				resetting = false;
				console.log('done resetting');
			} else {
				console.log('resetting');
			}				
		}

		result += delta;
		console.log(result);

		if (Math.random() < 0.3) {
			let outlier = result + delta * 3;
			console.log(outlier, 'outlier');
			return outlier;
		}

		return result;
	}
}