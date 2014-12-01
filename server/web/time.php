<?php

header('content-type: application/json; charset=utf-8');


$times = $_GET['timezone'];

$times = explode(",", $times);

$objs = array();
foreach ($times as $time) {
	date_default_timezone_set($time);

	$obj = new stdClass();
	$obj->h = date("H");
	$obj->m = date("i");
	$obj->s = date("s");
	$obj->locale = $time;
	$obj->dts = date("Y-m-d H:i:s");

	$objs[] = $obj;
}


echo $_GET['callback'] . '('.json_encode($objs).')';
