'use strict';
module.exports = function (x) {
	x = Array.isArray(x) ? x : arguments;

	var sum = 0;
	var len = x.length;

	for (var i = 0; i < len; i++) {
		sum += x[i];
	}

	return sum / len;
};
