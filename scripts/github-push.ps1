# Push to GitHub
# Usage (after Git is installed and authenticated):
#   powershell -ExecutionPolicy Bypass -File .\scripts\github-push.ps1

$ErrorActionPreference = "Stop"

$RepoUrl = "https://github.com/Razhvn-dev/Influencers_Dashboard.git"

Set-Location (Split-Path $PSScriptRoot -Parent)

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw "Git is not installed. Install Git from https://git-scm.com/download/win and run this script again."
}

if (-not (Test-Path ".git")) {
  git init
  git branch -M main
}

$remote = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
  git remote add origin $RepoUrl
} elseif ($remote -ne $RepoUrl) {
  git remote set-url origin $RepoUrl
}

git add .
git status

$status = git status --porcelain
if ($status) {
  git commit -m "$( @'
Initial commit: Influencer Dashboard CRM

Shopify-style React + Polaris frontend with Express API and PostgreSQL backend.
'@ )"
}

git push -u origin main

Write-Host "Done. Repository: $RepoUrl"
