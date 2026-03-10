$dashboard = "pages\\dashboard-marketer.html"
$remixed = "C:\\Users\\Yoyo\\Downloads\\remixed-e886f1ba.html"

$body = Get-Content -Path $remixed -Raw -Encoding UTF8
$body = $body -replace "(?s)^.*?<body>\\s*", ""
$body = $body -replace "(?s)</body>.*$", ""

$body = $body -replace "<main class=""main-content"">", "<div class=""main-content"">"
$body = $body -replace "</main>", "</div>"

$replacements = [ordered]@{
  ([char]0x00B7) = "&middot;"
  ([char]0x2013) = "&ndash;"
  ([char]0x2014) = "&mdash;"
  ([char]0x2192) = "&rarr;"
  ([char]0x2265) = "&ge;"
  ([char]0x00D7) = "&times;"
}

foreach ($pair in $replacements.GetEnumerator()) {
  $body = $body.Replace($pair.Key, $pair.Value)
}

$newSection = "<section class=""mk-panel"" id=""panel-guide"" role=""tabpanel"" aria-labelledby=""tab-guide"">" +
  "`r`n  <div class=""mk-kb"">`r`n" + $body + "`r`n  </div>`r`n</section>"

$content = Get-Content -Path $dashboard -Raw -Encoding UTF8
$pattern = "(?s)<section class=""mk-panel"" id=""panel-guide""[^>]*>.*?</section>"
$content = [regex]::Replace($content, $pattern, $newSection)

Set-Content -Path $dashboard -Value $content -Encoding UTF8
