$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8000/")
$listener.Start()
Write-Host "Listening on http://localhost:8000/"
while ($listener.IsListening) {
  $context = $listener.GetContext()
  $request = $context.Request
  $response = $context.Response
  Write-Host "Request:" $request.HttpMethod $request.Url.AbsolutePath
  try {
    if ($request.Url.AbsolutePath -eq "/favicon.ico") {
      $path = Join-Path (Get-Location) 'favicon.ico'
      if (Test-Path $path) {
        $bytes = [System.IO.File]::ReadAllBytes($path)
        $response.ContentType = 'image/x-icon'
        $response.ContentLength64 = $bytes.Length
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
      } else {
        $response.StatusCode = 404
        $msg = [Text.Encoding]::UTF8.GetBytes('Not Found')
        $response.OutputStream.Write($msg,0,$msg.Length)
      }
    } else {
      $response.StatusCode = 404
      $msg = [Text.Encoding]::UTF8.GetBytes('Not Found')
      $response.OutputStream.Write($msg,0,$msg.Length)
    }
  } catch {
    Write-Host "Error serving request:" $_
  } finally {
    $response.OutputStream.Close()
  }
}
