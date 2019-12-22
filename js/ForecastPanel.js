var weatherAppGlobal = weatherAppGlobal || {};

(function (window, $, exports) {
	'use strict';

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
				if (exports.utils.undef(city) || exports.utils.emptyStr(city.name)) {
					if (!exports.utils.undef(exports.data.selectedCity.name)) {
						city = exports.data.selectedCity;
					} else if (!exports.utils.undef(exports.data.homeCity)) {
						city = exports.data.homeCity;
					} else {
						exports.ForecastPanel.cityLoadError = exports.data.g_error500;
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
							exports.ForecastPanel.currentCity = exports.utils.deepCopy(data);
							exports.ForecastPanel.currentCity.image = exports.ForecastPanel.imageMapper[exports.ForecastPanel.currentCity.weather[0].main];

							exports.ForecastPanel.currentCity.wind.desc = (function getWindDescription(degrees) {
								if (degrees < 23) return t('weather', 'North');
								if (degrees < 67) return t('weather', 'North-East');
								if (degrees < 113) return t('weather', 'East');
								if (degrees < 157) return t('weather', 'South-East');
								if (degrees < 201) return t('weather', 'South');
								if (degrees < 245) return t('weather', 'South-West');
								if (degrees < 289) return t('weather', 'West');
								if (degrees < 333) return t('weather', 'North-West');
								if (degrees > 332) return t('weather', 'North');
							})(data.wind.deg);

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
							exports.ForecastPanel.cityLoadError = exports.data.g_error500;
							exports.ForecastPanel.cityLoadNeedsAPIKey = false;
						}
					}.bind(this));
			}.bind(this),
			mapMetric: function mapMetric() {
				if (exports.data.metric == 'kelvin') {
					exports.ForecastPanel.metricRepresentation = '°K';
				}
				else if (exports.data.metric == 'imperial') {
					exports.ForecastPanel.metricRepresentation = '°F';
				}
				else {
					exports.data.metric = 'metric';
					exports.ForecastPanel.metricRepresentation = '°C';
				}
			}.bind(this),
			setHome: function setHome(cityId) {
				if (exports.utils.undef(cityId)) {
					console.error(exports.data.g_error500);
					return;
				}

				$.ajax({
					type: 'POST',
					url: OC.generateUrl('/apps/weather/settings/home/set'),
					data: { 'city': cityId },
					dataType: 'json'
				})
					.done(function setHomeSuccess(data) {
						if (data != null && !exports.utils.undef(data['set'])) {
							exports.data.homeCity.id = cityId; // TODO set the name as well
						}
						else {
							alert(t('weather', 'Failed to set home. Please contact your administrator'));
						}
					}.bind(this))
					.fail(function setHomeFail(r) {
						console.error(r, exports.data.g_error500);
					}.bind(this));
			}.bind(this),

		},
		created: function ForecastPanelCreated() {
			window.setTimeout(function () {
				window.setInterval(function () {
					if (exports.ForecastPanel.currentCity != null) { // TODO update cities anyway
						exports.ForecastPanel.loadCity(exports.ForecastPanel.domCity); // todo load domcity , 
					}
				}.bind(this), 60000);

				exports.ForecastPanel.owncloudAppImgPath = OC.filePath('weather', 'img', '').replace('index.php/', '');
			}.bind(this), 0);

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
