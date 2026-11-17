import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col justify-center text-center flex-1 py-16">
      <h1 className="text-4xl font-bold mb-4">Exhibit Docs</h1>
      <p className="text-lg text-fd-muted-foreground mb-8 max-w-xl mx-auto">
        How Exhibit works: your personal gallery for self-contained HTML+JS
        micro-tools. Save, organize, search, and re-run them anywhere.
      </p>
      <div className="flex gap-4 justify-center">
        <Link
          href="/docs"
          className="font-medium underline underline-offset-4"
        >
          Read the docs
        </Link>
        <Link
          href="/docs/quickstart"
          className="font-medium underline underline-offset-4"
        >
          Quickstart
        </Link>
      </div>
      <p className="mt-8 text-sm text-fd-muted-foreground">
        Companion to{' '}
        <a
          href="https://github.com/momja/Exhibit"
          className="underline underline-offset-4"
        >
          momja/Exhibit
        </a>
        . Screenshots live in <code>public/screenshots</code> — see Docs →
        Screenshots.
      </p>
    </div>
  );
}
