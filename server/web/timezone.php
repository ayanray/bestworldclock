<?php

header('content-type: application/json; charset=utf-8');


$timezone_abbreviations = DateTimeZone::listAbbreviations();


function tz_list() {
	$zones_array = array();
	$timestamp = time();
	foreach(timezone_identifiers_list() as $key => $zone) {
		date_default_timezone_set($zone);

		$city = explode("/", $zone);
		$city = trim(str_replace("_", " ", end($city)));

		$zones_array[$key]['zone'] = $zone;
		$zones_array[$key]['city'] = $city;
		$zones_array[$key]['diff_from_GMT'] = 'UTC ' . date('P', $timestamp);
	}
	return $zones_array;
}

function cmp($a, $b)
{
	return strcmp($a['city'], $b['city']);
}

$list = tz_list();
usort($list, "cmp");

echo $_GET['callback'] . '('.json_encode($list).')';
