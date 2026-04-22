export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card mt-24">
      <div className="container py-12 grid gap-8 md:grid-cols-3">
        <div>
          <h3 className="font-serif text-xl text-primary">Raksha & Co.</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            Hand-carved ceremonial masks from the artisan villages of Ambalangoda, Sri Lanka.
            Shipped to Japan and worldwide.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">Visit</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Ambalangoda Workshop</li>
            <li>Galle, Sri Lanka</li>
            <li>Tokyo Showroom (by appointment)</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>hello@raksha.co</li>
            <li>+81 (0)3 0000 0000</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Raksha & Co. — All masks handmade by master craftsmen.
      </div>
    </footer>
  );
}
