"use client";

import { useId } from "react";
import styles from "./LiquidTitle.module.css";

/**
 * Água's chapter heading with a subtle "liquid" wobble.
 *
 * An inline SVG filter (feTurbulence → feDisplacementMap, animated via <animate>)
 * is applied to the <h1> through CSS `filter: url(#id)`. Pure SVG, no shader; it
 * degrades to plain text where SVG filters aren't supported and is disabled under
 * prefers-reduced-motion (the <animate> stops via CSS media query on the wrapper).
 */
export default function LiquidTitle({ children }: { children: string }) {
  const rawId = useId();
  const id = `liquid-${rawId.replace(/:/g, "")}`;

  return (
    <div className={styles.wrap}>
      <svg className={styles.defs} aria-hidden="true" focusable="false">
        <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012 0.028"
            numOctaves={2}
            seed={7}
            result="noise"
          >
            <animate
              attributeName="baseFrequency"
              dur="14s"
              values="0.012 0.028; 0.02 0.05; 0.012 0.028"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="7"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
      <h1 className={styles.title} style={{ filter: `url(#${id})` }}>
        {children}
      </h1>
    </div>
  );
}
