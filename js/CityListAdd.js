var weatherAppGlobal = weatherAppGlobal || {};

(function ($, WeatherApp, Vue, OC, t) {
	'use strict';

	WeatherApp.CityListItems = Vue.component("city-list-add", {
		template: "#city-list-add-template",
		data: function cityListAddData() {
			return {
				city: {
					name: '',
				},
				addCityError: '',
				showAddCity: false
			};
		},
		methods: {
			addCity: function addCity(city) {
				if (WeatherApp.utils.undef(city) || WeatherApp.utils.emptyStr(city.name)) {
					this.addCityError = t('weather', 'Empty city name!');
					return;
				}

				$.ajax({
					type: 'POST',
					url: OC.generateUrl('/apps/weather/city/add'),
					data: { 'name': city.name },
					dataType: 'json'
				})
					.done(function addCitySuccess(data) {
						if (data !== null && !WeatherApp.utils.undef(data.id)) {
							this.$parent.cities.push({ "name": city.name, "id": data.id });
							this.showAddCity = false;

							if (!WeatherApp.utils.undef(data.load) && data.load) {
								var loadingCity = WeatherApp.utils.deepCopy(city);
								loadingCity.id = data.id;
								this.loadCity(loadingCity);
							}
							city.name = "";
						}
						else {
							this.addCityError = t('weather', 'Failed to add city. Please contact your administrator');
						}
					}.bind(this))
					.fail(function addCityFail(r) {
						if (r.status === 401) {
							this.addCityError = t('weather', 'Your OpenWeatherMap API key is invalid. Contact your administrator to configure a valid API key in Additional Settings of the Administration');
						}
						else if (r.status === 404) {
							this.addCityError = t('weather', 'No city with this name found.');
						}
						else if (r.status === 409) {
							this.addCityError = t('weather', 'This city is already registered for your account.');
						}
						else {
							this.addCityError = this.g_error500;
						}
					}.bind(this));
			},
			loadCity: function loadCity(city) {
				WeatherApp.setSelectedCity(city);
			}
		}
	});
}(jQuery, weatherAppGlobal, Vue, OC, t));
