import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { Toaster } from "sonner";
import { HydrateHaul } from "@/lib/haulos/hydrate";
import appCss from "../styles.css?url";

const APP_NAME = "HaulOS";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content: "Loads. Trucks. One Yes. The operating system for a trucking company.",
      },
      { name: "theme-color", content: "#1E4F86" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: () => (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-dvh bg-paper text-ink antialiased">
        <PreviewHostBridge />
        <AuthProvider>
          <HydrateHaul>
            <Outlet />
          </HydrateHaul>
        </AuthProvider>
        <Toaster position="bottom-right" richColors closeButton />
        <Scripts />
      </body>
    </html>
  ),
});
