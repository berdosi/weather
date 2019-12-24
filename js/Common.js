var weatherAppGlobal = weatherAppGlobal || {};

(function WeatherAppCommon(window, $, WeatherApp, Vue) {
	WeatherApp.data = {
		metric: 'metric',
		selectedCity: {},
		homeCity: {},
	};

	WeatherApp.setSelectedCity = function setSelectedCity(city) {
		WeatherApp.data.selectedCity = city;
	};
	WeatherApp.setHomeCity = function setHomeCity(city) {
		WeatherApp.data.homeCity = city;
	}
	WeatherApp.setMetric = function setMetric(metric) {
		WeatherApp.data.metric = metric;
	}


	WeatherApp.utils = {
		undef: function undef(obj) {
			return typeof obj === 'undefined' || obj === undefined;
		},
		emptyStr: function emptyStr(obj) {
			return WeatherApp.utils.undef(obj) || obj == '';
		},
		deepCopy: function deepCopy(obj) {
			return JSON.parse(JSON.stringify(obj));
		}
	}

	WeatherApp.mixins = {
		hasMetricRepresentation: {
			computed: {
				metricRepresentation: function () {
					if (this.metric == 'kelvin') {
						return '°K';
					}
					else if (this.metric == 'imperial') {
						return '°F';
					}
					else {
						return '°C';
					}
				}
			}
		},
		hasOwncloudAppImgPath: {
			data: function () {
				return {
					owncloudAppImgPath: OC.filePath('weather', 'img', '').replace('index.php/', '')
				}
			}
		},
		hasFatalError: {
			data: function () {
				return {
					g_error500: t('weather', 'Fatal Error: please check your nextcloud.log and send a bug report here: https://github.com/nextcloud/weather/issues')
				}
			}
		}
	}
})(window, jQuery, weatherAppGlobal, Vue)