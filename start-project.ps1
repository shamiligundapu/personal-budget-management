$ErrorActionPreference = 'Stop'

$projectRoot = 'C:\budget management'
$javaHome = 'C:\Users\shami\.local\jdk21\jdk-21.0.8+9'
$mavenHome = 'C:\Users\shami\.local\maven\apache-maven-3.9.16'

$backendDir = Join-Path $projectRoot 'backend'
$frontendDir = Join-Path $projectRoot 'frontend'

$env:JAVA_HOME = $javaHome
$env:PATH = "$javaHome\bin;$mavenHome\bin;$env:PATH"

Write-Host 'Starting backend...'
$backendJob = Start-Process powershell -ArgumentList "-NoExit","-Command","Set-Location '$backendDir'; & '$mavenHome\bin\mvn.cmd' '-Dspring-boot.run.profiles=local' spring-boot:run" -WorkingDirectory $projectRoot -PassThru

Start-Sleep -Seconds 5

Write-Host 'Starting frontend...'
$frontendJob = Start-Process powershell -ArgumentList "-NoExit","-Command","Set-Location '$frontendDir'; & 'C:\Program Files\nodejs\npm.cmd' run dev -- --host 0.0.0.0" -WorkingDirectory $projectRoot -PassThru

Write-Host "Backend PID: $($backendJob.Id)"
Write-Host "Frontend PID: $($frontendJob.Id)"
Write-Host "App URLs:"
Write-Host "- Frontend: http://localhost:5173"
Write-Host "- Backend: http://localhost:8080/actuator/health"
