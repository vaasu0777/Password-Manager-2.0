"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Moon, Sun, X, Menu, Shield } from "lucide-react"
import { useTheme } from "next-themes"
import { useDispatch, useSelector } from "react-redux"
import type { RootState, AppDispatch } from "@/lib/store"
import { Show, SignInButton, SignOutButton, UserButton } from '@clerk/nextjs'
import { setDarkMode } from "@/lib/features/ThemeSlice"

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "#services" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
]

const Navbar = () => {
  const dispatch = useDispatch<AppDispatch>()
  const darkMode = useSelector((state: RootState) => state.theme.darkMode)
  const { setTheme, theme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    dispatch(setDarkMode(theme === "dark"))
  }, [theme, dispatch])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [menuOpen])

  return (
    <>
      <nav
        className={`
          fixed top-0 left-0 right-0 z-50 p-4
          transition-all duration-300 ease-in-out
          ${scrolled
            ? "py-2 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-gray-200/60 dark:border-gray-800/60"
            : "py-4 bg-transparent"
          }
        `}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">

          {/* ── Logo ── */}
          <Link
            href="/"
            className="flex items-center gap-2 group select-none"
            aria-label="PassOP Home"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-linear-to-br from-emerald-400 to-teal-600 shadow-md group-hover:scale-105 transition-transform duration-200">
              <Shield className="w-5 h-5 text-white" strokeWidth={2.5} />
            </span>
            <span className="font-black text-xl tracking-tight">
              <span className="text-emerald-500 w-text text-3xl">&lt;</span>
              <span className="text-gray-900 w-text text-3xl dark:text-white">Pass</span>
              <span className="text-emerald-500 w-text text-3xl">OP/&gt;</span>
            </span>
          </Link>

          {/* ── Desktop Nav (lg+) ── */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="hover:underline relative w-text text-md px-4 py-2 font-medium text-gray-600 dark:text-gray-300 rounded-lg
                  hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/70
                  transition-all duration-150"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* ── Desktop Actions (lg+) ── */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => setTheme(darkMode ? "light" : "dark")}
              aria-label="Toggle theme"
              className="hover:cursor-pointer w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400
                hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800
                transition-all duration-150"
            >
              {darkMode
                ? <Sun className="w-4 h-4" />
                : <Moon className="w-4 h-4" />
              }
            </button>
            <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />

            <Show when="signed-out">
              <span className="inline-flex cursor-pointer">
                <SignInButton>
                  <button className="px-4 py-2 text-sm font-semibold rounded-xl
                    bg-linear-to-br from-emerald-500 to-teal-600
                    hover:from-emerald-400 hover:to-teal-500
                    text-white shadow-md shadow-emerald-500/20
                    hover:shadow-emerald-500/40 hover:scale-[1.02]
                    transition-all duration-200 cursor-pointer">
                    Sign In
                  </button>
                </SignInButton>
              </span>
            </Show>

            <Show when="signed-in">
              <div className="flex items-center gap-3">
                <UserButton />
                <span className="inline-flex cursor-pointer">
                  <SignOutButton>
                    <button className="px-4 py-2 text-sm font-semibold rounded-xl
                      border border-gray-200 dark:border-gray-700
                      text-gray-700 dark:text-gray-200
                      hover:bg-gray-100 dark:hover:bg-gray-800
                      transition-all duration-150 cursor-pointer">
                      Sign Out
                    </button>
                  </SignOutButton>
                </span>
              </div>
            </Show>
          </div>

          {/* ── Mobile + Tablet: theme + hamburger (below lg) ── */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setTheme(darkMode ? "light" : "dark")}
              aria-label="Toggle theme"
              className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400
                hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-600 dark:text-gray-300
                hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Backdrop ── */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Drawer ── */}
      <div
        className={`
          fixed top-0 right-0 bottom-0 z-50 w-72 lg:hidden
          flex flex-col
          bg-white dark:bg-gray-950
          border-l border-gray-200 dark:border-gray-800
          shadow-2xl
          transition-transform duration-300 ease-in-out
          ${menuOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <Link
            href="/"
            className="flex items-center gap-2 select-none group"
            onClick={() => setMenuOpen(false)}
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-br from-emerald-400 to-teal-600 group-hover:scale-105 transition-transform duration-200">
              <Shield className="w-4 h-4 text-white" strokeWidth={2.5} />
            </span>
            <span className="font-black text-lg tracking-tight">
              <span className="text-emerald-500 w-text">&lt;</span>
              <span className="text-gray-900 dark:text-white w-text">Pass</span>
              <span className="text-emerald-500 italic w-text">OP/&gt;</span>
            </span>
          </Link>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500
              hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Links */}
        <nav className="flex flex-col gap-1 p-4 flex-1">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="px-4 py-3 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-200
                hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-emerald-600 dark:hover:text-emerald-400
                transition-all duration-150"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Drawer Auth */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <Show when="signed-out">
            <SignInButton>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-full py-3 text-sm font-semibold rounded-xl
                  bg-linear-to-br from-emerald-500 to-teal-600
                  text-white shadow-md hover:opacity-90 transition-opacity"
              >
                Sign In
              </button>
            </SignInButton>
          </Show>

          <Show when="signed-in">
            <div className="flex items-center justify-between px-1">
              <UserButton />
              <SignOutButton>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2 text-sm font-medium rounded-xl
                    border border-gray-200 dark:border-gray-700
                    text-gray-700 dark:text-gray-200
                    hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Sign Out
                </button>
              </SignOutButton>
            </div>
          </Show>
        </div>
      </div>
    </>
  )
}

export default Navbar