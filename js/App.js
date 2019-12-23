var weatherAppGlobal = weatherAppGlobal || {};

(function (window, $, WeatherApp, Vue) {
	'use strict';
	WeatherApp.App = new Vue({
		el: '#app'
	});

})(window, jQuery, weatherAppGlobal, Vue)
