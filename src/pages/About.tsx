import { StoreLayout } from "@/components/StoreLayout";
import { heroImage } from "@/lib/images";

export default function About() {
  return (
    <StoreLayout>
      <section className="bg-hero text-primary-foreground">
        <div className="container py-20 max-w-3xl">
          <span className="text-xs uppercase tracking-[0.3em] text-gold">Our heritage</span>
          <h1 className="mt-4 font-serif text-5xl">From Ambalangoda to the world</h1>
          <p className="mt-6 text-lg text-primary-foreground/85">
            For more than 200 years, the coastal village of Ambalangoda has been the heart of Sri Lankan
            mask carving. Our masks are still made the way they always have been — from kaduru wood,
            cured in smoke, carved with chisels, and painted with natural pigments.
          </p>
        </div>
      </section>

      <section className="container py-20 grid md:grid-cols-2 gap-12 items-center">
        <img src={heroImage} alt="Master artisan at work" loading="lazy" width={800} height={600} className="rounded-lg shadow-elegant" />
        <div>
          <h2 className="font-serif text-3xl">Three sacred families</h2>
          <p className="mt-4 text-foreground/80">
            <strong className="text-primary">Raksha</strong> — demon masks worn in the Raksha Kolama dance,
            believed to ward off evil. <br /><br />
            <strong className="text-primary">Sanni</strong> — the eighteen masks of illness, used in the
            Daha Ata Sanniya healing ritual. <br /><br />
            <strong className="text-primary">Kolam</strong> — comic masks of folk theatre, depicting kings,
            ministers, and ordinary villagers.
          </p>
        </div>
      </section>
    </StoreLayout>
  );
}
