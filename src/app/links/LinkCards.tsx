"use client";

import { type ReactNode, type ReactElement, useCallback, useEffect, useRef, useState, cloneElement } from "react";
import Image from "next/image";
import { motion, AnimatePresence, type PanInfo } from "motion/react";
import { SITE_URL, SITE_DOMAIN, SOCIAL_LINKS, CONTACT_PHONE } from "@/lib/constants";

/* ================================================================
   Icons — same chassis as Footer.tsx: one viewBox, shared stroke
   weight, round terminals. Brand marks are hand-drawn, not imported,
   because Lucide v1 dropped brand icons and mixing icon families
   looks mismatched (see the Footer's own commentary).
   ================================================================ */

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
};

const TILE = <rect x="3" y="3" width="18" height="18" rx="5.5" />;
const TILE_WIDE = <rect x="3" y="6" width="18" height="12" rx="4" />;

const icons: Record<string, ReactNode> = {
  website: (
    <svg viewBox="0 0 305 305" fill="currentColor" stroke="none" aria-hidden="true" className="h-full w-full">
      <g>
        <path d="M95.506,152.511c0,31.426,25.567,56.991,56.994,56.991c31.425,0,56.99-25.566,56.99-56.991 c0-31.426-25.565-56.993-56.99-56.993C121.073,95.518,95.506,121.085,95.506,152.511z"/>
        <path d="M283.733,77.281c0.444-0.781,0.436-1.74-0.023-2.513c-13.275-22.358-32.167-41.086-54.633-54.159 C205.922,7.134,179.441,0.012,152.5,0.012c-46.625,0-90.077,20.924-119.215,57.407c-0.643,0.804-0.727,1.919-0.212,2.81 l42.93,74.355c0.45,0.78,1.28,1.25,2.164,1.25c0.112,0,0.226-0.008,0.339-0.023c1.006-0.137,1.829-0.869,2.083-1.852 c8.465-32.799,38.036-55.706,71.911-55.706c2.102,0,4.273,0.096,6.455,0.282c0.071,0.007,0.143,0.01,0.214,0.01H281.56 C282.459,78.545,283.289,78.063,283.733,77.281z"/>
        <path d="M175.035,224.936c-0.621-0.803-1.663-1.148-2.646-0.876c-6.457,1.798-13.148,2.709-19.889,2.709 c-28.641,0-55.038-16.798-67.251-42.794c-0.03-0.064-0.063-0.126-0.098-0.188L23.911,77.719c-0.446-0.775-1.272-1.25-2.165-1.25 c-0.004,0-0.009,0-0.013,0c-0.898,0.005-1.725,0.49-2.165,1.272C6.767,100.456,0,126.311,0,152.511 c0,36.755,13.26,72.258,37.337,99.969c23.838,27.435,56.656,45.49,92.411,50.84c0.124,0.019,0.248,0.027,0.371,0.027 c0.883,0,1.713-0.47,2.164-1.25l42.941-74.378C175.732,226.839,175.657,225.739,175.035,224.936z"/>
        <path d="M292.175,95.226h-85.974c-1.016,0-1.931,0.615-2.314,1.555c-0.384,0.94-0.161,2.02,0.564,2.73 c14.385,14.102,22.307,32.924,22.307,53c0,15.198-4.586,29.824-13.263,42.298c-0.04,0.058-0.077,0.117-0.112,0.178l-61.346,106.252 c-0.449,0.778-0.446,1.737,0.007,2.513c0.449,0.767,1.271,1.237,2.158,1.237c0.009,0,0.019,0,0.028,0 c40.37-0.45,78.253-16.511,106.669-45.222C289.338,231.032,305,192.941,305,152.511c0-19.217-3.532-37.956-10.498-55.698 C294.126,95.855,293.203,95.226,292.175,95.226z"/>
      </g>
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 16 16" fill="currentColor" stroke="none" aria-hidden="true" className="h-full w-full">
      <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 16 16" fill="currentColor" stroke="none" aria-hidden="true" className="h-full w-full">
      <path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.01 2.01 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.01 2.01 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31 31 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A100 100 0 0 1 7.858 2zM6.4 5.209v4.818l4.157-2.408z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 32 32" fill="currentColor" stroke="none" aria-hidden="true" className="h-full w-full">
      <path d="M25.805 7.996c0 0 0 0.001 0 0.001 0 0.994-0.806 1.799-1.799 1.799s-1.799-0.806-1.799-1.799c0-0.994 0.806-1.799 1.799-1.799v0c0.993 0.001 1.798 0.805 1.799 1.798v0zM16 20.999c-2.761 0-4.999-2.238-4.999-4.999s2.238-4.999 4.999-4.999c2.761 0 4.999 2.238 4.999 4.999v0c0 0 0 0.001 0 0.001 0 2.76-2.237 4.997-4.997 4.997-0 0-0.001 0-0.001 0h0zM16 8.3c0 0 0 0-0 0-4.253 0-7.7 3.448-7.7 7.7s3.448 7.7 7.7 7.7c4.253 0 7.7-3.448 7.7-7.7v0c0-0 0-0 0-0.001 0-4.252-3.447-7.7-7.7-7.7-0 0-0 0-0.001 0h0zM16 3.704c4.003 0 4.48 0.020 6.061 0.089 1.003 0.012 1.957 0.202 2.84 0.538l-0.057-0.019c1.314 0.512 2.334 1.532 2.835 2.812l0.012 0.034c0.316 0.826 0.504 1.781 0.516 2.778l0 0.005c0.071 1.582 0.087 2.057 0.087 6.061s-0.019 4.48-0.092 6.061c-0.019 1.004-0.21 1.958-0.545 2.841l0.019-0.058c-0.258 0.676-0.64 1.252-1.123 1.726l-0.001 0.001c-0.473 0.484-1.049 0.866-1.692 1.109l-0.032 0.011c-0.829 0.316-1.787 0.504-2.788 0.516l-0.005 0c-1.592 0.071-2.061 0.087-6.072 0.087-4.013 0-4.481-0.019-6.072-0.092-1.008-0.019-1.966-0.21-2.853-0.545l0.059 0.019c-0.676-0.254-1.252-0.637-1.722-1.122l-0.001-0.001c-0.489-0.47-0.873-1.047-1.114-1.693l-0.010-0.031c-0.315-0.828-0.506-1.785-0.525-2.785l-0-0.008c-0.056-1.575-0.076-2.061-0.076-6.053 0-3.994 0.020-4.481 0.076-6.075 0.019-1.007 0.209-1.964 0.544-2.85l-0.019 0.059c0.247-0.679 0.632-1.257 1.123-1.724l0.002-0.002c0.468-0.492 1.045-0.875 1.692-1.112l0.031-0.010c0.823-0.318 1.774-0.509 2.768-0.526l0.007-0c1.593-0.056 2.062-0.075 6.072-0.075zM16 1.004c-4.074 0-4.582 0.019-6.182 0.090-1.315 0.028-2.562 0.282-3.716 0.723l0.076-0.025c-1.040 0.397-1.926 0.986-2.656 1.728l-0.001 0.001c-0.745 0.73-1.333 1.617-1.713 2.607l-0.017 0.050c-0.416 1.078-0.67 2.326-0.697 3.628l-0 0.012c-0.075 1.6-0.090 2.108-0.090 6.182s0.019 4.582 0.090 6.182c0.028 1.315 0.282 2.562 0.723 3.716l-0.025-0.076c0.796 2.021 2.365 3.59 4.334 4.368l0.052 0.018c1.078 0.415 2.326 0.669 3.628 0.697l0.012 0c1.6 0.075 2.108 0.090 6.182 0.090s4.582-0.019 6.182-0.090c1.315-0.029 2.562-0.282 3.716-0.723l-0.076 0.026c2.021-0.796 3.59-2.365 4.368-4.334l0.018-0.052c0.416-1.078 0.669-2.326 0.697-3.628l0-0.012c0.075-1.6 0.090-2.108 0.090-6.182s-0.019-4.582-0.090-6.182c-0.029-1.315-0.282-2.562-0.723-3.716l0.026 0.076c-0.398-1.040-0.986-1.926-1.729-2.656l-0.001-0.001c-0.73-0.745-1.617-1.333-2.607-1.713l-0.050-0.017c-1.078-0.416-2.326-0.67-3.628-0.697l-0.012-0c-1.6-0.075-2.108-0.090-6.182-0.090z" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 16 16" fill="currentColor" stroke="none" aria-hidden="true" className="h-full w-full">
      <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951" />
    </svg>
  ),
};

