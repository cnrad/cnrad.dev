import { memo, useEffect, useRef, useState } from "react";

export function previewUrl(href: string) {
  return href.replace("/art/carousel/", "/art/preview/");
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
