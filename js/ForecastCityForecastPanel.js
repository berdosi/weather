var weatherAppGlobal = weatherAppGlobal || {};

(function (window, $, WeatherApp, Vue) {
	'use strict';

	Vue.component("forecast-city-forecast-panel", {
		props: {
			forecastItems: { type: Array, default: [] },
			toShow: { type: Boolean, default: false }
		},
		computed: {
			metricRepresentation: function () {
				if (WeatherApp.data.metric == 'kelvin') {
					return '°K';
				}
				else if (WeatherApp.data.metric == 'imperial') {
					return '°F';
				}
				else {
					return '°C';
				}
			}
		},
		template: "#forecast-forecast-panel-template"
	})
})(window, jQuery, weatherAppGlobal, Vue)