/* Larger icon for the bottom-sheet hero card. */
const bigIcon = (id: string) => {
  const el = icons[id] as ReactElement<{ className?: string }> | undefined;
  if (!el) return null;
  return cloneElement(el, { className: "link-sheet-icon" });
};

/* ================================================================
   Share-app icons (WhatsApp, Facebook, X/Twitter, LinkedIn).
   Small inline SVGs — same stroke chassis as above.
   ================================================================ */
const shareIcons: Record<string, ReactNode> = {
  whatsapp: (
    <svg viewBox="-1.5 -1.5 27 27" className="h-full w-full" aria-hidden="true">
      <path fill="#25D366" stroke="#ffffff" strokeWidth="1.5" strokeLinejoin="round" d="M12.031 0C5.393 0 .012 5.38.012 12.019c0 2.122.553 4.195 1.605 6.01L0 24l6.113-1.603c1.761.947 3.737 1.448 5.918 1.448 6.638 0 12.02-5.38 12.02-12.019S18.669 0 12.031 0z"/>
      <path fill="#ffffff" d="M18.173 14.568c-.31-.155-1.832-.905-2.115-1.008-.283-.103-.49-.155-.697.155-.207.31-.8 1.008-.98 1.215-.18.207-.362.233-.672.078-.31-.155-1.308-.482-2.493-1.54-.922-.823-1.544-1.84-1.725-2.15-.18-.31-.02-.477.136-.632.14-.139.31-.362.465-.543.155-.181.207-.31.31-.517.103-.207.052-.388-.026-.543-.078-.155-.697-1.68-.955-2.3-.251-.603-.506-.521-.697-.53-.18-.01-.388-.01-.595-.01-.207 0-.543.078-.827.388-.284.31-1.085 1.06-1.085 2.585 0 1.525 1.11 3 1.265 3.207.155.207 2.185 3.333 5.295 4.672.74.319 1.317.51 1.767.653.743.236 1.42.202 1.954.122.597-.089 1.832-.749 2.09-1.472.258-.723.258-1.344.18-1.472-.078-.128-.284-.206-.594-.36z"/>
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 16 16" className="h-full w-full" fill="#1877F2" aria-hidden="true">
      <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951" />
    </svg>
  ),
  x: (
    <svg viewBox="-4 -4 24 24" className="h-full w-full" aria-hidden="true">
      <circle cx="8" cy="8" r="12" fill="#000000" />
      <path fill="#ffffff" d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/>
    </svg>
  ),
  linkedin: (
    <svg viewBox="-143 145 512 512" className="h-full w-full" fill="#0A66C2" aria-hidden="true">
      <path d="M113,145c-141.4,0-256,114.6-256,256s114.6,256,256,256s256-114.6,256-256S254.4,145,113,145z M41.4,508.1H-8.5V348.4h49.9 V508.1z M15.1,328.4h-0.4c-18.1,0-29.8-12.2-29.8-27.7c0-15.8,12.1-27.7,30.5-27.7c18.4,0,29.7,11.9,30.1,27.7 C45.6,316.1,33.9,328.4,15.1,328.4z M241,508.1h-56.6v-82.6c0-21.6-8.8-36.4-28.3-36.4c-14.9,0-23.2,10-27,19.6 c-1.4,3.4-1.2,8.2-1.2,13.1v86.3H71.8c0,0,0.7-146.4,0-159.7h56.1v25.1c3.3-11,21.2-26.6,49.8-26.6c35.5,0,63.3,23,63.3,72.4V508.1z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 32 32" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="ig-grad-share" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f09433" />
          <stop offset="25%" stopColor="#e6683c" />
          <stop offset="50%" stopColor="#dc2743" />
          <stop offset="75%" stopColor="#cc2366" />
          <stop offset="100%" stopColor="#bc1888" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="16" fill="url(#ig-grad-share)" />
      <path fill="#ffffff" transform="translate(6.4, 6.4) scale(0.6)" d="M25.805 7.996c0 0 0 0.001 0 0.001 0 0.994-0.806 1.799-1.799 1.799s-1.799-0.806-1.799-1.799c0-0.994 0.806-1.799 1.799-1.799v0c0.993 0.001 1.798 0.805 1.799 1.798v0zM16 20.999c-2.761 0-4.999-2.238-4.999-4.999s2.238-4.999 4.999-4.999c2.761 0 4.999 2.238 4.999 4.999v0c0 0 0 0.001 0 0.001 0 2.76-2.237 4.997-4.997 4.997-0 0-0.001 0-0.001 0h0zM16 8.3c0 0 0 0-0 0-4.253 0-7.7 3.448-7.7 7.7s3.448 7.7 7.7 7.7c4.253 0 7.7-3.448 7.7-7.7v0c0-0 0-0 0-0.001 0-4.252-3.447-7.7-7.7-7.7-0 0-0 0-0.001 0h0zM16 3.704c4.003 0 4.48 0.020 6.061 0.089 1.003 0.012 1.957 0.202 2.84 0.538l-0.057-0.019c1.314 0.512 2.334 1.532 2.835 2.812l0.012 0.034c0.316 0.826 0.504 1.781 0.516 2.778l0 0.005c0.071 1.582 0.087 2.057 0.087 6.061s-0.019 4.48-0.092 6.061c-0.019 1.004-0.21 1.958-0.545 2.841l0.019-0.058c-0.258 0.676-0.64 1.252-1.123 1.726l-0.001 0.001c-0.473 0.484-1.049 0.866-1.692 1.109l-0.032 0.011c-0.829 0.316-1.787 0.504-2.788 0.516l-0.005 0c-1.592 0.071-2.061 0.087-6.072 0.087-4.013 0-4.481-0.019-6.072-0.092-1.008-0.019-1.966-0.21-2.853-0.545l0.059 0.019c-0.676-0.254-1.252-0.637-1.722-1.122l-0.001-0.001c-0.489-0.47-0.873-1.047-1.114-1.693l-0.010-0.031c-0.315-0.828-0.506-1.785-0.525-2.785l-0-0.008c-0.056-1.575-0.076-2.061-0.076-6.053 0-3.994 0.020-4.481 0.076-6.075 0.019-1.007 0.209-1.964 0.544-2.85l-0.019 0.059c0.247-0.679 0.632-1.257 1.123-1.724l0.002-0.002c0.468-0.492 1.045-0.875 1.692-1.112l0.031-0.010c0.823-0.318 1.774-0.509 2.768-0.526l0.007-0c1.593-0.056 2.062-0.075 6.072-0.075zM16 1.004c-4.074 0-4.582 0.019-6.182 0.090-1.315 0.028-2.562 0.282-3.716 0.723l0.076-0.025c-1.040 0.397-1.926 0.986-2.656 1.728l-0.001 0.001c-0.745 0.73-1.333 1.617-1.713 2.607l-0.017 0.050c-0.416 1.078-0.67 2.326-0.697 3.628l-0 0.012c-0.075 1.6-0.090 2.108-0.090 6.182s0.019 4.582 0.090 6.182c0.028 1.315 0.282 2.562 0.723 3.716l-0.025-0.076c0.796 2.021 2.365 3.59 4.334 4.368l0.052 0.018c1.078 0.415 2.326 0.669 3.628 0.697l0.012 0c1.6 0.075 2.108 0.090 6.182 0.090s4.582-0.019 6.182-0.090c1.315-0.029 2.562-0.282 3.716-0.723l-0.076 0.026c2.021-0.796 3.59-2.365 4.368-4.334l0.018-0.052c0.416-1.078 0.669-2.326 0.697-3.628l0-0.012c0.075-1.6 0.090-2.108 0.090-6.182s-0.019-4.582-0.090-6.182c-0.029-1.315-0.282-2.562-0.723-3.716l0.026 0.076c-0.398-1.040-0.986-1.926-1.729-2.656l-0.001-0.001c-0.73-0.745-1.617-1.333-2.607-1.713l-0.050-0.017c-1.078-0.416-2.326-0.67-3.628-0.697l-0.012-0c-1.6-0.075-2.108-0.090-6.182-0.090z" />
    </svg>
  ),
  snapchat: (
    <svg viewBox="0 0 192 192" className="h-full w-full" aria-hidden="true">
      <circle cx="96" cy="96" r="96" fill="#FFFC00" />
      <path fill="#ffffff" stroke="#000000" strokeLinejoin="round" strokeWidth="8" d="M95.918 22.002c-11.963-.087-24.145 4.54-32.031 13.717-6.995 7.405-9.636 17.901-9.284 27.868-.03 5.119.032 10.237.05 15.355-4.901-1.217-9.873-4.624-15.063-2.937-4.422 1.313-6.267 7.088-3.596 10.791 2.876 3.761 7.346 5.907 11.08 8.71 1.837 1.5 4.313 2.571 5.68 4.499-.001 4.62-2.425 8.897-4.722 12.786-5.597 8.802-14.342 15.531-23.705 20.18-2.39 1.035-4.59 4.144-2.473 6.499 3.862 3.622 9.327 4.778 14.195 6.486 2.047.64 5.078 1.34 4.886 4.084.335 2.923 2.205 6.066 5.492 6.078 7.873.91 16.289.522 23.345 4.741 6.917 4.006 14.037 8.473 22.255 8.96 8.188.767 16.623-.888 23.642-5.255 5.23-2.884 10.328-6.477 16.456-7.061 5.155-1.206 10.702-.151 15.685-2.072 3.193-1.367 2.762-5.244 4.104-7.808 2.532-1.747 5.77-1.948 8.59-3.102 3.687-1.47 8.335-2.599 10.268-6.413 1.148-3.038-2.312-4.698-4.453-5.88-11.38-5.874-21.631-14.921-26.121-27.191-.496-1.936-2.279-4.834.084-6.255 4.953-4.176 11.413-6.575 15.514-11.715 3.103-3.884.941-10.55-4.141-11.322-4.928-.78-9.525 1.893-14.152 3.127-.404-8.53.502-17.232-.776-25.746-2.429-13.808-13.514-25.157-26.813-29.124-4.521-1.401-9.266-2.037-13.996-2Z" />
    </svg>
  ),
  email: (
    <svg viewBox="0 0 192 192" className="h-full w-full" fill="none" aria-hidden="true">
      <path fill="url(#gmail-grad-a)" d="M146 44h38v110c0 6.627-5.373 12-12 12h-20a6 6 0 0 1-6-6z"/>
      <path fill="#fc413d" d="M46 44H8v110c0 6.627 5.373 12 12 12h20a6 6 0 0 0 6-6z"/>
      <path fill="url(#gmail-grad-b)" d="M39.226 30.456c-8.033-6.752-20.018-5.714-26.77 2.319-6.752 8.032-5.714 20.017 2.319 26.77l76.078 63.949a8 8 0 0 0 10.295 0l76.078-63.95c8.032-6.752 9.07-18.737 2.318-26.77-6.752-8.032-18.737-9.07-26.769-2.318L96 78.18z"/>
      <defs>
        <linearGradient id="gmail-grad-a" x1="165" x2="165" y1="44" y2="166" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60d673"/><stop offset=".17" stopColor="#42c868"/><stop offset=".39" stopColor="#0ebc5f"/><stop offset=".62" stopColor="#00a9bb"/><stop offset=".86" stopColor="#3c90ff"/><stop offset="1" stopColor="#3186ff"/>
        </linearGradient>
        <linearGradient id="gmail-grad-b" x1="8" x2="184" y1="46.13" y2="46.13" gradientUnits="userSpaceOnUse">
          <stop offset=".08" stopColor="#ff63a0"/><stop offset=".3" stopColor="#fc413d"/><stop offset=".5" stopColor="#fc413d"/><stop offset=".65" stopColor="#fc413d"/><stop offset=".72" stopColor="#fc5c30"/><stop offset=".86" stopColor="#feb10c"/><stop offset=".91" stopColor="#fec700"/><stop offset=".96" stopColor="#ffdb0f"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  more: (
    <svg {...ICON_PROPS} className="h-full w-full p-2">
      <circle cx="12" cy="12" r="10" />
      <path d="M17 12h.01" />
      <path d="M12 12h.01" />
      <path d="M7 12h.01" />
    </svg>
  ),
};

/* Three-dot icon */
const DotsIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="currentColor"
    aria-hidden="true"
  >
    <circle cx="12" cy="6" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="12" cy="18" r="1.5" />
  </svg>
);

