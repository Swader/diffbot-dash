<?php

require_once '../vendor/autoload.php';

$dotenv = new Dotenv\Dotenv('../');
$dotenv->load();

$payload = [];

try {
    $diffbot = new Swader\Diffbot\Diffbot($_GET['token']);
    $days = (isset($_GET['days']) && (int)$_GET['days'] > 31) ? (int)$_GET['days'] : 31;
    $info = $diffbot->getAccountInfo($days);
    $payload = [
        "data" => [
            'name' => $info->getName(),
            'plan' => $info->getPlan(),
            'calls' => $info->getCallsPerDay()
        ],
        "status" => "OK"
    ];
} catch (\Exception $e) {
    $payload = [
        "status" => "error",
        "message" => $e->getMessage(),
        "code" => $e->getCode()
    ];
}

die(json_encode($payload));