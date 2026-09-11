"use client";

import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { isMobilePreloadViewport } from "@/lib/mobile-preload";

const ENTER_DELAY_MS = 1200;

function lockPage() {
  const html = document.documentElement;
  const body = document.body;
  const scrollY = window.scrollY;
  html.dataset.mobilePreload = "open";
  html.style.overflow = "hidden";
  body.dataset.preloadScroll = String(scrollY);
  body.style.position = "fixed";
  body.style.top = `-${scrollY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  body.style.overflow = "hidden";
}

function unlockPage() {
  const html = document.documentElement;
  const body = document.body;
  const scrollY = Number(body.dataset.preloadScroll || "0");
  delete html.dataset.mobilePreload;
  html.style.overflow = "";
  body.style.position = "";
  body.style.top = "";
  body.style.left = "";
  body.style.right = "";
  body.style.width = "";
  body.style.overflow = "";
  delete body.dataset.preloadScroll;
  window.scrollTo(0, scrollY);
}

export function MobileAppPreload() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const armed = useRef(false);
  const readyAt = useRef(0);
  const [open, setOpen] = useState(false);

  useLayoutEffect(() => {
    if (!isMobilePreloadViewport()) return;
    setOpen(true);
    lockPage();
    readyAt.current = Date.now() + ENTER_DELAY_MS;
    window.dispatchEvent(new Event("conesports:preload-open"));
  }, []);

  useEffect(() => {
    if (!open) return;
    const video = videoRef.current;
    const overlay = overlayRef.current;
    if (!video) return;

    video.loop = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");
    video.muted = true;
    video.defaultMuted = true;

    const start = () => {
      if (!video.paused) return;
      void video.play().catch(() => {});
    };
    start();

    const onEnded = () => {
      video.currentTime = 0;
      void video.play().catch(() => {});
    };
    video.addEventListener("ended", onEnded);

    const unmute = () => {
      video.muted = false;
      video.defaultMuted = false;
      video.volume = 1;
      video.removeAttribute("muted");
      void video.play().catch(() => {});
    };
    overlay?.addEventListener("pointerdown", unmute);

    const blockScroll = (event: TouchEvent) => {
      if ((event.target as HTMLElement | null)?.closest("button")) return;
      event.preventDefault();
    };
    overlay?.addEventListener("touchmove", blockScroll, { passive: false });

    return () => {
      video.removeEventListener("ended", onEnded);
      overlay?.removeEventListener("pointerdown", unmute);
      overlay?.removeEventListener("touchmove", blockScroll);
    };
  }, [open]);

  function armEnter(event: PointerEvent<HTMLButtonElement>) {
    event.stopPropagation();
    if (Date.now() < readyAt.current) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    armed.current = true;
  }

  function onCta(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (!armed.current || Date.now() < readyAt.current) return;

    videoRef.current?.pause();
    unlockPage();
    setOpen(false);
    window.dispatchEvent(new Event("conesports:preload-close"));
  }

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="mobile-preload"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-preload-title"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover object-center"
        autoPlay
        muted
        loop
        playsInline
        controls={false}
        disablePictureInPicture
        preload="auto"
        poster="/images/hero-poster.jpg"
        aria-hidden="true"
      >
        <source src="/videos/conevid-mobile.mp4" type="video/mp4" />
      </video>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-black/25 to-black/90" />
      <div className="hero-glow pointer-events-none absolute -left-16 top-1/3 h-[45%] w-[70%] rounded-full" />

      <div className="relative flex h-full min-h-0 w-full flex-col px-6 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="flex justify-center pt-3">
          <BrandLogo variant="light" className="h-12 w-auto" priority />
        </div>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
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
            onPointerDown={armEnter}
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
