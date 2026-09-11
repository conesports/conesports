"use client";

import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { isMobilePreloadViewport } from "@/lib/mobile-preload";

const ENTER_DELAY_MS = 1200;
const INIT_HOLD_MS = 5000;

function lockPage() {
  const html = document.documentElement;
  const body = document.body;
  html.dataset.mobilePreload = "open";
  html.style.overflow = "hidden";
  body.style.overflow = "hidden";
}

function unlockPage() {
  const html = document.documentElement;
  const body = document.body;
  delete html.dataset.mobilePreload;
  html.style.overflow = "";
  body.style.overflow = "";
}

export function MobileAppPreload() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const readyAt = useRef(Number.POSITIVE_INFINITY);
  const entering = useRef(false);
  const enterTimer = useRef(0);
  const [open, setOpen] = useState(true);
  const [initializing, setInitializing] = useState(false);

  useLayoutEffect(() => {
    if (!isMobilePreloadViewport()) {
      setOpen(false);
      return;
    }
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
    video.preload = "auto";
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

    const blockScroll = (event: TouchEvent) => {
      if ((event.target as HTMLElement | null)?.closest("button")) return;
      event.preventDefault();
    };
    overlay?.addEventListener("touchmove", blockScroll, { passive: false });

    return () => {
      window.clearTimeout(enterTimer.current);
      video.removeEventListener("ended", onEnded);
      overlay?.removeEventListener("touchmove", blockScroll);
    };
  }, [open]);

  function startSound() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    video.defaultMuted = false;
    video.volume = 1;
    video.removeAttribute("muted");
    void video.play().catch(() => {});
  }

  function enterSite() {
    videoRef.current?.pause();
    unlockPage();
    setOpen(false);
    window.dispatchEvent(new Event("conesports:preload-close"));
  }

  function beginEnter() {
    if (entering.current || Date.now() < readyAt.current) return;
    entering.current = true;
    startSound();
    setInitializing(true);
    enterTimer.current = window.setTimeout(enterSite, INIT_HOLD_MS);
  }

  function onEnterPointer(event: PointerEvent<HTMLButtonElement>) {
    event.stopPropagation();
    if (event.pointerType === "mouse" && event.button !== 0) return;
    beginEnter();
  }

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="mobile-preload"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-preload-title"
      aria-busy={initializing}
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

      <div className="relative z-10 flex h-full min-h-0 min-w-0 w-full flex-col px-6 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="flex justify-center pt-3">
          <BrandLogo variant="light" className="h-12 w-auto max-h-12" priority />
        </div>

        <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center text-center">
          <p className="px-2 text-[10px] font-bold tracking-[0.22em] text-white/65 uppercase sm:text-[11px] sm:tracking-[0.32em]">
            ConeSports · Nigeria
          </p>
          <h1
            id="mobile-preload-title"
            className="mobile-preload-title mt-3 w-full font-bold uppercase"
          >
            Shop The
            <br />
            ConeSports
            <br />
            Experience
          </h1>
          <button
            type="button"
            className="btn-solid mt-8 w-full max-w-xs py-4"
            disabled={initializing}
            onPointerDown={onEnterPointer}
            onClick={(event) => {
              event.preventDefault();
              beginEnter();
            }}
          >
            {initializing ? "Initializing" : "Click Here"}
          </button>
          <div className="mt-8 h-1.5 w-28 rounded-full bg-white/35" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
