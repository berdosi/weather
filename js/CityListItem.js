var weatherAppGlobal = weatherAppGlobal || {};

(function (window, $, WeatherApp, Vue) {
	'use strict';

	WeatherApp.CityListItems = Vue.component("city-list-item", {
		template: "#city-list-item-template",
		props: {
			city: { type: Object, default: function () { return {} } },
			selectedCity: { type: Object, default: function () { return {} } },
			item: { type: Number, default: -1 },
			list: { type: Array, default: function () { return [] } }
		},
		methods: {
			deleteCity: function deleteCity(city) {
				// this method handles the removal from the server,
				// while CityList.removeCity() updates it on the list's model
				if (WeatherApp.utils.undef(city)) {
					console.error(WeatherApp.data.g_error500);
					return;
				}

				$.ajax({
					type: 'POST',
					url: OC.generateUrl('/apps/weather/city/delete'),
					data: { 'id': this.city.id },
					dataType: 'json'
				})
					.done(function deleteCitySuccess(data) {
						if (data != null && !WeatherApp.utils.undef(data['deleted'])) {
							this.$parent.removeCity(this.city)
						}
						else {
							alert(t('weather', 'Failed to remove city. Please contact your administrator'));
						}
					}.bind(this))
					.fail(function deleteCityFail(r) {
						console.error(r, WeatherApp.data.g_error500);
					}.bind(this));
			},
			loadCity: function loadCity(city) {
				WeatherApp.setSelectedCity(city);
			}
		}
	});
})(window, $, weatherAppGlobal, Vue)