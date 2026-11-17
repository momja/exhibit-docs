import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col justify-center text-center flex-1 py-16">
      <h1 className="text-4xl font-bold mb-4">Exhibit user guide</h1>
      <p className="text-lg text-fd-muted-foreground mb-8 max-w-xl mx-auto">
        Exhibit is your personal gallery for small, self-contained HTML and
        JavaScript tools. Save, organize, and find your tools, then open them
        in your browser wherever you need them.
      </p>
      <div className="flex gap-4 justify-center">
        <Link
          href="/docs"
          className="font-medium underline underline-offset-4"
        >
          Read the guide
        </Link>
        <Link
          href="/docs/tour"
          className="font-medium underline underline-offset-4"
        >
          Take the tour
        </Link>
      </div>
      <p className="mt-8 text-sm text-fd-muted-foreground">
        User guide for{' '}
        <a
          href="https://github.com/momja/Exhibit"
          className="underline underline-offset-4"
        >
          momja/Exhibit
        </a>
        . See Screenshots in the guide for where to find the images.
      </p>
    </div>
  );
}
