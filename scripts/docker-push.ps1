# Build and push Influencer Dashboard to Docker Hub (Razhvn)
# Usage:
#   1. Install Docker Desktop and start it
#   2. docker login
#   3. powershell -ExecutionPolicy Bypass -File .\scripts\docker-push.ps1

$ErrorActionPreference = "Stop"

$ImageName = "razhvn/influencer-dashboard"
$Tag = "latest"
$FullImage = "${ImageName}:${Tag}"

Write-Host "Building image: $FullImage"
docker build -t $FullImage .

Write-Host "Tagging image (optional latest alias already applied)"
docker tag $FullImage "${ImageName}:latest"

Write-Host "Pushing to Docker Hub..."
docker push $FullImage

Write-Host "Done. Image available at: docker.io/$FullImage"
