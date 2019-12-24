var weatherAppGlobal = weatherAppGlobal || {};

(function (window, $, WeatherApp, Vue) {
	'use strict';

	// when updating the props due to change of selected city, 
	// the component should be reinitialized with the prior data first
	// Using a cache lets us avoid a visible flicker.
	WeatherApp.ForecastPanelDataCache = {
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
	};

	WeatherApp.ForecastPanel = Vue.component("forecast-panel",
		{
			template: "#forecast-panel-template",
			data: function ForecastPanelData() {
				return WeatherApp.ForecastPanelDataCache
			},
			props: {
				homeCity: { type: Object, default: function () { return {} } },
				selectedCity: { type: Object, default: function () { return {} } },
				metric: { type: String, default: "" }
			},
			mixins: [WeatherApp.mixins.hasOwncloudAppImgPath],
			methods: {
				loadCity: function loadCity(city) {
					if (WeatherApp.utils.undef(city) || WeatherApp.utils.emptyStr(city.name)) {
						if (!WeatherApp.utils.undef(this.selectedCity.name)) {
							city = this.selectedCity;
						} else if (!WeatherApp.utils.undef(this.homeCity.name)) {
							city = this.homeCity;
						} else {
							// if there is no selected city, nor home city, then CityList didn't initialize yet.
							return;
						}
					}

					$.ajax({
						type: "GET",
						url: OC.generateUrl('/apps/weather/weather/get?name=' + city.name),
						dataType: 'json'
					})
						.done(function loadCitySuccess(data) {
							var cache = WeatherApp.ForecastPanelDataCache;

							if (data != null) {
								cache.currentCity = this.currentCity = WeatherApp.utils.deepCopy(data);
								cache.currentCity.image = this.currentCity.image = this.imageMapper[this.currentCity.weather[0].main];
								cache.cityLoadError = this.cityLoadError = '';
							}
							else {
								cache.cityLoadError = this.cityLoadError = t('weather', 'Failed to get city weather informations. Please contact your administrator');
							}
							this.cityLoadNeedsAPIKey = false;
						}.bind(this))
						.fail(function loadCityFail(jqXHR, textStatus, errorThrown) {
							var cache = WeatherApp.ForecastPanelDataCache;

							if (jqXHR.status == 404) {
								cache.cityLoadError = this.cityLoadError = t('weather', 'No city with this name found.');
								cache.cityLoadNeedsAPIKey = this.cityLoadNeedsAPIKey = false;
							}
							else if (jqXHR.status == 401) {
								cache.cityLoadError = this.cityLoadError = t('weather', 'Your OpenWeatherMap API key is invalid. Contact your administrator to configure a valid API key in Additional Settings of the Administration');
								cache.cityLoadNeedsAPIKey = this.cityLoadNeedsAPIKey = true;
							}
							else {
								cache.cityLoadError = this.cityLoadError = WeatherApp.data.g_error500;
								cache.cityLoadNeedsAPIKey = this.cityLoadNeedsAPIKey = false;
							}
						}.bind(this));
				},
			},
			created: function ForecastPanelCreated() {
				window.setInterval(function () {
						this.loadCity(); 
				}.bind(this), 60000);
			},
			mounted: function () {
				this.loadCity();
			}
		});
})(window, jQuery, weatherAppGlobal, Vue);
