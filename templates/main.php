<?php
// \OCP\Util::addScript('weather', 'vue.min');
\OCP\Util::addScript('weather', 'vue');
\OCP\Util::addScript('weather', 'Common');
\OCP\Util::addScript('weather', 'Settings');
\OCP\Util::addScript('weather', 'LeftPanel');
\OCP\Util::addScript('weather', 'ForecastCityWeatherPanel');
\OCP\Util::addScript('weather', 'ForecastCityForecastPanel');
\OCP\Util::addScript('weather', 'ForecastPanel');
\OCP\Util::addScript('weather', 'CityList');
\OCP\Util::addScript('weather', 'App');
\OCP\Util::addStyle('weather', 'style');
?>
<script type="text/x-template" id="city-list-template">
	<ul class="city-list">
			<li v-for="city in cities" :class="[city-list-item, { selected: city.id == sharedState.selectedCity.id }]" :key="city.id">
				<a href="#" v-on:click="loadCity(city)">{{ city.name }}</a>
				<div class="icon-delete svn delete action" v-on:click="deleteCity(city)" ></div>
			</li>
			<li>
				<a href="#" v-on:click="(function(){ city.name = ''; addCityError = ''; showAddCity = !showAddCity; })()"><?php p($l->t('Add a city')); ?>...</a>
				<div v-show="showAddCity == true" id="create-city">
					<h1><?php p($l->t('Add city')); ?></h1>
					<hr>
					<h2><?php p($l->t('City name')); ?></h2>
					<span class="city-form-error" v-show="addCityError != ''">{{ addCityError }}</span>
					<form novalidate>
						<input type="text" autofocus="autofocus" v-model="city.name" v-on:keyup.enter="addCity(city)" />
						<input type="button" value="<?php p($l->t('Add')); ?>" v-on:click="addCity(city)" />
						<input type="button" value="<?php p($l->t('Cancel')); ?>" v-on:click="showAddCity = false" />
					</form>
				</div>
			</li>
		</ul>
</script>
<script type="text/x-template" id="settings-panel-template">
	<div id="app-settings">
		<div id="app-settings-header">
			<button name="app settings" class="settings-button" data-apps-slide-toggle="#app-settings-content"><?php p($l->t('Settings')); ?></button>
		</div>
		<div style="display: none;" id="app-settings-content">
			<h2><?php p($l->t('Metric')); ?></h2>
			<select name="metric" v-on:change="modifyMetric()" v-model="sharedState.metric">
				<option value="metric">°C</option>
				<option value="kelvin">°K</option>
				<option value="imperial">°F</option>
			</select>
		</div>
	</div>
</script>
<script type="text/x-template" id="left-panel-template">
	<div id="city-list-left">
		<slot></slot>
	</div>
</script>
<script type="text/x-template" id="forecast-city-panel-template">
	<div id="city-weather-panel" v-show="toShow" >
		<div class="city-name">
			{{ name }}, {{ country }}
			<img v-show="isHomeCity" :src="owncloudAppImgPath + 'home-pick.png'" />
			<img class="home-icon" v-on:click="setHome(selectedCityId)" v-show="!isHomeCity" :src="owncloudAppImgPath + 'home-nopick.png'" />
		</div>
		<div class="city-current-temp">{{ temp }}{{ metricRepresentation }}</div>
		<div class="city-current-pressure"><?php p($l->t('Pressure')); ?>: {{ pressure }} hpa</div>
		<div class="city-current-humidity"><?php p($l->t('Humidity')); ?>: {{ humidity }}%</div>
		<div class="city-current-weather"><?php p($l->t('Cloudiness')); ?>: {{ description }}</div>
		<div class="city-current-wind"><?php p($l->t('Wind')); ?>: {{ windSpeed }} m/s - {{ windDescription }}</div>
		<div class="city-current-sunrise"><?php p($l->t('Sunrise')); ?>: {{ sunrise * 1000 | date('HH:mm') }} <?php p($l->t('Sunset')); ?>: {{ sunset * 1000  | date('HH:mm') }}</div>
	</div>
</script>
<script type="text/x-template" id="forecast-forecast-panel-template">
	<div id="city-forecast-panel" v-show="toShow" >
		<table>
			<thead>
				<tr>
					<th><?php p($l->t('Date')); ?></th>
					<th><?php p($l->t('Temperature')); ?></th>
					<th><?php p($l->t('Weather')); ?></th>
					<th><?php p($l->t('Pressure')); ?></th>
					<th><?php p($l->t('Humidity')); ?></th>
					<th><?php p($l->t('Wind')); ?></th>
				</tr>
			</thead>
			<tbody v-if="forecastItems.length > 0">
				<tr v-for="forecast in forecastItems" :key="forecast.date">
					<td>{{ forecast.date }}</td>
					<td>{{ forecast.temperature }}{{ metricRepresentation }}</td>
					<td>{{ forecast.weather }}</td>
					<td>{{ forecast.pressure }} hpa</td>
					<td>{{ forecast.humidity }} %</td>
					<td>{{ forecast.wind.speed }} m/s - {{ forecast.wind.desc }}</td>
				</tr>
			</tbody>
		</table>
	</div>
</script>
<script type="text/x-template" id="forecast-panel-template">
	<div id="city-right" :style="{ backgroundImage: 'url(' + owncloudAppImgPath + currentCity.image + ')' }">
			<span class="city-load-error" v-show="cityLoadError != ''">
				{{ cityLoadError }}<br /><br />
				<a href="http://home.openweathermap.org/users/sign_in" v-show="cityLoadNeedsAPIKey == true"><?php p($l->t('Click here to get an API key')); ?></a>
			</span>
			<forecast-city-weather-panel 
			:to-show="this.cityLoadError == '' && this.currentCity != null && this.currentCity.name !== undefined" 
			:current-city="currentCity" />
			
			<forecast-city-forecast-panel
				:to-show="cityLoadError == '' && currentCity != null && currentCity.name !== undefined"
				:forecast-items="currentCity.forecast"
			></forecast-city-forecast-panel>
		</div>
</script>

<div id="app">
	<left-panel>
		<city-list ref="city-list"></city-list>
		<settings-panel></settings-panel>
	</left-panel>
	<forecast-panel ref="forecast-panel" />
</div>
