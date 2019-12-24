var weatherAppGlobal = weatherAppGlobal || {};

(function (window, $, WeatherApp, Vue) {
	'use strict';

	WeatherApp.SettingsPanel = Vue.component("settings-panel", {
		template: "#settings-panel-template",
		data: function settingsPanelData() {
			return {
				settingError: '',
				sharedState: WeatherApp.data
			}
		},
		mixins: [WeatherApp.mixins.hasFatalError],
		methods: {
			loadMetric: function loadMetric() {
				$.ajax({
					type: "GET",
					url: OC.generateUrl('/apps/weather/settings/metric/get'),
					dataType: 'json'
				})
					.done(function loadMetricSuccess(data) {
						if (!WeatherApp.utils.undef(data['metric'])) {
							WeatherApp.data.metric = data['metric'];
						}
					}.bind(this))
					.fail(function loadMetricFail() { weatherApp.fatalError(); }.bind(this));
			}.bind(this),
			modifyMetric: function modifyMetric() {
				$.ajax({
					type: 'POST',
					url: OC.generateUrl('/apps/weather/settings/metric/set'),
					data: { 'metric': WeatherApp.data.metric },
					dataType: 'json'
				})
					.done(function modifyMetricSuccess(data) {
						if (data != null && !WeatherApp.utils.undef(data['set'])) {
							this.$root.$refs["forecast-panel"].loadCity();
						}
						else {
							WeatherApp.SettingsPanel.settingError = t('weather', 'Failed to set metric. Please contact your administrator');
						}
					}.bind(this))
					.fail(function modifyMetricFail(r) {
						if (r.status == 404) {
							WeatherApp.SettingsPanel.settingError = t('weather', 'This metric is not known.');
						}
						else {
							WeatherApp.SettingsPanel.settingError = this.g_error500;
						}
					}.bind(this));
			}
		},
		created: function settingsPanelCreated() {
			this.loadMetric();
		}
	});

})(window, jQuery, weatherAppGlobal, Vue);
