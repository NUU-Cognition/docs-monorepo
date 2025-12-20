import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold tracking-tight mb-6">Flint</h1>
        <p className="text-xl text-muted-foreground mb-8">
          The structured workspace system for knowledge work.
        </p>
        <Link
          href="/docs"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          Read the Docs
        </Link>
      </div>
    </main>
  );
}
