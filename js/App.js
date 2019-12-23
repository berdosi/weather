var weatherAppGlobal = weatherAppGlobal || {};

(function (window, $, WeatherApp, Vue) {
	'use strict';
	WeatherApp.App = new Vue({
		el: '#app',
		data: function weatherAppData() {
			return {hello: "world",
			sharedState: WeatherApp.data}
		}
	});

})(window, jQuery, weatherAppGlobal, Vue)
