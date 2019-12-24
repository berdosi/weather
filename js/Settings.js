var weatherAppGlobal = weatherAppGlobal || {};

(function ($, WeatherApp, Vue, OC, t) {
	'use strict';

	WeatherApp.SettingsPanel = Vue.component("settings-panel", {
		template: "#settings-panel-template",
		data: function settingsPanelData() {
			return {
				settingError: '',
				metric: 'metric'
			};
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
						if (!WeatherApp.utils.undef(data.metric)) {
							this.metric = data.metric;
							WeatherApp.setMetric(this.metric);
						}
					}.bind(this))
					.fail(function loadMetricFail() { this.fatalError(); }.bind(this));
			},
			modifyMetric: function modifyMetric() {
				$.ajax({
					type: 'POST',
					url: OC.generateUrl('/apps/weather/settings/metric/set'),
					data: { 'metric': this.metric },
					dataType: 'json'
				})
					.done(function modifyMetricSuccess(data) {
						if (data !== null && !WeatherApp.utils.undef(data.set)) {
							WeatherApp.setMetric(this.metric);
						} else {
							this.settingError = t('weather', 'Failed to set metric. Please contact your administrator');
						}
					}.bind(this))
					.fail(function modifyMetricFail(r) {
						if (r.status === 404) {
							this.settingError = t('weather', 'This metric is not known.');
						}
						else {
							this.settingError = this.g_error500;
						}
					}.bind(this));
			}
		},
		created: function settingsPanelCreated() {
			this.loadMetric();
		}
	});

}(jQuery, weatherAppGlobal, Vue, OC, t));
