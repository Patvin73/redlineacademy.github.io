<?php
declare(strict_types=1);

function sendPaymentEmail(string $toEmail, string $toName, string $subject, string $htmlBody, string $textBody = ''): bool
{
    $transport = strtolower(getenv('MAIL_TRANSPORT') ?: 'mail');

    if ($transport === 'smtp') {
        return smtpSend($toEmail, $toName, $subject, $htmlBody, $textBody);
    }

    return mailSend($toEmail, $toName, $subject, $htmlBody, $textBody);
}

function mailSend(string $toEmail, string $toName, string $subject, string $htmlBody, string $textBody = ''): bool
{
    $fromEmail = getenv('MAIL_FROM') ?: '';
    $fromName = getenv('MAIL_FROM_NAME') ?: 'Redline Academy';
    $replyTo = getenv('MAIL_REPLY_TO') ?: $fromEmail;

    if (!$fromEmail) {
        error_log('MAIL_FROM is not set. Email skipped.');
        return false;
    }

    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        'From: ' . $fromName . ' <' . $fromEmail . '>',
        'Reply-To: ' . $replyTo,
        'X-Mailer: PHP/' . phpversion(),
    ];

    $toHeader = $toName ? ($toName . ' <' . $toEmail . '>') : $toEmail;
    $body = $htmlBody ?: nl2br($textBody);

    return mail($toHeader, $subject, $body, implode("\r\n", $headers));
}

function smtpSend(string $toEmail, string $toName, string $subject, string $htmlBody, string $textBody = ''): bool
{
    $host = getenv('SMTP_HOST') ?: '';
    $port = (int) (getenv('SMTP_PORT') ?: 587);
    $user = getenv('SMTP_USER') ?: '';
    $pass = getenv('SMTP_PASS') ?: '';
    $secure = strtolower(getenv('SMTP_SECURE') ?: 'tls');
    $fromEmail = getenv('MAIL_FROM') ?: '';
    $fromName = getenv('MAIL_FROM_NAME') ?: 'Redline Academy';
    $replyTo = getenv('MAIL_REPLY_TO') ?: $fromEmail;

    if (!$host || !$fromEmail) {
        error_log('SMTP_HOST or MAIL_FROM is not set. Email skipped.');
        return false;
    }

    $remote = $secure === 'ssl' ? 'ssl://' . $host : $host;
    $fp = fsockopen($remote, $port, $errno, $errstr, 15);
    if (!$fp) {
        error_log('SMTP connect failed: ' . $errstr);
        return false;
    }

    if (!smtpExpect($fp, 220)) {
        fclose($fp);
        return false;
    }

    $serverName = gethostname() ?: 'localhost';
    smtpWrite($fp, 'EHLO ' . $serverName);
    if (!smtpExpect($fp, 250)) {
        smtpWrite($fp, 'HELO ' . $serverName);
        if (!smtpExpect($fp, 250)) {
            fclose($fp);
            return false;
        }
    }

    if ($secure === 'tls') {
        smtpWrite($fp, 'STARTTLS');
        if (!smtpExpect($fp, 220)) {
            fclose($fp);
            return false;
        }
        stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
        smtpWrite($fp, 'EHLO ' . $serverName);
        if (!smtpExpect($fp, 250)) {
            fclose($fp);
            return false;
        }
    }

    if ($user !== '') {
        smtpWrite($fp, 'AUTH LOGIN');
        if (!smtpExpect($fp, 334)) {
            fclose($fp);
            return false;
        }
        smtpWrite($fp, base64_encode($user));
        if (!smtpExpect($fp, 334)) {
            fclose($fp);
            return false;
        }
        smtpWrite($fp, base64_encode($pass));
        if (!smtpExpect($fp, 235)) {
            fclose($fp);
            return false;
        }
    }

    smtpWrite($fp, 'MAIL FROM:<' . $fromEmail . '>');
    if (!smtpExpect($fp, 250)) {
        fclose($fp);
        return false;
    }

    smtpWrite($fp, 'RCPT TO:<' . $toEmail . '>');
    if (!smtpExpect($fp, 250)) {
        fclose($fp);
        return false;
    }

    smtpWrite($fp, 'DATA');
    if (!smtpExpect($fp, 354)) {
        fclose($fp);
        return false;
    }

    $toHeader = $toName ? ($toName . ' <' . $toEmail . '>') : $toEmail;
    $headers = [
        'From: ' . $fromName . ' <' . $fromEmail . '>',
        'To: ' . $toHeader,
        'Reply-To: ' . $replyTo,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        'Subject: ' . $subject,
    ];

    $body = $htmlBody ?: nl2br($textBody);
    $data = implode("\r\n", $headers) . "\r\n\r\n" . smtpDotStuff($body) . "\r\n.";

    smtpWrite($fp, $data);
    if (!smtpExpect($fp, 250)) {
        fclose($fp);
        return false;
    }

    smtpWrite($fp, 'QUIT');
    fclose($fp);
    return true;
}

function smtpWrite($fp, string $command): void
{
    fwrite($fp, $command . "\r\n");
}

function smtpExpect($fp, int $code): bool
{
    $data = '';
    while (!feof($fp)) {
        $line = fgets($fp, 515);
        if ($line === false) {
            break;
        }
        $data .= $line;
        if (strlen($line) < 4 || $line[3] !== '-') {
            break;
        }
    }

    if (!preg_match('/^(\d{3})/', $data, $matches)) {
        error_log('SMTP invalid response: ' . $data);
        return false;
    }

    $resp = (int) $matches[1];
    if ($resp !== $code) {
        error_log('SMTP unexpected response: ' . $data);
        return false;
    }

    return true;
}

function smtpDotStuff(string $body): string
{
    $body = str_replace("\r\n", "\n", $body);
    $body = str_replace("\n.", "\n..", $body);
    return str_replace("\n", "\r\n", $body);
}

