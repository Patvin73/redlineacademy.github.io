<?php
declare(strict_types=1);

// Simple health endpoint for webhook monitoring.
// Optional: protect with WEBHOOK_HEALTH_KEY env var.

define('METRICS_FILE', __DIR__ . '/logs/webhook_metrics.json');

$expectedKey = getenv('WEBHOOK_HEALTH_KEY') ?: '';
if ($expectedKey !== '') {
    $provided = $_GET['key'] ?? '';
    if (!$provided || !hash_equals($expectedKey, (string) $provided)) {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode(['status' => 'unauthorized'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit;
    }
}

$metrics = [];
if (is_file(METRICS_FILE)) {
    $raw = file_get_contents(METRICS_FILE);
    $decoded = $raw ? json_decode($raw, true) : null;
    if (is_array($decoded)) {
        $metrics = $decoded;
    }
}

$now = time();
$staleAfter = (int) (getenv('WEBHOOK_STALE_AFTER_SEC') ?: 3600);
$lastSuccessAt = $metrics['last_success_at'] ?? null;

$healthy = true;
$note = 'ok';
if ($lastSuccessAt) {
    $healthy = ($lastSuccessAt >= ($now - $staleAfter));
    if (!$healthy) {
        $note = 'stale';
    }
} else {
    $note = 'no_webhook_recorded_yet';
}

header('Content-Type: application/json');
header('Cache-Control: no-store');
http_response_code($healthy ? 200 : 503);

echo json_encode([
    'status' => $healthy ? 'ok' : 'degraded',
    'note' => $note,
    'now' => gmdate('c', $now),
    'last_success_at' => $lastSuccessAt ? gmdate('c', (int) $lastSuccessAt) : null,
    'last_error_at' => isset($metrics['last_error_at']) ? gmdate('c', (int) $metrics['last_error_at']) : null,
    'total_success' => $metrics['total_success'] ?? 0,
    'total_error' => $metrics['total_error'] ?? 0,
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
