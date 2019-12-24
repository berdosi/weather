var weatherAppGlobal = weatherAppGlobal || {};

(function (window, $, WeatherApp, Vue) {
	'use strict';
	WeatherApp.App = new Vue({
		data: function WeatherAppData() {
			return WeatherApp.data
		},
		el: '#app',
		template: '#weather-app-template'
	});

})(window, jQuery, weatherAppGlobal, Vue)
