// Cloudflare Pages Function to proxy API requests to the Render backend.
// This function intercepts all requests to /api/* and forwards them to the
// specified backend URL, preserving method, headers, and body.
export async function onRequest({ request, params }) {
  const backendBaseUrl = 'https://cadmus-kndb.onrender.com'; // Base URL of the Cadmus API on Render.
  
  // Parse the incoming request URL to extract the path.
  const url = new URL(request.url);
  
  // Reconstruct the API path from the params.
  // For a [[path]].js catch-all, params.path is an array of segments.
  // Handle the case where params.path might be undefined (e.g., for requests to /api itself).
  const apiPath = params.path && Array.isArray(params.path) ? params.path.join('/') : ''; 

  // Construct the full target URL for the Render backend API.
  // It prepends /api/ to the extracted path segments.
  const targetUrl = new URL(`/api/${apiPath}`, backendBaseUrl);

  // Create a new Request object to forward to the backend.
  // This preserves the original HTTP method, headers, and request body.
  const newRequest = new Request(targetUrl.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: 'follow', // Ensures any redirects from the backend are followed.
  });

  // Fetch the response from the Render backend and return it to the client.
  return fetch(newRequest);
}
