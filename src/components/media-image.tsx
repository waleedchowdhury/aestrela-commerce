import Image from "next/image";

type MediaImageProps = {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
};

function shouldUseNativeImage(src: string) {
  return src.startsWith("data:") || src.startsWith("/uploads/");
}

export function MediaImage({ src, alt, className = "", fill = false, priority = false }: MediaImageProps) {
  if (shouldUseNativeImage(src)) {
    const fillClassName = fill ? "absolute inset-0 h-full w-full " : "";

    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={`${fillClassName}${className}`} />;
  }

  return <Image src={src} alt={alt} fill={fill} priority={priority} className={className} />;
}
