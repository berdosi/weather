var weatherAppGlobal = weatherAppGlobal || {};

(function (window, $, WeatherApp) {
	'use strict';

	WeatherApp.CityList = Vue.component("city-list", {
		template: "#city-list-template",
		props: {
			selectedCity: { type: Object, default: function () { return {} } }
		},
		data: function cityListState() {
			return {
				cities: []
			}
		},
		mixins: [WeatherApp.mixins.hasFatalError],
		methods: {
			loadCities: function loadCities() {
				$.ajax({
					type: "GET",
					url: OC.generateUrl('/apps/weather/city/getall'),
					dataType: 'json'
				})
					.done(function loadCitiesSuccess(data) {
						if (!WeatherApp.utils.undef(data['cities'])) {
							this.cities = data['cities'];
						}

						if (!WeatherApp.utils.undef(data['home'])) {
							WeatherApp.setHomeCity(
								data['cities'].find(function homeCityFilter(city) { return city.id == data['home'] }));

							// if the home city has just been deleted, select the first one instead
							WeatherApp.setSelectedCity(WeatherApp.utils.deepCopy(
								WeatherApp.utils.undef(WeatherApp.data.homeCity)
									? data['cities'][0]
									: WeatherApp.data.homeCity));
						}
						else if (this.cities.length > 0) { // If no home found, load first city found
							this.loadCity(this.cities[0]);
						}
					}.bind(this))
					.fail(function loadCitiesFail(r) { this.fatalError(); }.bind(this));
			},
			removeCity: function removeCity(cityToRemove) {
				// this method handles the removal from the model,
				// while CityListItem.deleteCity() updates it on the server
				this.cities = this.cities.filter(function citiesFilter(city) {
					return city.id !== cityToRemove.id;
				});

				// select the first item, if the selected item was removed
				if (this.cities.find(function findSelectedCity(city) {
					return city.id == this.selectedCity
				}.bind(this)) == undefined) {
					WeatherApp.setSelectedCity(this.cities[0]);
				}
			},
			fatalError: function fatalError(e) {
				console.error("fatal error", e);
			}
		},
		created: function cityListCreated() {
			this.loadCities();
		}
	});
})(window, jQuery, weatherAppGlobal);
