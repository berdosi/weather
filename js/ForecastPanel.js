var weatherAppGlobal = weatherAppGlobal || {};

(function (window, $, WeatherApp) {
	'use strict';

	WeatherApp.ForecastPanel = new Vue({
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
				owncloudAppImgPath: '',
				sharedState: WeatherApp.data
			}
		},
		computed: {
			metricRepresentation: function() {
				if (WeatherApp.data.metric == 'kelvin') {
					return '°K';
				}
				else if (WeatherApp.data.metric == 'imperial') {
					return '°F';
				}
				else {
					return '°C';
				}
			}
		},
		methods: {
			loadCity: function loadCity(city) {
				if (WeatherApp.utils.undef(city) || WeatherApp.utils.emptyStr(city.name)) {
					if (!WeatherApp.utils.undef(WeatherApp.data.selectedCity.name)) {
						city = WeatherApp.data.selectedCity;
					} else if (!WeatherApp.utils.undef(WeatherApp.data.homeCity)) {
						city = WeatherApp.data.homeCity;
					} else {
						this.cityLoadError = WeatherApp.data.g_error500;
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
							this.currentCity = WeatherApp.utils.deepCopy(data);
							this.currentCity.image = this.imageMapper[this.currentCity.weather[0].main];

							this.currentCity.wind.desc = (function getWindDescription(degrees) {
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

							this.cityLoadError = '';
						}
						else {
							this.cityLoadError = t('weather', 'Failed to get city weather informations. Please contact your administrator');
						}
						this.cityLoadNeedsAPIKey = false;
					}.bind(WeatherApp.ForecastPanel))
					.fail(function loadCityFail(jqXHR, textStatus, errorThrown) {

						if (jqXHR.status == 404) {
							this.cityLoadError = t('weather', 'No city with this name found.');
							this.cityLoadNeedsAPIKey = false;
						}
						else if (jqXHR.status == 401) {
							this.cityLoadError = t('weather', 'Your OpenWeatherMap API key is invalid. Contact your administrator to configure a valid API key in Additional Settings of the Administration');
							this.cityLoadNeedsAPIKey = true;
						}
						else {
							this.cityLoadError = WeatherApp.data.g_error500;
							this.cityLoadNeedsAPIKey = false;
						}
					}.bind(WeatherApp.ForecastPanel));
			},
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
								name: WeatherApp.CityList.cities.find(function findCityName(city) { return city.id === cityId}).name }; // TODO set the name as well
						}
						else {
							alert(t('weather', 'Failed to set home. Please contact your administrator'));
						}
					}.bind(WeatherApp.ForecastPanel))
					.fail(function setHomeFail(r) {
						console.error(r, WeatherApp.data.g_error500);
					}.bind(WeatherApp.ForecastPanel));
			},
		},
		created: function ForecastPanelCreated() {
			window.setTimeout(function () {
				window.setInterval(function () {
					if (this.currentCity != null) { // TODO update cities anyway
						this.loadCity(this.domCity); // todo load domcity , 
					}
				}.bind(WeatherApp.ForecastPanel), 60000);

				this.owncloudAppImgPath = OC.filePath('weather', 'img', '').replace('index.php/', '');
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
			},
			number: function numberFilter(rawValue) { return parseFloat(rawValue) }
		}
	});
})(window, jQuery, weatherAppGlobal);
