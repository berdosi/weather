var weatherAppGlobal = weatherAppGlobal || {};

(function WeatherAppCommon(window, $, exports) {
	exports.data = {
		metric: 'metric',
		selectedCity: {},
		homeCity: {},
	};
})(window, jQuery, weatherAppGlobal)