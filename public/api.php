<?php

require_once '../vendor/autoload.php';

$dotenv = new Dotenv\Dotenv('../');
$dotenv->load();

$payload = [];

try {
    $diffbot = new Swader\Diffbot\Diffbot($_GET['token']);
    $info = $diffbot->getAccountInfo();
    $payload = [
        "data" => [
            'name' => $info->getName(),
            'plan' => $info->getPlan()
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