import Image from "next/image";
import { Car, MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

const blurDataUrl =
  "data:image/gif;base64,R0lGODlhAQABAPAAAB9NOv///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==";

const venuePhotos = [
  {
    src: "/media/boteco/caju-limao-5.jpg",
    alt: "Salão do Boteco Caju Limão com mesas ocupadas à noite",
    className: "lg:col-span-8 lg:row-span-2",
    aspect: "aspect-[16/9] lg:aspect-[4/3]",
  },
  {
    src: "/media/boteco/boteco-caju-2.jpg",
    alt: "Drink do Boteco Caju Limão sobre a mesa",
    className: "lg:col-span-4",
    aspect: "aspect-[4/3]",
  },
  {
    src: "/media/boteco/boteco-caju-1.jpg",
    alt: "Petisco empanado servido no Boteco Caju Limão",
    className: "lg:col-span-4",
    aspect: "aspect-[4/3]",
  },
  {
    src: "/media/boteco/caju-limao-3.jpg",
    alt: "Porção de bolinhos servida no Boteco Caju Limão",
    className: "lg:col-span-6",
    aspect: "aspect-[4/3]",
  },
  {
    src: "/media/boteco/caju-limao-4.jpg",
    alt: "Picanha na chapa com batata frita no Boteco Caju Limão",
    className: "lg:col-span-6",
    aspect: "aspect-[4/3]",
  },
];

const links = [
  {
    href: "https://www.google.com/maps/search/?api=1&query=633M%2BW7+Sudoeste%2FOctogonal+Bras%C3%ADlia+-+DF",
    label: "Abrir no Google Maps",
    icon: MapPin,
    primary: true,
  },
  {
    href: "https://waze.com/ul?q=Boteco+Caju+Lim%C3%A3o+Sudoeste+Bras%C3%ADlia",
    label: "Abrir no Waze",
    icon: Navigation,
  },
  {
    href: "https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=SIG+Quadra+8+Sudoeste+Bras%C3%ADlia",
    label: "Chamar Uber",
    icon: Car,
  },
];

export function Venue() {
  return (
    <section className="bg-primary px-5 py-20 text-background">
      <div className="mx-auto w-full max-w-6xl">
        <div className="max-w-3xl">
          <p className="font-display text-2xl font-semibold text-accent">
            O QG da festa
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-6xl">
            Boteco Caju Limão
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-background/85 sm:text-xl">
            Choppe gelado, petisco fritinho na hora e aquele clima de boteco bom
            de Brasília. É lá que a gente vai derrubar o 55.
          </p>
        </div>

        <div className="-mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 lg:mx-0 lg:grid lg:grid-cols-12 lg:overflow-visible lg:px-0 lg:pb-0">
          {venuePhotos.map((photo) => (
            <figure
              className={`group relative w-[82vw] shrink-0 snap-center overflow-hidden rounded-lg shadow-lg lg:w-auto ${photo.className}`}
              key={photo.src}
            >
              <div className={`relative ${photo.aspect}`}>
                <Image
                  alt={photo.alt}
                  blurDataURL={blurDataUrl}
                  className="object-cover transition duration-300 group-hover:scale-[1.03] group-hover:brightness-110"
                  fill
                  placeholder="blur"
                  sizes="(min-width: 1024px) 50vw, 82vw"
                  src={photo.src}
                />
              </div>
            </figure>
          ))}
        </div>

        <div className="mt-10 rounded-lg border border-accent/30 bg-background/10 p-6 backdrop-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-accent text-primary">
                <MapPin aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-lg font-medium">
                  SIG Quadra 8 — Cruzeiro/Sudoeste/Octogonal
                </p>
                <p className="mt-1 text-background/75">
                  Brasília - DF · 70610-480
                </p>
                <p className="mt-2 text-sm font-medium text-accent">633M+W7</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {links.map(({ href, label, icon: Icon, primary }) => (
                <Button
                  asChild
                  className={
                    primary
                      ? "bg-background text-primary hover:bg-background/90 focus-visible:ring-accent focus-visible:ring-offset-primary"
                      : "border-background text-background hover:bg-background hover:text-primary focus-visible:ring-accent focus-visible:ring-offset-primary"
                  }
                  key={label}
                  variant={primary ? "default" : "outline"}
                >
                  <a href={href} rel="noopener noreferrer" target="_blank">
                    <Icon aria-hidden="true" className="mr-2 h-4 w-4" />
                    {label}
                  </a>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
