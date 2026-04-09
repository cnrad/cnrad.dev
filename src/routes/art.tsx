import { COLLECTIONS } from "../data/art";
import { ArtCarousel } from "../components/art/ArtCarousel";

export function Art() {
  return (
    <>
      <ArtCarousel />

      <div className="my-8 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-neutral-400">collections</h3>
        {COLLECTIONS.map((collection) => (
          <a
            key={collection.name}
            href={collection.href}
            target="_blank"
            rel="noreferrer noopener"
            className="group relative h-32 overflow-hidden rounded-xl"
          >
            <div
              className="absolute inset-0 -z-1 bg-cover bg-center transition-all duration-500 ease-[cubic-bezier(0.26,1,0.6,1)] group-hover:scale-[1.03] group-hover:brightness-75"
              style={{ backgroundImage: `url(${collection.thumbnail})` }}
            />
            <div className="relative flex h-full flex-col justify-end bg-linear-to-t from-black/80 from-10% to-transparent p-5 -outline-offset-1 outline outline-neutral-500/10 group-hover:outline-neutral-500/20 rounded-xl transition-[outline] duration-200 ease-out">
              <h5 className="text-lg font-medium text-white">
                {collection.name}
              </h5>
              <p className="text-sm text-white/60">{collection.description}</p>
            </div>
          </a>
        ))}
      </div>

      <p className="text-xs text-white/40 text-center">
        All works © Conrad Crawford. Do not reproduce without the expressed
        written consent of Conrad Crawford.
      </p>
    </>
  );
}
