"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const SCROLL_THRESHOLD = 60;

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
    };
    handleScroll(); // in case we're already scrolled
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-sm"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-8">
        <Link
          href="/"
          className={`text-xl font-bold tracking-tight transition-colors ${
            scrolled ? "text-slate-900" : "text-white drop-shadow-md"
          }`}
        >
          SchemeMatch
        </Link>
        <nav className="flex items-center gap-8">
          <a
            href="#why"
            className={`text-sm font-medium transition-colors ${
              scrolled ? "text-slate-600 hover:text-slate-900" : "text-white/90 drop-shadow hover:text-white"
            }`}
          >
            Why us
          </a>
          <a
            href="#missing"
            className={`text-sm font-medium transition-colors ${
              scrolled ? "text-slate-600 hover:text-slate-900" : "text-white/90 drop-shadow hover:text-white"
            }`}
          >
            What you miss
          </a>
          <a
            href="#how-it-works"
            className={`text-sm font-medium transition-colors ${
              scrolled ? "text-slate-600 hover:text-slate-900" : "text-white/90 drop-shadow hover:text-white"
            }`}
          >
            How it works
          </a>
          <Link
            href="/login"
            className={`text-sm font-semibold transition-opacity hover:opacity-90 ${
              scrolled ? "text-slate-900" : "text-white drop-shadow"
            }`}
          >
            Log in
          </Link>
        </nav>
      </div>
    </header>
  );
}
