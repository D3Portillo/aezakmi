import "./globals.css"
import type { Metadata, Viewport } from "next"

import { Inter } from "next/font/google"
import { Toaster } from "sonner"

import { AlertProvider } from "@/components/Alert"
import ErudaProvider from "@/components/ErudaProdiver"
import Providers from "@/components/Providers"

const nextFont = Inter({
  subsets: [],
  display: "fallback",
  adjustFontFallback: true,
  preload: true,
  weight: ["400", "500", "700", "800"],
})

export const metadata: Metadata = {
  title: "CZA - Cowboys, Zombies, Aliens",
  description: "A WIP Mini App",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${nextFont.className} antialiased`}>
        <Toaster
          swipeDirections={["left", "right", "bottom", "top"]}
          theme="light"
          toastOptions={{
            classNames: {
              toast: "rounded-full! py-3! pl-5!",
            },
          }}
          position="top-center"
        />
        <AlertProvider />
        <ErudaProvider>
          <Providers>{children}</Providers>
        </ErudaProvider>
      </body>
    </html>
  )
}
