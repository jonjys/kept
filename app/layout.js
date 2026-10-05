export const metadata = {
  metadataBase: new URL("https://kept.nyttolabs.com"),
  title: "Kept — a note that waits",
  description: "Write it now. They read it when you said. €1. No account.",
  alternates: { canonical: "/" },
  openGraph: { title: "Kept", description: "A note that waits. One euro. No account.", url: "https://kept.nyttolabs.com" }
};
export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
