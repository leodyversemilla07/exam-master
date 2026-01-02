<?php

$descriptors = [
    0 => ['pipe', 'r'], // stdin
    1 => ['pipe', 'w'], // stdout
    2 => ['pipe', 'w'], // stderr
];

$process = proc_open('php artisan boost:mcp', $descriptors, $pipes);

if (is_resource($process)) {
    $request = json_encode([
        'jsonrpc' => '2.0',
        'id' => 1,
        'method' => 'initialize',
        'params' => [
            'protocolVersion' => '2024-11-05',
            'capabilities' => [],
            'clientInfo' => [
                'name' => 'test-script',
                'version' => '1.0',
            ],
        ],
    ]);

    fwrite($pipes[0], $request."\n");

    // Set a timeout for reading
    stream_set_timeout($pipes[1], 5);

    // Read response
    $response = fgets($pipes[1]);

    echo 'Response: '.$response."\n";

    $errors = stream_get_contents($pipes[2]);
    if ($errors) {
        echo 'Errors: '.$errors."\n";
    }

    fclose($pipes[0]);
    fclose($pipes[1]);
    fclose($pipes[2]);
    proc_close($process);
} else {
    echo "Failed to start process.\n";
}
