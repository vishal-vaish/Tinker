import Image from "next/image";

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export function Logo({ size = 32, className = "", showText = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Emblem */}
      <div
        className="relative shrink-0 flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
        style={{ width: size, height: size }}
      >
        <Image
          src="/logo.svg"
          alt="Tinker Logo"
          width={size}
          height={size}
          priority
          className="w-full h-full object-contain"
        />
      </div>

      {showText && (
        <span className="tracking-tight font-mono text-base font-extrabold bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-foreground">
          TINKER
        </span>
      )}
    </div>
  );
}
