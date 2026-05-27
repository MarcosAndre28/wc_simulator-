import Image from "next/image";
import { getFlagPath } from "@/lib/countries";

interface FlagIconProps {
  iso: string;
  name: string;
  size?: number;
  className?: string;
}

export function FlagIcon({ iso, name, size = 24, className = "" }: FlagIconProps) {
  return (
    <Image
      src={getFlagPath(iso)}
      alt={`Bandeira de ${name}`}
      width={size}
      height={Math.round(size * 0.75)}
      className={`rounded-sm object-cover shadow-sm ${className}`}
      unoptimized
    />
  );
}
