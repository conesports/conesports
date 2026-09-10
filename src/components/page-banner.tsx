import Image from "next/image";

export function PageBanner({
  title,
  intro,
  image,
}: {
  title: string;
  intro?: string;
  image: string;
}) {
  return (
    <div className="relative mb-8 min-h-[240px] overflow-hidden bg-zinc-900 text-white md:min-h-[320px]">
      <Image
        src={image}
        alt=""
        fill
        sizes="(max-width: 1152px) 100vw, 1152px"
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />
      <div className="relative flex min-h-[240px] flex-col justify-end px-5 py-8 md:min-h-[320px] md:px-10">
        <h1 className="text-4xl font-bold tracking-tight uppercase md:text-5xl">{title}</h1>
        {intro ? <p className="mt-3 max-w-2xl text-sm text-white/80">{intro}</p> : null}
      </div>
    </div>
  );
}
