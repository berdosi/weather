var weatherAppGlobal = weatherAppGlobal || {};

(function WeatherAppCommon(window, $, exports) {
	exports.data = {
		metric: 'metric',
		selectedCity: {},
		homeCity: {},
		g_error500: t('weather', 'Fatal Error: please check your nextcloud.log and send a bug report here: https://github.com/nextcloud/weather/issues')
	};

	exports.utils = {
		undef: function undef(obj) {
			return typeof obj === 'undefined' || obj === undefined;
		},
		emptyStr: function emptyStr(obj) {
			return exports.utils.undef(obj) || obj == '';
		},
		deepCopy: function deepCopy(obj) {
			return JSON.parse(JSON.stringify(obj));
		}
	}

})(window, jQuery, weatherAppGlobal)