/* WhatsApp icon (larger, for the floating button) */
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

/* ================================================================
   Link entries
   ================================================================ */

interface LinkEntry {
  id: string;
  label: string;
  href: string;
  /** Handle name shown in the bottom sheet. */
  handle: string;
  /** Extra CSS classes for the card's background. */
  bgClass: string;
}

const LINKS: LinkEntry[] = [
  {
    id: "website",
    label: "Website",
    href: SOCIAL_LINKS.website,
    handle: SITE_DOMAIN,
    bgClass: "link-bg-website brand-gradient",
  },
  {
    id: "tiktok",
    label: "TikTok",
    href: SOCIAL_LINKS.tiktok,
    handle: "@digibearca",
    bgClass: "link-bg-tiktok",
  },
  {
    id: "youtube",
    label: "YouTube",
    href: SOCIAL_LINKS.youtube,
    handle: "@digibearca",
    bgClass: "link-bg-youtube",
  },
  {
    id: "instagram",
    label: "Instagram",
    href: SOCIAL_LINKS.instagram,
    handle: "@digibearca",
    bgClass: "link-bg-instagram",
  },
  {
    id: "facebook",
    label: "Facebook",
    href: SOCIAL_LINKS.facebook,
    handle: "Digi Bear",
    bgClass: "link-bg-facebook",
  },
];

