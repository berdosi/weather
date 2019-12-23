var weatherAppGlobal = weatherAppGlobal || {};

(function (window, $, WeatherApp, Vue) {
	'use strict';

	Vue.component("forecast-city-weather-panel", {
		props: {
			currentCity: { type: Object, default: function () { return {} } },
			toShow: { type: Boolean, default: false }
		},
		data: function () {
			return {
				sharedState: WeatherApp.data
			}
		},
		methods: {
			setHome: function setHome(cityId) {
				if (WeatherApp.utils.undef(cityId)) {
					console.error(WeatherApp.data.g_error500);
					return;
				}

				$.ajax({
					type: 'POST',
					url: OC.generateUrl('/apps/weather/settings/home/set'),
					data: { 'city': cityId },
					dataType: 'json'
				})
					.done(function setHomeSuccess(data) {
						if (data != null && !WeatherApp.utils.undef(data['set'])) {
							WeatherApp.data.homeCity = {
								id: cityId,
								name: this.$root.$refs["city-list"].cities.find(function findCityName(city) { return city.id === cityId }).name
							}; // TODO set the name as well
						}
						else {
							alert(t('weather', 'Failed to set home. Please contact your administrator'));
						}
					}.bind(this))
					.fail(function setHomeFail(r) {
						console.error(r, WeatherApp.data.g_error500);
					}.bind(WeatherApp.ForecastPanel));
			}
		},
		mixins: [WeatherApp.mixins.hasMetricRepresentation, WeatherApp.mixins.hasOwncloudAppImgPath],
		computed: {
			isHomeCity:      function() { return this.sharedState.selectedCity.id == (this.sharedState.homeCity || {}).id},
			name:            function() { return this.currentCity.name },
			country:         function() { return this.currentCity.country },
			temp:            function() { return parseFloat(this.currentCity.main.temp) },
			pressure:        function() { return parseFloat(this.currentCity.main.pressure) },
			humidity:        function() { return parseFloat(this.currentCity.main.humidity) },
			description:     function() { return this.currentCity.weather[0].description },
			selectedCityId:  function() { return this.sharedState.selectedCity.id },
			sunrise:         function() { return this.currentCity.sys.sunrise },
			sunset:          function() { return this.currentCity.sys.sunset },
			windDescription: function getWindDescription(degrees) {
				if (degrees < 23) return t('weather', 'North');
				if (degrees < 67) return t('weather', 'North-East');
				if (degrees < 113) return t('weather', 'East');
				if (degrees < 157) return t('weather', 'South-East');
				if (degrees < 201) return t('weather', 'South');
				if (degrees < 245) return t('weather', 'South-West');
				if (degrees < 289) return t('weather', 'West');
				if (degrees < 333) return t('weather', 'North-West');
				if (degrees > 332) return t('weather', 'North');
			},
			windSpeed:       function() { return parseFloat(this.currentCity.wind.speed) }
		},
		filters: {
			date: function formatDate(rawValue, formatString) {
				if (formatString !== "HH:mm") throw "Unrecognized format: " + formatString;
				const date = new Date(rawValue);
				return (date.getHours() > 9 ? "" : "0") +
					date.getHours() + ":" +
					(date.getMinutes() > 9 ? "" : "0") +
					date.getMinutes();
			}
		},
		template: "#forecast-city-panel-template"
	})
})(window, jQuery, weatherAppGlobal, Vue)