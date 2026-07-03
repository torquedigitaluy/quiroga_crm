import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  width?: number;
  height?: number;
};

export function Logo({ className, width = 180, height = 42 }: LogoProps) {
  return (
    <Image
      src="/logo-quiroga.png"
      alt="Quiroga Automóviles"
      width={width}
      height={height}
      priority
      className={cn("h-auto w-auto object-contain", className)}
    />
  );
}