/* ================================================================
   Projects — website projects from the Work section
   ================================================================ */

const PROJECTS = [
  { title: "AutoNorth Motors", src: "/work/autonorth-motors.jpg", href: "https://autonorth-motors.vercel.app/" },
  { title: "Indian Grill", src: "/work/indian-grill.jpg", href: "https://indiangrill.vercel.app/" },
  { title: "Auto Loan Calculator", src: "/work/AutoNorth-Motors.png", href: "https://autonorthab.ca/" },
  { title: "Earls", src: "/work/earls.jpg", href: "https://services0987.github.io/earls/" },
  { title: "JUJCO Heating & Cooling", src: "/work/jujco-hvac.png", href: "https://digibearca.github.io/JUJCO-HVAC-website/" },
];

const AI_VIDEOS = [
  { title: "DigiBear Promo", src: "/vid/grid/digibear-promo_AI.mp4" },
  { title: "Mustang Walkaround", src: "/vid/grid/bronco-edit1_AI.mp4" },
  { title: "Language", src: "/vid/grid/jujco_AI.mp4" },
  { title: "Bronco", src: "/vid/grid/citc_AI.mp4" },
];

/* ================================================================
   Share helpers
   ================================================================ */

function shareUrl(linkId: string) {
  return `${SITE_URL}/links?highlight=${linkId}`;
}

