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
			number: function numberFilter(rawValue) { return parseFloat(rawValue) }
		}
	});
})(window, jQuery, weatherAppGlobal);
