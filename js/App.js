var weatherAppGlobal = weatherAppGlobal || {};

(function (WeatherApp, Vue) {
	'use strict';
	WeatherApp.App = new Vue({
		data: function WeatherAppData() {
			return WeatherApp.data;
		},
		el: '#app',
		template: '#weather-app-template'
	});

}(weatherAppGlobal, Vue));
