var weatherAppGlobal = weatherAppGlobal || {};

(function (window, $, exports) {
	'use strict';

	function undef(obj) {
		return typeof obj === 'undefined' || obj === undefined;
	}

	exports.SettingsPanel = new Vue({
		el: '#app-settings',
		data: function settingsPanelData() { return {
			settingError: '',
			sharedState: exports.data
		}},
		methods: {
			loadMetric: function loadMetric() {
				$.ajax({
					type: "GET",
					url: OC.generateUrl('/apps/weather/settings/metric/get'),
					dataType: 'json'
				})
					.done(function loadMetricSuccess(data) {
						if (!undef(data['metric'])) {
							exports.SettingsPanel.sharedState.metric = data['metric'];
							exports.ForecastPanel.mapMetric();
						}
					}.bind(this))
					.fail(function loadMetricFail() { weatherApp.fatalError(); }.bind(this));
			}.bind(this),
			modifyMetric: function modifyMetric() {
		
				$.ajax({
					type: 'POST',
					url: OC.generateUrl('/apps/weather/settings/metric/set'),
					data: { 'metric': exports.data.metric },
					dataType: 'json'
				})
					.done(function modifyMetricSuccess(data) {
						if (data != null && !undef(data['set'])) {
							exports.ForecastPanel.mapMetric();
							exports.ForecastPanel.loadCity();
						}
						else {
							exports.SettingsPanel.settingError = t('weather', 'Failed to set metric. Please contact your administrator');
						}
					}.bind(this))
					.fail(function modifyMetricFail(r) {
						if (r.status == 404) {
							exports.SettingsPanel.settingError = t('weather', 'This metric is not known.');
						}
						else {
							exports.SettingsPanel.settingError = g_error500;
						}
					}.bind(this));
			}.bind(this)
		},
		created: function settingsPanelCreated() {
			window.setTimeout(function settingsPanelCreatedTick() {
				exports.SettingsPanel.loadMetric();
			}.bind(this), 0)
		}
	});

})(window, jQuery, weatherAppGlobal);
