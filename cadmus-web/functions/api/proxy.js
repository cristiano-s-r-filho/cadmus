// This Cloudflare Pages Function proxies requests from /api/* to your Render backend.
export async function onRequest({ request }) { // No params argument needed here directly from route
  const backendBaseUrl = 'https://cadmus-kndb.onrender.com'; // Your Render backend URL
  
  // Parse the incoming request URL
  const url = new URL(request.url);
  
  // Extract the path after /api/
  // Example: request.url = https://your-domain.pages.dev/api/v1/auth/register
  // url.pathname = /api/v1/auth/register
  // apiPath will be v1/auth/register
  const apiPath = url.pathname.replace(/^\/api\//, ''); 

  // Construct the full URL for the backend
  const targetUrl = new URL(`/api/${apiPath}`, backendBaseUrl);

  // Create a new request to forward to the backend
  const newRequest = new Request(targetUrl.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.body, // Pass the original request body
    redirect: 'follow', // Follow any redirects from the backend
  });

  // Fetch the response from the backend and return it
  return fetch(newRequest);
}
