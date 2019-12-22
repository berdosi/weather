var weatherAppGlobal = weatherAppGlobal || {};

(function (window, $, exports) {
	'use strict';

	function undef(obj) {
		return typeof obj === 'undefined' || obj === undefined;
	}

	function emptyStr(obj) {
		return undef(obj) || obj == '';
	}

	function deepCopy(obj) {
		return JSON.parse(JSON.stringify(obj));
	}

	exports.ForecastPanel = new Vue({
		el: '#city-right',
		data: function ForecastPanelData() {
			return {
				currentCity: {
					forecast: [{
						date: '',
						temperature: '',
						weather: '',
						pressure: '',
						humidity: '',
						wind: {
							speed: '',
							desc: ''
						}
					}],
					name: undefined,
					main: {
						humidity: '',
						pressure: '',
						temp: ''
					},
					image: undefined,
					sys: {
						country: undefined,
						sunrise: 0,
						sunset: 0
					},
					weather: [
						{
							main: '',
							description: ''
						}
					],
					wind: {
						desc: undefined,
						deg: undefined
					},
				},
				imageMapper: {
					Clear: "sun.jpg",
					Clouds: "clouds.png",
					Drizzle: "drizzle.jpg",
					Smoke: "todo.png",
					Dust: "todo.png",
					Sand: "sand.jpg",
					Ash: "todo.png",
					Squall: "todo.png",
					Tornado: "tornado.jpg",
					Haze: "mist.jpg",
					Mist: "mist.jpg",
					Rain: "rain.jpg",
					Snow: "snow.png",
					Thunderstorm: "thunderstorm.jpg",
					Fog: "fog.jpg",
				},
				cityLoadError: '',
				cityLoadNeedsAPIKey: false,
				metricRepresentation: '°C',
				owncloudAppImgPath: '',
				sharedState: exports.data
			}
		},
		methods: {
			loadCity: function loadCity(city) {
				var g_error500 = t('weather', 'Fatal Error: please check your nextcloud.log and send a bug report here: https://github.com/nextcloud/weather/issues');

				if (undef(city) || emptyStr(city.name)) {
					if (!undef(exports.ForecastPanel.sharedState.selectedCity.name)) {
						city = exports.ForecastPanel.sharedState.selectedCity;
					} else if (!undef(exports.ForecastPanel.sharedState.homeCity)) {
						city = exports.ForecastPanel.sharedState.homeCity;
					} else {
						console.error(g_error500);
						// alert(g_error500);
						return;
					}
				}

				$.ajax({
					type: "GET",
					url: OC.generateUrl('/apps/weather/weather/get?name=' + city.name),
					dataType: 'json'
				})
					.done(function loadCitySuccess(data) {
						if (data != null) {
							exports.ForecastPanel.currentCity = deepCopy(data);
							exports.ForecastPanel.currentCity.image = exports.ForecastPanel.imageMapper[exports.ForecastPanel.currentCity.weather[0].main];
							exports.ForecastPanel.currentCity.wind.desc = "";
							if (exports.ForecastPanel.currentCity.wind.deg > 0 && exports.ForecastPanel.currentCity.wind.deg < 23 ||
								exports.ForecastPanel.currentCity.wind.deg > 333) {
								exports.ForecastPanel.currentCity.wind.desc = t('weather', 'North');
							}
							else if (exports.ForecastPanel.currentCity.wind.deg > 22 && exports.ForecastPanel.currentCity.wind.deg < 67) {
								exports.ForecastPanel.currentCity.wind.desc = t('weather', 'North-East');
							}
							else if (exports.ForecastPanel.currentCity.wind.deg > 66 && exports.ForecastPanel.currentCity.wind.deg < 113) {
								exports.ForecastPanel.currentCity.wind.desc = t('weather', 'East');
							}
							else if (exports.ForecastPanel.currentCity.wind.deg > 112 && exports.ForecastPanel.currentCity.wind.deg < 157) {
								exports.ForecastPanel.currentCity.wind.desc = t('weather', 'South-East');
							}
							else if (exports.ForecastPanel.currentCity.wind.deg > 156 && exports.ForecastPanel.currentCity.wind.deg < 201) {
								exports.ForecastPanel.currentCity.wind.desc = t('weather', 'South');
							}
							else if (exports.ForecastPanel.currentCity.wind.deg > 200 && exports.ForecastPanel.currentCity.wind.deg < 245) {
								exports.ForecastPanel.currentCity.wind.desc = t('weather', 'South-West');
							}
							else if (exports.ForecastPanel.currentCity.wind.deg > 244 && exports.ForecastPanel.currentCity.wind.deg < 289) {
								exports.ForecastPanel.currentCity.wind.desc = t('weather', 'West');
							}
							else if (exports.ForecastPanel.currentCity.wind.deg > 288) {
								exports.ForecastPanel.currentCity.wind.desc = t('weather', 'North-West');
							}
							exports.ForecastPanel.cityLoadError = '';
						}
						else {
							exports.ForecastPanel.cityLoadError = t('weather', 'Failed to get city weather informations. Please contact your administrator');
						}
						exports.ForecastPanel.cityLoadNeedsAPIKey = false;
					}.bind(this))
					.fail(function loadCityFail(jqXHR, textStatus, errorThrown) {

						if (jqXHR.status == 404) {
							exports.ForecastPanel.cityLoadError = t('weather', 'No city with this name found.');
							exports.ForecastPanel.cityLoadNeedsAPIKey = false;
						}
						else if (jqXHR.status == 401) {
							exports.ForecastPanel.cityLoadError = t('weather', 'Your OpenWeatherMap API key is invalid. Contact your administrator to configure a valid API key in Additional Settings of the Administration');
							exports.ForecastPanel.cityLoadNeedsAPIKey = true;
						}
						else {
							exports.ForecastPanel.cityLoadError = g_error500;
							exports.ForecastPanel.cityLoadNeedsAPIKey = false;
						}
					}.bind(this));
			}.bind(this),
			mapMetric: function mapMetric() {
				if (exports.ForecastPanel.sharedState.metric == 'kelvin') {
					exports.ForecastPanel.metricRepresentation = '°K';
				}
				else if (exports.ForecastPanel.sharedState.metric == 'imperial') {
					exports.ForecastPanel.metricRepresentation = '°F';
				}
				else {
					exports.ForecastPanel.sharedState.metric = 'metric';
					exports.ForecastPanel.metricRepresentation = '°C';
				}
			}.bind(this),
			setHome: function setHome(cityId) {
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
							exports.ForecastPanel.sharedState.homeCity.id = cityId; // TODO set the name as well
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

		},
		created: function ForecastPanelCreated() {
			window.setTimeout(function () {
				window.setInterval(function () {
					if (exports.ForecastPanel.currentCity != null) {
						exports.ForecastPanel.loadCity(exports.ForecastPanel.domCity); // todo load domcity , 
					}
				}.bind(this), 60000);

				exports.ForecastPanel.owncloudAppImgPath = OC.filePath('weather', 'img', '').replace('index.php/', '');
				// weatherApp.loadCities();
				// weatherApp.loadMetric();
			}.bind(this), 0)
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
		}
	});
})(window, jQuery, weatherAppGlobal);
