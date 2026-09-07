'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ScrollNormalizer() {
  useEffect(() => {
    ScrollTrigger.normalizeScroll(true);
  }, []);

  return null;
}
