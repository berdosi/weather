/**
 * ownCloud - Weather
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Loic Blot <loic.blot@unix-experience.fr>
 * @copyright Loic Blot 2014-2015
 */
(function WeatherApp() {

	function undef(obj) {
		return typeof obj === 'undefined' || obj === undefined;
	}

	function emptyStr(obj) {
		return undef(obj) || obj == '';
	}

	function deepCopy(obj) {
		return JSON.parse(JSON.stringify(obj));
	}

	var $http = {
		post: function (url, requestBody) {
			return new Promise(
				function (resolve, reject) {
					fetch(
						url,
						{
							method: 'POST',
							headers: {
								'Content-Type': 'application/json'
							},
							body: JSON.stringify(requestBody)
						})
						.then(response => response.json())
						.then(responseJson => resolve({ data: responseJson, status: 200 })) // todo catch status
						.catch(e => reject(e))
				});
		},
		get: function (url) {
			return new Promise(
				function (resolve, reject) {
					fetch(url, { method: 'GET' })
						.then(response => response.json())
						.then(responseJson => resolve({ data: responseJson, status: 200 })) // todo catch status
						.catch(e => reject(e))
				});
		}
	}

	function $interval(intervalFunction, interval) {
		window.setInterval(intervalFunction, interval);
	}

	function $timeout(timeoutFunction, delay) {
		if (delay === undefined) delay = 0;
		window.setTimeout(timeoutFunction, delay);
	}

	var weatherApp = new Vue({
		'el': '#app',
		'data': {
			'city': {
				'name': ''
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
		},
		'methods': {
			'deleteCity': function deleteCity(city) {
				if (undef(city)) {
					console.error(g_error500);
					// alert(g_error500);
					return;
				}

				$http.post(OC.generateUrl('/apps/weather/city/delete'), { 'id': city.id }).
					then(function (r) {
						if (r.data != null && !undef(r.data['deleted'])) {
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
					}.bind(this),
						function (r) {
							console.error(r, g_error500);
							// alert(g_error500);
						}.bind(this));
			}.bind(this),
			'addCity': function addCity(city) {
				if (undef(city) || emptyStr(city.name)) {
					weatherApp.addCityError = t('weather', 'Empty city name!');
					return;
				}

				$http.post(OC.generateUrl('/apps/weather/city/add'), { 'name': city.name }).
					then(function (r) {
						if (r.data != null && !undef(r.data['id'])) {
							weatherApp.cities.push({ "name": city.name, "id": r.data['id'] })
							weatherApp.showAddCity = false;

							if (!undef(r.data['load']) && r.data['load']) {
								var loadingCity = deepCopy(city);
								loadingCity.id = r.data['id'];
								weatherApp.loadCity(loadingCity);
							}
							city.name = "";
						}
						else {
							weatherApp.addCityError = t('weather', 'Failed to add city. Please contact your administrator');
						}
					}.bind(this),
						function (r) {
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
				$http.post(OC.generateUrl('/apps/weather/settings/metric/set'), { 'metric': weatherApp.metric }).
					then(function (r) {
						if (r.data != null && !undef(r.data['set'])) {
							weatherApp.mapMetric();
							weatherApp.loadCity(weatherApp.domCity);
						}
						else {
							weatherApp.settingError = t('weather', 'Failed to set metric. Please contact your administrator');
						}
					}.bind(this),
						function (r) {
							if (r.status == 404) {
								weatherApp.settingError = t('weather', 'This metric is not known.');
							}
							else {
								weatherApp.settingError = g_error500;
							}
						}.bind(this));
			}.bind(this),
			'loadMetric': function loadMetric() {
				$http.get(OC.generateUrl('/apps/weather/settings/metric/get')).
					then(function (r) {
						if (!undef(r.data['metric'])) {
							weatherApp.metric = r.data['metric'];
							weatherApp.mapMetric();
						}
					}.bind(this),
						function (r) {
							weatherApp.fatalError();
						}.bind(this));
			}.bind(this),
			'setHome': function setHome(cityId) {
				if (undef(cityId)) {
					console.error(g_error500);
					// alert(g_error500);
					return;
				}

				$http.post(OC.generateUrl('/apps/weather/settings/home/set'), { 'city': cityId }).
					then(function (r) {
						if (r.data != null && !undef(r.data['set'])) {
							weatherApp.homeCity = cityId;
						}
						else {
							alert(t('weather', 'Failed to set home. Please contact your administrator'));
						}
					}.bind(this),
						function (r) {
							console.error(r, g_error500);
							// alert(g_error500);
						}.bind(this));
			}.bind(this),
			'fatalError': function (e) {
				console.error("fatal error", e);
			}.bind(this),
			'loadCity': function (city) {

				var g_error500 = t('weather', 'Fatal Error: please check your nextcloud.log and send a bug report here: https://github.com/nextcloud/weather/issues');

				if (undef(city) || emptyStr(city.name)) {
					console.error(g_error500);
					// alert(g_error500);
					return;
				}

				$http.get(OC.generateUrl('/apps/weather/weather/get?name=' + city.name)).
					then(function (r) {
						if (r.data != null) {
							weatherApp.domCity = city;
							weatherApp.currentCity = deepCopy(r.data);
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
					}.bind(this),
						function (r) {
							if (r.status == 404) {
								weatherApp.cityLoadError = t('weather', 'No city with this name found.');
								weatherApp.cityLoadNeedsAPIKey = false;
							}
							else if (r.status == 401) {
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

				$http.get(OC.generateUrl('/apps/weather/city/getall')).
					then(function (r) {
						if (!undef(r.data['cities'])) {
							weatherApp.cities = r.data['cities'];
						}

						if (!undef(r.data['userid'])) {
							weatherApp.userId = r.data['userid'];
						}

						if (!undef(r.data['home'])) {
							weatherApp.homeCity = r.data['home'];
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

					}.bind(this),
						function (r) {
							weatherApp.fatalError();
						}.bind(this));
			}.bind(this)
		},
		'created': function created() {

			window.setInterval(function () {
				if (weatherApp.currentCity != null) {
					weatherApp.loadCity(weatherApp.domCity);
				}
			}.bind(weatherApp), 60000);

			weatherApp.owncloudAppImgPath = OC.filePath('weather', 'img', '').replace('index.php/', '');
			weatherApp.loadCities();
			weatherApp.loadMetric();

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
})();