interface ShareApp {
  id: string;
  label: string;
  url?: (link: string) => string;
  action?: (link: string) => void;
}

const SHARE_APPS: ShareApp[] = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    url: (text: string) =>
      `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
  },
  {
    id: "instagram",
    label: "Instagram",
    url: (link: string) => `https://www.instagram.com/`,
  },
  {
    id: "facebook",
    label: "Facebook",
    url: (link: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
  },
  {
    id: "x",
    label: "X",
    url: (text: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    url: (link: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`,
  },
  {
    id: "snapchat",
    label: "Snapchat",
    url: (link: string) =>
      `https://snapchat.com/scan?attachmentUrl=${encodeURIComponent(link)}`,
  },
  {
    id: "email",
    label: "Gmail",
    url: (link: string) =>
      `mailto:?subject=Check%20this%20out&body=${encodeURIComponent(link)}`,
  },
  {
    id: "more",
    label: "More",
    action: (link: string) => {
      if (typeof navigator !== "undefined" && navigator.share) {
        navigator.share({ title: "Digi Bear", url: link }).catch(() => {});
      }
    },
  },
];

/* ================================================================
   Component
   ================================================================ */

export default function LinkCards({ highlight }: { highlight?: string }) {
  const [sheet, setSheet] = useState<LinkEntry | null>(null);
  const [toast, setToast] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (sheet) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [sheet]);

  /* ── Open bottom sheet ── */
  const openSheet = useCallback(
    (e: React.MouseEvent, entry: LinkEntry) => {
      e.preventDefault();
      e.stopPropagation();
      // Show the native modal first so it gains layout and display: flex.
      dialogRef.current?.showModal();
      // Then render the sheet contents so Framer Motion can measure them accurately.
      setSheet(entry);
    },
    [],
  );

  /* ── Close bottom sheet ── */
  const closeSheet = useCallback(() => {
    setSheet(null);
  }, []);

  /* ── Copy link ── */
  const copyLink = useCallback(
    (text: string) => {
      navigator.clipboard.writeText(text).then(() => {
        setToast(true);
        setTimeout(() => setToast(false), 1800);
      });
    },
    [],
  );

  return (
    <>
      {/* ── Spotlight overlay ── */}
      {highlight && <div className="link-highlight-overlay" aria-hidden="true" />}

      {/* ── Social link cards ── */}
      <div className="flex w-full max-w-md flex-col gap-3">
        {LINKS.map((entry) => (
          <a
            key={entry.id}
            id={`link-${entry.id}`}
            href={entry.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`link-card ${entry.bgClass}${highlight === entry.id ? " link-highlight" : ""}`}
          >
            {/* Platform icon */}
            <span className="flex h-6 w-6 shrink-0 items-center justify-center">
              {icons[entry.id]}
            </span>

            {/* Label */}
            <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {entry.label}
            </span>

            {/* Three-dot button */}
            <button
              type="button"
              className="link-dots"
              aria-label={`Share ${entry.label}`}
              onClick={(e) => openSheet(e, entry)}
            >
              <DotsIcon />
            </button>
          </a>
        ))}
      </div>

      {/* ── Projects section ── */}
      <div className="mt-12 w-full max-w-md">
        <h2 className="mb-4 font-display text-3xl font-bold tracking-tight text-text text-center">
          Featured <span className="text-gradient">Web Projects</span>
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
          {PROJECTS.map((project) => (
            <a
              key={project.title}
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              className="link-project-card group shrink-0 w-[60%] snap-center"
            >
              <Image
                src={project.src}
                alt={project.title}
                width={400}
                height={250}
                className="link-project-img"
              />
              <span className="link-project-title text-center block w-full">{project.title}</span>
            </a>
          ))}
        </div>
      </div>

      {/* ── AI Videos section ── */}
      <div className="mt-12 w-full max-w-md">
        <h2 className="mb-4 font-display text-3xl font-bold tracking-tight text-text text-center">
          <span className="text-gradient">AI-Videos </span>Showcase
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
          {AI_VIDEOS.map((vid) => (
            <div
              key={vid.src}
              className="link-project-card shrink-0 w-[40%] snap-center"
            >
              <video
                src={vid.src}
                autoPlay
                muted
                loop
                playsInline
                className="w-full aspect-9/16 object-cover pointer-events-none"
              />
              {/* <span className="link-project-title text-center block w-full mt-2">{vid.title}</span> */}
            </div>
          ))}
        </div>
      </div>

      {/* ── Sticky WhatsApp button ── */}
      <a
        href={`https://api.whatsapp.com/send?phone=${CONTACT_PHONE.replace(/[^+\d]/g, "")}&text=Hi%20Digi%20Bear!%20I%20found%20you%20via%20your%20links%20page.`}
        target="_blank"
        rel="noopener noreferrer"
        className="link-whatsapp"
        aria-label="Chat on WhatsApp"
      >
        <WhatsAppIcon />
        <span>Chat with us</span>
      </a>

      {/* ── Bottom sheet ── */}
      <dialog
        ref={dialogRef}
        className="link-sheet"
        onClick={(e) => {
          // Close when tapping the backdrop (the dialog element itself).
          if (e.target === e.currentTarget) closeSheet();
        }}
      >
        <AnimatePresence onExitComplete={() => dialogRef.current?.close()}>
          {sheet && (
            <motion.div 
              className="link-sheet-panel"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info: PanInfo) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                closeSheet();
              }
            }}
          >
            {/* Touchbar / Close handle */}
            <div className="flex justify-center mb-2">
              <span className="block h-1.5 w-30 rounded-full bg-border" />
            </div>

            {/* Hero card with platform background */}
            <div
              className={`link-sheet-hero ${sheet.bgClass}`}
            >
              {bigIcon(sheet.id)}
              <span className="link-sheet-handle">{sheet.handle}</span>
              <span className="link-sheet-url">
                {sheet.href.replace(/^https?:\/\/(www\.)?/, '')}
              </span>
            </div>

            {/* Copy / Open */}
            <div className="link-sheet-actions">
              <button
                type="button"
                className="link-sheet-btn"
                onClick={() => copyLink(shareUrl(sheet.id))}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy Link
              </button>
              <a
                href={sheet.href}
                target="_blank"
                rel="noopener noreferrer"
                className="link-sheet-btn"
                onClick={closeSheet}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Open Link
              </a>
            </div>

            {/* Share via apps */}
            <p className="link-sheet-share-label">Share via</p>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none w-full justify-start px-2">
              {SHARE_APPS.map((app) => (
                <div key={app.id} className="flex flex-col items-center gap-1.5 shrink-0 snap-start">
                  {app.action ? (
                    <button
                      type="button"
                      className="link-sheet-share-btn"
                      aria-label={`Share on ${app.label}`}
                      onClick={() => {
                        app.action!(shareUrl(sheet.id));
                        closeSheet();
                      }}
                    >
                      {shareIcons[app.id]}
                    </button>
                  ) : (
                    <a
                      href={app.url!(shareUrl(sheet.id))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-sheet-share-btn"
                      aria-label={`Share on ${app.label}`}
                      onClick={closeSheet}
                    >
                      {shareIcons[app.id]}
                    </a>
                  )}
                  <span className="text-[0.65rem] text-text-muted">{app.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </dialog>

      {/* Toast */}
      <div className={`link-toast${toast ? " show" : ""}`} role="status">
        Link copied!
      </div>
    </>
  );
}
