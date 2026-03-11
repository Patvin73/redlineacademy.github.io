<?php
declare(strict_types=1);

function parseDatabaseUrl(string $url): ?array
{
    $parts = parse_url($url);
    if ($parts === false || empty($parts['host'])) {
        return null;
    }

    $scheme = $parts['scheme'] ?? 'postgresql';
    if ($scheme !== 'postgres' && $scheme !== 'postgresql') {
        return null;
    }

    $host = $parts['host'];
    $port = $parts['port'] ?? 5432;
    $user = $parts['user'] ?? '';
    $pass = $parts['pass'] ?? '';
    $dbname = ltrim($parts['path'] ?? '', '/');

    $query = [];
    if (!empty($parts['query'])) {
        parse_str($parts['query'], $query);
    }

    $sslmode = $query['sslmode'] ?? (getenv('DB_SSLMODE') ?: getenv('PGSSLMODE') ?: 'require');
    $dsn = "pgsql:host={$host};port={$port};dbname={$dbname};sslmode={$sslmode}";

    return [$dsn, $user, $pass];
}

function db(): ?PDO
{
    static $pdo = null;
    static $failed = false;

    if ($failed) {
        return null;
    }

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dsn = getenv('DATABASE_URL') ?: '';
    $user = getenv('DB_USER') ?: '';
    $pass = getenv('DB_PASS') ?: '';

    if ($dsn) {
        $parsed = parseDatabaseUrl($dsn);
        if ($parsed !== null) {
            [$dsn, $user, $pass] = $parsed;
        }
    } else {
        $host = getenv('DB_HOST') ?: getenv('PGHOST') ?: getenv('SUPABASE_DB_HOST') ?: '';
        $port = getenv('DB_PORT') ?: getenv('PGPORT') ?: getenv('SUPABASE_DB_PORT') ?: '5432';
        $name = getenv('DB_NAME') ?: getenv('PGDATABASE') ?: getenv('SUPABASE_DB_NAME') ?: '';
        $user = $user ?: getenv('PGUSER') ?: getenv('SUPABASE_DB_USER') ?: '';
        $pass = $pass ?: getenv('PGPASSWORD') ?: getenv('SUPABASE_DB_PASSWORD') ?: '';
        $sslmode = getenv('DB_SSLMODE') ?: getenv('PGSSLMODE') ?: 'require';

        if ($host && $name && $user) {
            $dsn = "pgsql:host={$host};port={$port};dbname={$name};sslmode={$sslmode}";
        }
    }

    if (!$dsn) {
        $failed = true;
        return null;
    }

    try {
        $pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    } catch (Throwable $e) {
        $failed = true;
        error_log('DB connection failed: ' . $e->getMessage());
        return null;
    }

    return $pdo;
}
