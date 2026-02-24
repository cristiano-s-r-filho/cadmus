// This Cloudflare Pages Function proxies requests from /api/* to your Render backend.
export async function onRequest({ request, params }) {
  const backendBaseUrl = 'https://cadmus-kndb.onrender.com'; // Your Render backend URL (hardcoded for now)
  const apiPath = params.path.join('/'); // Reconstructs the path after /api/

  // Construct the full URL for the backend
  const url = new URL(`/api/${apiPath}`, backendBaseUrl);

  // Create a new request to forward to the backend
  // Preserve original method, headers, and body to ensure request is identical
  const newRequest = new Request(url.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: 'follow', // Follow any redirects from the backend
  });

  // Fetch the response from the backend and return it
  return fetch(newRequest);
}
