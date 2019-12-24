var weatherAppGlobal = weatherAppGlobal || {};

(function (window, $, WeatherApp, Vue) {
	'use strict';

	Vue.component("forecast-city-forecast-panel", {
		props: {
			forecastItems: { type: Array, default: [] },
			toShow: { type: Boolean, default: false },
			metric: { type: String, default: "metric" }
		},
		mixins: [WeatherApp.mixins.hasMetricRepresentation],
		template: "#forecast-forecast-panel-template"
	})
})(window, jQuery, weatherAppGlobal, Vue)