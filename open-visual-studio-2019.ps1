$project = Split-Path -Parent $MyInvocation.MyCommand.Path
$visualStudio = "C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\Common7\IDE\devenv.exe"

if (-not (Test-Path -LiteralPath $visualStudio)) {
  throw "Visual Studio 2019 Community was not found at $visualStudio"
}

Start-Process -FilePath $visualStudio -ArgumentList @("/Command", "File.OpenFolder `"$project`"")
