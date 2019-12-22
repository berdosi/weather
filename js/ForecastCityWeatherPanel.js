var weatherAppGlobal = weatherAppGlobal || {};

(function (window, $, WeatherApp, Vue) {
	'use strict';

	Vue.component("forecast-city-weather-panel", {
		props: {
			name: { type: String, default: '' },
			cityId: { type: String, default: '' },
			country: { type: String, default: '' },
			isHomeCity: { type: Boolean, default: false },
			owncloudAppImgPath: { type: String, default: '' },
			selectedCityId: { type: String, default: '' },
			homeCityId: { type: String, default: '' },
			temp: { type: Number, default: 0 },
			pressure: { type: Number, default: 0 },
			humidity: { type: Number, default: 0 },
			description: { type: String, default: '' },
			windSpeed: { type: Number, default: 0 },
			sunrise: { type: Number, default: 0 },
			sunset: { type: Number, default: 0 },
			toShow: { type: Boolean, default: false },
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
								name: WeatherApp.CityList.cities.find(function findCityName(city) { return city.id === cityId }).name
							}; // TODO set the name as well
						}
						else {
							alert(t('weather', 'Failed to set home. Please contact your administrator'));
						}
					}.bind(WeatherApp.ForecastPanel))
					.fail(function setHomeFail(r) {
						console.error(r, WeatherApp.data.g_error500);
					}.bind(WeatherApp.ForecastPanel));
			}
		},
		mixins: [WeatherApp.mixins.hasMetricRepresentation],
		computed: {
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
			}
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