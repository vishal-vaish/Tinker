"use client";

import React from "react";
import { motion } from "framer-motion";

interface ShinyTextProps {
  children: React.ReactNode;
  className?: string;
  baseColor?: string;
  shineColor?: string;
  speed?: number;
}

export function ShinyText({
  children,
  className = "",
  baseColor = "#64CEFB",
  shineColor = "#ffffff",
  speed = 3,
}: ShinyTextProps) {
  return (
    <motion.span
      className={`inline-block select-none ${className}`}
      style={{
        backgroundImage: `linear-gradient(100deg, ${baseColor} 0%, ${baseColor} 40%, ${shineColor} 50%, ${baseColor} 60%, ${baseColor} 100%)`,
        backgroundSize: "200% 100%",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        color: "transparent",
      }}
      animate={{
        backgroundPosition: ["100% 0%", "-100% 0%"],
      }}
      transition={{
        repeat: Infinity,
        duration: speed,
        ease: "linear",
      }}
    >
      {children}
    </motion.span>
  );
}
