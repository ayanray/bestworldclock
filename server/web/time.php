<?php

header('content-type: application/json; charset=utf-8');


$time = $_GET['timezone'];
date_default_timezone_set($time);

$obj = new stdClass();
$obj->h = date("H");
$obj->m = date("i");
$obj->s = date("s");

echo $_GET['callback'] . '('.json_encode($obj).')';
