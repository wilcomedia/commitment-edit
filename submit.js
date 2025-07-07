exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Use the correct Webhook.site URL you provided
  const WEBHOOK_URL = 'https://webhook.site/9cfdda61-be4e-45b7-8c39-30a77889d648';

  try {
    // Determine if the incoming body is base64-encoded (Netlify sets this flag for file uploads)
    let bodyToForward;
    if (event.isBase64Encoded) {
      bodyToForward = Buffer.from(event.body, 'base64');
    } else {
      bodyToForward = event.body;
    }

    // Forward the request to the webhook maintaining the original Content-Type header
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type':
          event.headers['content-type'] || event.headers['Content-Type'] || 'application/octet-stream',
      },
      body: bodyToForward,
    });

    const responseText = await response.text();

    // If the webhook site returns an error, pass it back
    if (!response.ok) {
      return {
        statusCode: response.status,
        body: `Error from Webhook.site: ${responseText}`,
      };
    }

    // If the webhook site succeeds, pass back its success message
    return {
      statusCode: 200,
      body: responseText || 'OK',
    };

  } catch (error) {
    // If the function itself fails
    return {
      statusCode: 500,
      body: `Proxy Function Error: ${error.message}`,
    };
  }
};