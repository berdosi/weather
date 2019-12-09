<?php
// \OCP\Util::addScript('weather', 'vue.min');
\OCP\Util::addScript('weather', 'vue');
\OCP\Util::addScript('weather', 'app');
\OCP\Util::addStyle('weather', 'style');
?>

<div id="app">
	<div id="city-list-left">
		<ul class="city-list">
			<li v-for="city in cities" :class="[city-list-item, { selected: city.id == selectedCityId }]">
				<a href="#" v-on:click="loadCity(city)">{{ city.name }}</a>
				<div class="icon-delete svn delete action" v-on:click="deleteCity(city)" ></div>
			</li>
			<li>
				<a href="#" v-on:click="(function(){ city.name = ''; addCityError = ''; showAddCity = true;})()"><?php p($l->t('Add a city')); ?>...</a>
				<div v-show="showAddCity == true" id="create-city">
					<h1><?php p($l->t('Add city')); ?></h1>
					<hr>
					<h2><?php p($l->t('City name')); ?></h2>
					<span class="city-form-error" v-show="addCityError != ''">{{ addCityError }}</span>
					<form novalidate>
						<input type="textbox" v-model="city.name" />
						<input type="button" value="<?php p($l->t('Add')); ?>" v-on:click="addCity(city)" />
						<input type="button" value="<?php p($l->t('Cancel')); ?>" v-on:click="showAddCity = false" />
					</form>
				</div>
			</li>
		</ul>
		<div id="app-settings">
			<div id="app-settings-header">
				<button name="app settings" class="settings-button" data-apps-slide-toggle="#app-settings-content"><?php p($l->t('Settings')); ?></button>
			</div>
			<div style="display: none;" id="app-settings-content">
				<h2><?php p($l->t('Metric')); ?></h2>
				<select name="metric" v-on:change="modifyMetric()" v-model="metric">
					<option value="metric">°C</option>
					<option value="kelvin">°K</option>
					<option value="imperial">°F</option>
				</select>
			</div>
		</div>
	</div>
	<div id="city-right" v-show="cityLoadError != ''">
		<span class="city-load-error">
			{{ cityLoadError }}<br /><br />
			<a href="http://home.openweathermap.org/users/sign_in" v-show="cityLoadNeedsAPIKey == true"><?php p($l->t('Click here to get an API key')); ?></a>
		</span>
	</div>
	<div id="city-right" v-show="cityLoadError == '' && currentCity != null" :style="{ backgroundImage: 'url(' + owncloudAppImgPath + currentCity.image + ')' }">
		<div id="city-weather-panel">
			<div class="city-name">
				{{ currentCity.name }}, {{ currentCity.sys.country }}
				<img v-show="selectedCityId == homeCity" :src="owncloudAppImgPath + 'home-pick.png'" />
				<img class="home-icon" v-on:click="setHome(selectedCityId)" v-show="selectedCityId != homeCity" :src="owncloudAppImgPath + 'home-nopick.png'" />
			</div>
			<div class="city-current-temp">{{ currentCity.main.temp }}{{ metricRepresentation }}</div>
			<div class="city-current-pressure"><?php p($l->t('Pressure')); ?>: {{ currentCity.main.pressure }} hpa</div>
			<div class="city-current-humidity"><?php p($l->t('Humidity')); ?>: {{ currentCity.main.humidity}}%</div>
			<div class="city-current-weather"><?php p($l->t('Cloudiness')); ?>: {{ currentCity.weather[0].description }}</div>
			<div class="city-current-wind"><?php p($l->t('Wind')); ?>: {{ currentCity.wind.speed }} m/s - {{ currentCity.wind.desc }}</div>
			<div class="city-current-sunrise"><?php p($l->t('Sunrise')); ?>: {{ currentCity.sys.sunrise * 1000 | date('HH:mm') }} <?php p($l->t('Sunset')); ?>: {{ currentCity.sys.sunset * 1000  | date('HH:mm') }}</div>
		</div>
		<div id="city-forecast-panel">
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
				<tbody v-if="currentCity.forecast.length > 0">
					<tr v-for="forecast in currentCity.forecast">
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
	</div>
</div>
