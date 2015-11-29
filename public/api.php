<?php

require_once '../vendor/autoload.php';

$dotenv = new Dotenv\Dotenv('../');
$dotenv->load();

die(json_encode(["message" => getenv('DIFFBOT_TOKEN')]));