<?php

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\Artisan;

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

define('LARAVEL_START', microtime(true));

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

$exitCode = Artisan::call('queue:work', [
    '--stop-when-empty' => true,
    '--tries' => 3,
    '--timeout' => 120,
]);

fwrite($exitCode === 0 ? STDOUT : STDERR, Artisan::output());
exit($exitCode);
