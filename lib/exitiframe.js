function renderExitIframePage(apiKey) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="shopify-api-key" content="${apiKey}" />
    <title>Redirecting...</title>
    <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
  </head>
  <body>
    <script>
      (function () {
        var params = new URLSearchParams(window.location.search);
        var redirectUri = params.get('redirectUri');

        if (redirectUri) {
          window.open(redirectUri, '_top');
          return;
        }

        document.body.textContent = 'Missing redirect URI.';
      })();
    </script>
  </body>
</html>`;
}

module.exports = { renderExitIframePage };
