$listener = New-Object System.Net.HttpListener
$prefix = 'http://localhost:8000/'
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Host "Listening on $prefix (will serve one request and exit)"
$ctx = $listener.GetContext()
$req = $ctx.Request
$resp = $ctx.Response
Write-Host "Received request:" $req.HttpMethod $req.Url.AbsolutePath
try {
  if ($req.Url.AbsolutePath -eq '/favicon.ico') {
    $path = Join-Path (Get-Location) 'favicon.ico'
    if (Test-Path $path) {
      $bytes = [System.IO.File]::ReadAllBytes($path)
      $resp.ContentType = 'image/x-icon'
      $resp.ContentLength64 = $bytes.Length
      $resp.OutputStream.Write($bytes, 0, $bytes.Length)
      Write-Host "Served $path (size: $($bytes.Length))"
    } else {
      $resp.StatusCode = 404
      $msg = [Text.Encoding]::UTF8.GetBytes('Not Found')
      $resp.OutputStream.Write($msg,0,$msg.Length)
      Write-Host "favicon.ico not found"
    }
  } else {
    $resp.StatusCode = 404
    $msg = [Text.Encoding]::UTF8.GetBytes('Not Found')
    $resp.OutputStream.Write($msg,0,$msg.Length)
    Write-Host "Unhandled path: $($req.Url.AbsolutePath)"
  }
} catch {
  Write-Host "Error:" $_
} finally {
  $resp.OutputStream.Close()
  $listener.Stop()
  Write-Host "Listener stopped"
}
