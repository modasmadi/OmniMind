import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "OmniMind | Unified AI",
    description: "The Selfish Brain - One Agent, All Powers",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
