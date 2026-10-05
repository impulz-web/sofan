"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { navItems } from "@/data/site";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="site-header" id="top">
      <div className="site-header__inner container">
        <Link href="/" className="brand" aria-label="SOFAN home">
          <Image src="/logo.jpeg" alt="SOFAN logo" width={180} height={88} priority />
        </Link>

        <button
          type="button"
          className="site-back-button"
          onClick={() => {
            if (window.history.length > 1) window.history.back();
            else router.push("/");
          }}
        >
          <span aria-hidden="true">←</span>
          Back
        </button>

        <nav
          id="main-navigation"
          className={`main-nav ${isMenuOpen ? "is-open" : ""}`}
          aria-label="Main navigation"
        >
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} onClick={() => setIsMenuOpen(false)}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className="mobile-nav-toggle"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMenuOpen}
            aria-controls="main-navigation"
            onClick={() => setIsMenuOpen((value) => !value)}
          >
            <span />
            <span />
            <span />
          </button>

          <Link href="/donate" className="give-button">
            Give
          </Link>
        </div>
      </div>
    </header>
  );
}
