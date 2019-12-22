/**
 * ownCloud - Weather
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Loic Blot <loic.blot@unix-experience.fr>
 * @copyright Loic Blot 2014-2015
 */

var weatherAppGlobal = weatherAppGlobal || {};

(function WeatherAppMain(window, $, exports) {
	
	function undef(obj) {
		return typeof obj === 'undefined' || obj === undefined;
	}

	function emptyStr(obj) {
		return undef(obj) || obj == '';
	}

	function deepCopy(obj) {
		return JSON.parse(JSON.stringify(obj));
	}

	var weatherApp = new Vue({
		'el': '#app',
		'data': function () {
			return {
				'item': 0,
				'list': [],
				'city': {
					'name': '',
				},
				'cities': [],
				'userId': '',
				'home': undefined,
				'domCity': undefined,
				'currentCity': {
					'forecast': [{
						'date': '',
						'temperature': '',
						'weather': '',
						'pressure': '',
						'humidity': '',
						'wind': {
							'speed': '',
							'desc': ''
						}
					}],
					'name': undefined,
					'main': {
						'humidity': '',
						'pressure': '',
						'temp': ''
					},
					'image': undefined,
					'sys': {
						'country': undefined,
						'sunrise': 0,
						'sunset': 0
					},
					'weather': [
						{
							'main': '',
							'description': ''
						}
					],
					'wind': {
						'desc': undefined,
						'deg': undefined
					},
				},
				'addCityError': '',
				'cityLoadError': '',
				'cityLoadNeedsAPIKey': false,
				'homeCity': '',
				'imageMapper': {
					"Clear": "sun.jpg",
					"Clouds": "clouds.png",
					"Drizzle": "drizzle.jpg",
					"Smoke": "todo.png",
					"Dust": "todo.png",
					"Sand": "sand.jpg",
					"Ash": "todo.png",
					"Squall": "todo.png",
					"Tornado": "tornado.jpg",
					"Haze": "mist.jpg",
					"Mist": "mist.jpg",
					"Rain": "rain.jpg",
					"Snow": "snow.png",
					"Thunderstorm": "thunderstorm.jpg",
					"Fog": "fog.jpg",
				},
				'metric': 'metric',
				'metricRepresentation': '°C',
				'owncloudAppImgPath': '',
				'selectedCityId': undefined,
				'showAddCity': false,
			}
		},
		'methods': {
			'deleteCity': function deleteCity(city) {
				if (undef(city)) {
					console.error(g_error500);
					return;
				}

				$.ajax({
					type: 'POST',
					url: OC.generateUrl('/apps/weather/city/delete'),
					data: { 'id': city.id },
					dataType: 'json'
				})
					.done(function deleteCitySuccess(data) {
						if (data != null && !undef(data['deleted'])) {
							for (var i = 0; i < weatherApp.cities.length; i++) {
								if (weatherApp.cities[i].id === city.id) {
									weatherApp.cities.splice(i, 1);
									// If current city is the removed city, close it
									if (weatherApp.selectedCityId === city.id) {
										weatherApp.currentCity = null;
										weatherApp.selectedCityId = 0;
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
						console.error(r, g_error500);
					}.bind(this));
			}.bind(this),
			'addCity': function addCity(city) {
				if (undef(city) || emptyStr(city.name)) {
					weatherApp.addCityError = t('weather', 'Empty city name!');
					return;
				}

				$.ajax({
					type: 'POST',
					url: OC.generateUrl('/apps/weather/city/add'),
					data: { 'name': city.name },
					dataType: 'json'
				})
					.done(function addCitySuccess(data) {
						if (data != null && !undef(data['id'])) {
							weatherApp.cities.push({ "name": city.name, "id": data['id'] })
							weatherApp.showAddCity = false;

							if (!undef(data['load']) && data['load']) {
								var loadingCity = deepCopy(city);
								loadingCity.id = data['id'];
								weatherApp.loadCity(loadingCity);
							}
							city.name = "";
						}
						else {
							weatherApp.addCityError = t('weather', 'Failed to add city. Please contact your administrator');
						}
					}.bind(this))
					.fail(function addCityFail(r, textStatus, errorThrown) {
						if (r.status == 401) {
							weatherApp.addCityError = t('weather', 'Your OpenWeatherMap API key is invalid. Contact your administrator to configure a valid API key in Additional Settings of the Administration');
						}
						else if (r.status == 404) {
							weatherApp.addCityError = t('weather', 'No city with this name found.');
						}
						else if (r.status == 409) {
							weatherApp.addCityError = t('weather', 'This city is already registered for your account.');
						}
						else {
							weatherApp.addCityError = g_error500;
						}
					}.bind(this));
			}.bind(this),
			'mapMetric': function mapMetric() {
				if (weatherApp.metric == 'kelvin') {
					weatherApp.metricRepresentation = '°K';
				}
				else if (weatherApp.metric == 'imperial') {
					weatherApp.metricRepresentation = '°F';
				}
				else {
					weatherApp.metric = 'metric';
					weatherApp.metricRepresentation = '°C';
				}
			}.bind(this),
			'modifyMetric': function modifyMetric() {
				$.ajax({
					type: 'POST',
					url: OC.generateUrl('/apps/weather/settings/metric/set'),
					data: { 'metric': weatherApp.metric },
					dataType: 'json'
				})
					.done(function modifyMetricSuccess(data) {
						if (data != null && !undef(data['set'])) {
							weatherApp.mapMetric();
							weatherApp.loadCity(weatherApp.domCity);
						}
						else {
							weatherApp.settingError = t('weather', 'Failed to set metric. Please contact your administrator');
						}
					}.bind(this))
					.fail(function modifyMetricFail(r) {
						if (r.status == 404) {
							weatherApp.settingError = t('weather', 'This metric is not known.');
						}
						else {
							weatherApp.settingError = g_error500;
						}
					}.bind(this));
			}.bind(this),
			'loadMetric': function loadMetric() {
				$.ajax({
					type: "GET",
					url: OC.generateUrl('/apps/weather/settings/metric/get'),
					dataType: 'json'
				})
					.done(function loadMetricSuccess(data) {
						if (!undef(data['metric'])) {
							weatherApp.metric = data['metric'];
							weatherApp.mapMetric();
						}
					}.bind(this))
					.fail(function loadMetricFail() { weatherApp.fatalError(); }.bind(this));
			}.bind(this),
			'setHome': function setHome(cityId) {
				if (undef(cityId)) {
					console.error(g_error500);
					// alert(g_error500);
					return;
				}

				$.ajax({
					type: 'POST',
					url: OC.generateUrl('/apps/weather/settings/home/set'),
					data: { 'city': cityId },
					dataType: 'json'
				})
					.done(function setHomeSuccess(data) {
						if (data != null && !undef(data['set'])) {
							weatherApp.homeCity = cityId;
						}
						else {
							alert(t('weather', 'Failed to set home. Please contact your administrator'));
						}
					}.bind(this))
					.fail(function setHomeFail(r) {
						console.error(r, g_error500);
						// alert(g_error500);
					}.bind(this));
			}.bind(this),
			'fatalError': function fatalError(e) {
				console.error("fatal error", e);
			}.bind(this),
			'loadCity': function loadCity(city) {

				var g_error500 = t('weather', 'Fatal Error: please check your nextcloud.log and send a bug report here: https://github.com/nextcloud/weather/issues');

				if (undef(city) || emptyStr(city.name)) {
					console.error(g_error500);
					// alert(g_error500);
					return;
				}

				$.ajax({
					type: "GET",
					url: OC.generateUrl('/apps/weather/weather/get?name=' + city.name),
					dataType: 'json'
				})
					.done(function loadCitySuccess(data) {
						if (data != null) {
							weatherApp.domCity = city;
							weatherApp.currentCity = deepCopy(data);
							weatherApp.selectedCityId = city.id;
							weatherApp.currentCity.image = weatherApp.imageMapper[weatherApp.currentCity.weather[0].main];
							weatherApp.currentCity.wind.desc = "";
							if (weatherApp.currentCity.wind.deg > 0 && weatherApp.currentCity.wind.deg < 23 ||
								weatherApp.currentCity.wind.deg > 333) {
								weatherApp.currentCity.wind.desc = t('weather', 'North');
							}
							else if (weatherApp.currentCity.wind.deg > 22 && weatherApp.currentCity.wind.deg < 67) {
								weatherApp.currentCity.wind.desc = t('weather', 'North-East');
							}
							else if (weatherApp.currentCity.wind.deg > 66 && weatherApp.currentCity.wind.deg < 113) {
								weatherApp.currentCity.wind.desc = t('weather', 'East');
							}
							else if (weatherApp.currentCity.wind.deg > 112 && weatherApp.currentCity.wind.deg < 157) {
								weatherApp.currentCity.wind.desc = t('weather', 'South-East');
							}
							else if (weatherApp.currentCity.wind.deg > 156 && weatherApp.currentCity.wind.deg < 201) {
								weatherApp.currentCity.wind.desc = t('weather', 'South');
							}
							else if (weatherApp.currentCity.wind.deg > 200 && weatherApp.currentCity.wind.deg < 245) {
								weatherApp.currentCity.wind.desc = t('weather', 'South-West');
							}
							else if (weatherApp.currentCity.wind.deg > 244 && weatherApp.currentCity.wind.deg < 289) {
								weatherApp.currentCity.wind.desc = t('weather', 'West');
							}
							else if (weatherApp.currentCity.wind.deg > 288) {
								weatherApp.currentCity.wind.desc = t('weather', 'North-West');
							}
							weatherApp.cityLoadError = '';
						}
						else {
							weatherApp.cityLoadError = t('weather', 'Failed to get city weather informations. Please contact your administrator');
						}
						weatherApp.cityLoadNeedsAPIKey = false;
					}.bind(this))
					.fail(function loadCityFail(jqXHR, textStatus, errorThrown) {

						if (jqXHR.status == 404) {
							weatherApp.cityLoadError = t('weather', 'No city with this name found.');
							weatherApp.cityLoadNeedsAPIKey = false;
						}
						else if (jqXHR.status == 401) {
							weatherApp.cityLoadError = t('weather', 'Your OpenWeatherMap API key is invalid. Contact your administrator to configure a valid API key in Additional Settings of the Administration');
							weatherApp.cityLoadNeedsAPIKey = true;
						}
						else {
							weatherApp.cityLoadError = g_error500;
							weatherApp.cityLoadNeedsAPIKey = false;
						}
					}.bind(this));
			}.bind(this),
			'loadCities': function () {
				$.ajax({
					type: "GET",
					url: OC.generateUrl('/apps/weather/city/getall'),
					dataType: 'json'
				})
					.done(function loadCitiesSuccess(data) {
						if (!undef(data['cities'])) {
							weatherApp.cities = data['cities'];
						}

						if (!undef(data['userid'])) {
							weatherApp.userId = data['userid'];
						}

						if (!undef(data['home'])) {
							weatherApp.homeCity = data['home'];
							if (weatherApp.homeCity) {
								for (var i = 0; i < weatherApp.cities.length; i++) {
									if (weatherApp.cities[i].id == weatherApp.homeCity) {
										weatherApp.loadCity(weatherApp.cities[i]);
										return;
									}
								}
							}
						}

						// If no home found, load first city found
						if (weatherApp.cities.length > 0) {
							weatherApp.loadCity(weatherApp.cities[0]);
						}

					}.bind(this))
					.fail(function loadCitiesFail(r) { weatherApp.fatalError(); }.bind(this));
			}.bind(this)
		},
		'created': function created() {
			// wait a tick so that weatherApp object is set.
			window.setTimeout(function () {
				window.setInterval(function () {
					if (weatherApp.currentCity != null) {
						weatherApp.loadCity(weatherApp.domCity);
					}
				}.bind(weatherApp), 60000);

				weatherApp.owncloudAppImgPath = OC.filePath('weather', 'img', '').replace('index.php/', '');
				weatherApp.loadCities();
				weatherApp.loadMetric();
			}.bind(this), 0)

		}.bind(this),
		'filters': {
			'date': function formatDate(rawValue, formatString) {
				if (formatString !== "HH:mm") throw "Unrecognized format: " + formatString;
				const date = new Date(rawValue);
				return (date.getHours() > 9 ? "" : "0") +
					date.getHours() + ":" +
					(date.getMinutes() > 9 ? "" : "0") +
					date.getMinutes();
			}
		}
	});
	console.log(weatherApp);
})(window, jQuery, weatherAppGlobal);
