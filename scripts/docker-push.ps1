# Build and push Influencer Dashboard to Docker Hub (Razhvn)
# Usage:
#   1. Install Docker Desktop and start it
#   2. docker login
#   3. powershell -ExecutionPolicy Bypass -File .\scripts\docker-push.ps1

$ErrorActionPreference = "Stop"

$ImageName = "razhvn/influencer-dashboard"
$Tag = if ($env:IMAGE_TAG) { $env:IMAGE_TAG } else { (git rev-parse --short HEAD).Trim() }
$FullImage = "${ImageName}:${Tag}"
$BuildSha = (git rev-parse --short HEAD).Trim()
$BuildTime = (Get-Date).ToUniversalTime().ToString('o')

Write-Host "Building image: $FullImage"
docker build --build-arg BUILD_GIT_SHA=$BuildSha --build-arg BUILD_TIME=$BuildTime -t $FullImage .

Write-Host "Tagging image (optional latest alias already applied)"
docker tag $FullImage "${ImageName}:latest"

Write-Host "Pushing to Docker Hub..."
docker push $FullImage
docker push "${ImageName}:latest"

Write-Host "Done. Image available at: docker.io/$FullImage"
