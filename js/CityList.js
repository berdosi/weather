var weatherAppGlobal = weatherAppGlobal || {};

(function (window, $, WeatherApp) {
	'use strict';

	WeatherApp.CityList = new Vue({
		el: '#city-list-left .city-list',
		data: function cityListState() {
			return {
				item: 0,
				list: [],
				city: {
					name: '',
				},
				cities: [],
				addCityError: '',
				showAddCity: false,

				sharedState: WeatherApp.data
			}
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
						if (data != null && !WeatherApp.utils.undef(data['id'])) {
							this.cities.push({ "name": city.name, "id": data['id'] })
							this.showAddCity = false;

							if (!WeatherApp.utils.undef(data['load']) && data['load']) {
								var loadingCity = WeatherApp.utils.deepCopy(city);
								loadingCity.id = data['id'];
								WeatherApp.ForecastPanel.loadCity(loadingCity);
							}
							city.name = "";
						}
						else {
							this.addCityError = t('weather', 'Failed to add city. Please contact your administrator');
						}
					}.bind(WeatherApp.CityList))
					.fail(function addCityFail(r, textStatus, errorThrown) {
						if (r.status == 401) {
							this.addCityError = t('weather', 'Your OpenWeatherMap API key is invalid. Contact your administrator to configure a valid API key in Additional Settings of the Administration');
						}
						else if (r.status == 404) {
							this.addCityError = t('weather', 'No city with this name found.');
						}
						else if (r.status == 409) {
							this.addCityError = t('weather', 'This city is already registered for your account.');
						}
						else {
							this.addCityError = WeatherApp.data.g_error500;
						}
					}.bind(WeatherApp.CityList));
			}.bind(this),
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
							WeatherApp.data.homeCity =
								data['cities'].find(function homeCityFilter(city) { return city.id == data['home'] });

							// if the home city has just been deleted, select the first one instead
							WeatherApp.data.selectedCity = WeatherApp.utils.deepCopy(
								WeatherApp.utils.undef(WeatherApp.data.homeCity)
									? data['cities'][0]
									: WeatherApp.data.homeCity);
							WeatherApp.ForecastPanel.loadCity();
						}
						else if (this.cities.length > 0) { // If no home found, load first city found
							WeatherApp.ForecastPanel.loadCity(this.cities[0]);
						}
					}.bind(WeatherApp.CityList))
					.fail(function loadCitiesFail(r) { this.fatalError(); }.bind(WeatherApp.CityList));
			}.bind(this),
			loadCity: function loadCity(city) {
				WeatherApp.data.selectedCity = city;
				WeatherApp.ForecastPanel.loadCity(city)
			},
			deleteCity: function deleteCity(city) {
				if (WeatherApp.utils.undef(city)) {
					console.error(WeatherApp.data.g_error500);
					return;
				}

				$.ajax({
					type: 'POST',
					url: OC.generateUrl('/apps/weather/city/delete'),
					data: { 'id': city.id },
					dataType: 'json'
				})
					.done(function deleteCitySuccess(data) {
						if (data != null && !WeatherApp.utils.undef(data['deleted'])) {
							for (var i = 0; i < this.cities.length; i++) {
								if (this.cities[i].id === city.id) {
									this.cities.splice(i, 1);
									// If current city is the removed city, close it
									if (WeatherApp.data.selectedCity.id === city.id) {
										WeatherApp.data.currentCity = null;
										this.selectedCityId = 0;
									}
									return;
								}
							}
						}
						else {
							alert(t('weather', 'Failed to remove city. Please contact your administrator'));
						}
					}.bind(WeatherApp.CityList))
					.fail(function deleteCityFail(r) {
						console.error(r, WeatherApp.data.g_error500);
					}.bind(WeatherApp.CityList));
			},
			fatalError: function fatalError(e) {
				console.error("fatal error", e);
			}
		},
		created: function cityListCreated() {
			window.setTimeout(function cityListCreatedTick() {
				this.loadCities();
			}.bind(this), 0)
		}
	});
})(window, jQuery, weatherAppGlobal);
