var weatherAppGlobal = weatherAppGlobal || {};

(function (window, $, exports) {
	'use strict';

	exports.CityList = new Vue({
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

				sharedState: exports.data
			}
		},
		methods: {
			addCity: function addCity(city) {
				if (exports.utils.undef(city) || exports.utils.emptyStr(city.name)) {
					exports.CityList.addCityError = t('weather', 'Empty city name!');
					return;
				}

				$.ajax({
					type: 'POST',
					url: OC.generateUrl('/apps/weather/city/add'),
					data: { 'name': city.name },
					dataType: 'json'
				})
					.done(function addCitySuccess(data) {
						if (data != null && !exports.utils.undef(data['id'])) {
							exports.CityList.cities.push({ "name": city.name, "id": data['id'] })
							exports.CityList.showAddCity = false;

							if (!exports.utils.undef(data['load']) && data['load']) {
								var loadingCity = exports.utils.deepCopy(city);
								loadingCity.id = data['id'];
								exports.ForecastPanel.loadCity(loadingCity);
							}
							city.name = "";
						}
						else {
							exports.CityList.addCityError = t('weather', 'Failed to add city. Please contact your administrator');
						}
					}.bind(this))
					.fail(function addCityFail(r, textStatus, errorThrown) {
						if (r.status == 401) {
							exports.CityList.addCityError = t('weather', 'Your OpenWeatherMap API key is invalid. Contact your administrator to configure a valid API key in Additional Settings of the Administration');
						}
						else if (r.status == 404) {
							exports.CityList.addCityError = t('weather', 'No city with this name found.');
						}
						else if (r.status == 409) {
							exports.CityList.addCityError = t('weather', 'This city is already registered for your account.');
						}
						else {
							exports.CityList.addCityError = exports.data.g_error500;
						}
					}.bind(this));
			}.bind(this),
			loadCities: function loadCities() {
				$.ajax({
					type: "GET",
					url: OC.generateUrl('/apps/weather/city/getall'),
					dataType: 'json'
				})
					.done(function loadCitiesSuccess(data) {
						if (!exports.utils.undef(data['cities'])) {
							exports.CityList.cities = data['cities'];
						}

						if (!exports.utils.undef(data['home'])) {
							exports.data.homeCity =
								data['cities'].find(function homeCityFilter(city) { return city.id == data['home'] });

							// if the home city has just been deleted, select the first one instead
							exports.data.selectedCity = exports.utils.deepCopy(
								exports.utils.undef(exports.data.homeCity)
									? data['cities'][0]
									: exports.data.homeCity);
							exports.ForecastPanel.loadCity();
						}
						else if (exports.CityList.cities.length > 0) { // If no home found, load first city found
							exports.ForecastPanel.loadCity(exports.CityList.cities[0]);
						}
					}.bind(this))
					.fail(function loadCitiesFail(r) { exports.CityList.fatalError(); }.bind(this));
			}.bind(this),
			loadCity: function loadCity(city) {
				exports.data.selectedCity = city;
				exports.ForecastPanel.loadCity(city)
			},
			deleteCity: function deleteCity(city) {
				if (exports.utils.undef(city)) {
					console.error(exports.data.g_error500);
					return;
				}

				$.ajax({
					type: 'POST',
					url: OC.generateUrl('/apps/weather/city/delete'),
					data: { 'id': city.id },
					dataType: 'json'
				})
					.done(function deleteCitySuccess(data) {
						if (data != null && !exports.utils.undef(data['deleted'])) {
							for (var i = 0; i < exports.CityList.cities.length; i++) {
								if (exports.CityList.cities[i].id === city.id) {
									exports.CityList.cities.splice(i, 1);
									// If current city is the removed city, close it
									if (exports.data.selectedCity.id === city.id) {
										exports.data.currentCity = null;
										exports.CityList.selectedCityId = 0;
									}
									return;
								}
							}
						}
						else {
							alert(t('weather', 'Failed to remove city. Please contact your administrator'));
						}
					}.bind(this))
					.fail(function deleteCityFail(r) {
						console.error(r, exports.data.g_error500);
					}.bind(this));
			}.bind(this),
			fatalError: function fatalError(e) {
				console.error("fatal error", e);
			}.bind(this)

		},
		created: function cityListCreated() {
			window.setTimeout(function cityListCreatedTick() {
				// get homecity, set it to selected

				exports.CityList.loadCities();
			}.bind(this), 0)
		}
	});
})(window, jQuery, weatherAppGlobal);
