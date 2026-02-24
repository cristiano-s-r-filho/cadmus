// This Cloudflare Pages Function proxies requests from /api/* to your Render backend.
export async function onRequest({ request, params }) { // params is now needed for [[path]]
  console.log('Pages Function: Request received for:', request.url);
  const backendBaseUrl = 'https://cadmus-kndb.onrender.com'; // Your Render backend URL
  
  // Parse the incoming request URL
  const url = new URL(request.url);
  
  // params.path is an array for [[path]].js catch-all. Handle the case where params.path might be undefined for /api itself
  const apiPath = params.path && Array.isArray(params.path) ? params.path.join('/') : ''; 
  console.log('Pages Function: Extracted API path (segments):', apiPath);

  // Construct the full URL for the backend
  const targetUrl = new URL(`/api/${apiPath}`, backendBaseUrl);
  console.log('Pages Function: Target Backend URL:', targetUrl.toString());

  // Create a new request to forward to the backend
  const newRequest = new Request(targetUrl.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.body, // Pass the original request body
    redirect: 'follow', // Follow any redirects from the backend
  });
  console.log('Pages Function: Forwarding request with method:', newRequest.method);

  // Fetch the response from the backend and return it
  return fetch(newRequest);
}
