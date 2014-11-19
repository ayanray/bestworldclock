<?php

header('content-type: application/json; charset=utf-8');


$timezone_abbreviations = DateTimeZone::listAbbreviations();


function tz_list() {
	$zones_array = array();
	$timestamp = time();
	foreach(timezone_identifiers_list() as $key => $zone) {
		date_default_timezone_set($zone);
		$zones_array[$key]['zone'] = $zone;
		$zones_array[$key]['diff_from_GMT'] = 'UTC/GMT ' . date('P', $timestamp);
	}
	return $zones_array;
}

echo $_GET['callback'] . '('.json_encode(tz_list()).')';
