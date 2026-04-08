import { auth } from "@clerk/nextjs/server";
import { ClerkProvider, Show, SignInButton, SignUpButton } from "@clerk/nextjs"
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Providers } from "./StoreProvider";
import "./global.css";
import { ui } from "@clerk/ui"
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Script from "next/script";
import UserProvider from "@/context/UserProvider";
import { ThemeProvider } from "@/components/Themeprovider";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata = {
  title: "Password and Credit Card details manager",
  description: "Created by Vaasu Gagneja",
}

export default async function RootLayout({ children }) {
  const { userId } = await auth();
  return (
    <ClerkProvider ui={ui}
      appearance={{
        cssLayerName: "clerk",
      }}>
      <Providers>
        <html lang="en" className={cn("font-sans", inter.variable)} suppressHydrationWarning>
          <head>
            <link rel="shortcut icon" href="/Key.svg" type="image/x-icon" />
          </head>
          <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            <header className="flex justify-end items-center p-4 gap-4 h-16">
              <Show when="signed-out">
                <SignInButton />
                <SignUpButton>
                  <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                    Sign Up
                  </button>
                </SignUpButton>
              </Show>
            </header>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <div className="container">
                <Navbar />
                <UserProvider userId={userId}>
                  {children}
                </UserProvider>
                <Footer />
              </div>
            </ThemeProvider>
          </body>
        </html>
        <Script src="https://cdn.lordicon.com/lordicon.js"></Script>
      </Providers>
    </ClerkProvider>
  )
}