import { memo, useEffect, useRef, useState } from "react";

export function thumbUrl(href: string) {
  return href.replace("/art/min/", "/art/thumb/");
}

export function carouselUrl(href: string) {
  return href.replace("/art/min/", "/art/carousel/");
}

const loadedSrcs = new Set<string>();

export const BlurImage = memo(function BlurImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const cachedAlready = loadedSrcs.has(src);
  const [loaded, setLoaded] = useState(cachedAlready);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      loadedSrcs.add(src);
      setLoaded(true);
    }
  }, [src]);

  return (
    <div className="relative h-full w-full">
      {/* Only show blur placeholder for images not yet loaded */}
      {!cachedAlready && (
        <img
          src={thumbUrl(src)}
          alt=""
          aria-hidden
          draggable={false}
          className={`${className} absolute inset-0`}
          style={{ filter: "blur(20px)", transform: "scale(1.1)" }}
        />
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        draggable={false}
        onLoad={() => {
          loadedSrcs.add(src);
          setLoaded(true);
        }}
        className={`${className} absolute inset-0 ${cachedAlready ? "opacity-100" : `transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}`}
      />
    </div>
  );
});
