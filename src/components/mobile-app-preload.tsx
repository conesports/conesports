"use client";

import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { BrandLogo } from "@/components/brand-logo";

const STORAGE_KEY = "conesports-mobile-preload";
const MOBILE_QUERY = "(max-width: 767px)";

export function MobileAppPreload() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [open, setOpen] = useState(true);

  useLayoutEffect(() => {
    const mobile = window.matchMedia(MOBILE_QUERY).matches;
    const seen = sessionStorage.getItem(STORAGE_KEY) === "1";
    if (!mobile || seen) setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;

    const video = videoRef.current;
    const html = document.documentElement;
    const body = document.body;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    html.dataset.mobilePreload = "open";
    window.dispatchEvent(new Event("conesports:preload-open"));

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (video && !reduceMotion) {
      video.muted = false;
      video.volume = 1;
      void video
        .play()
        .catch(() => {
          video.muted = true;
          void video.play().catch(() => {});
        });
    }

    return () => {
      body.style.overflow = previousOverflow;
      delete html.dataset.mobilePreload;
      video?.pause();
    };
  }, [open]);

  function unmute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    video.volume = 1;
    void video.play().catch(() => {});
  }

  function onCta(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    sessionStorage.setItem(STORAGE_KEY, "1");
    videoRef.current?.pause();
    setOpen(false);
    window.dispatchEvent(new Event("conesports:preload-close"));
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] hidden flex-col bg-black text-white max-md:flex"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-preload-title"
      onPointerDown={unmute}
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover object-center motion-reduce:hidden"
        autoPlay
        loop
        playsInline
        preload="auto"
        poster="/images/hero-bg.png"
        aria-hidden="true"
      >
        <source src="/videos/conevid.mp4" type="video/mp4" />
      </video>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-black/25 to-black/90" />
      <div className="hero-glow pointer-events-none absolute -left-16 top-1/3 h-[45%] w-[70%] rounded-full" />

      <div className="relative flex min-h-[100svh] flex-col px-6 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="flex justify-center pt-3">
          <BrandLogo variant="light" className="h-12 w-auto" priority />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center pb-2 text-center">
          <p className="text-[11px] font-bold tracking-[0.32em] text-white/65 uppercase">
            ConeSports · Nigeria
          </p>
          <h1
            id="mobile-preload-title"
            className="mt-3 max-w-[14ch] text-[clamp(2.6rem,12vw,3.6rem)] font-bold leading-[0.92] tracking-tight uppercase"
          >
            Shop The ConeSports Experience
          </h1>
          <button
            type="button"
            className="btn-solid mt-8 w-full max-w-xs py-4"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={onCta}
          >
            Click Here
          </button>
          <div className="mt-8 h-1.5 w-28 rounded-full bg-white/35" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
