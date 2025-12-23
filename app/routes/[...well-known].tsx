// Handle .well-known requests (like Chrome DevTools JSON)
export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);

  // Only handle .well-known paths
  if (url.pathname.startsWith("/.well-known/")) {
    return new Response("Not Found", { status: 404 });
  }

  // For other paths, throw to let React Router handle the 404
  throw new Response("Not Found", { status: 404 });
}

export default function WellKnownHandler() {
  return null;
}
