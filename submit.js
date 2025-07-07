exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Use the correct Webhook.site URL you provided
  const WEBHOOK_URL = 'https://webhook.site/9cfdda61-be4e-45b7-8c39-30a77889d648';

  try {
    // The body from the form is base64 encoded by Netlify for file uploads
    const bodyBuffer = Buffer.from(event.body, 'base64');

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        // Forward the exact content-type header from the form submission
        'Content-Type': event.headers['content-type'],
      },
      body: bodyBuffer,
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
      body: responseText,
    };

  } catch (error) {
    // If the function itself fails
    return {
      statusCode: 500,
      body: `Proxy Function Error: ${error.message}`,
    };
  }
};