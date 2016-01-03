<?php

require_once '../vendor/autoload.php';

$payload = [];

try {
    $diffbot = new Swader\Diffbot\Diffbot($_GET['token']);
    $days = (isset($_GET['days']) && (int)$_GET['days'] > 31) ? (int)$_GET['days'] : 31;
    $info = $diffbot->getAccountInfo($days);

    $cpd = $info->getCallsPerDay();
    $keys = array_keys($cpd);
    $to = key($cpd);
    $from = array_pop($keys);

    $invoices = $info->getInvoices();
    // Fake overage
    $invoices = array_merge($invoices, $invoices, $invoices, $invoices);
    foreach ($invoices as &$invoice) {
        if (rand(1,20) > 15) {
            $invoice['overageAmount'] = rand(1,1000);
            $invoice['status'] = 'foo';
        }
    }

    $payload = [
        "data" => [
            'name' => $info->getName(),
            'plan' => $info->getPlan(),
            'calls' => $cpd,
            'invoices' => $invoices,
            'range' => [
                'from' => $from,
                'to' => $to
            ]
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