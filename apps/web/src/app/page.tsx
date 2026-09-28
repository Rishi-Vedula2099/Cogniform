import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link href="#" className="flex items-center justify-center font-bold text-xl tracking-tight text-primary">
          Cogniform
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4">
            Sign In
          </Link>
          <Link href="/signup" className="text-sm font-medium hover:underline underline-offset-4">
            Sign Up
          </Link>
        </nav>
      </header>
      <main className="flex-1 flex flex-col justify-center items-center text-center p-8 bg-gradient-to-br from-background via-muted/20 to-background">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl mb-6">
          The Premium Alternative to <span className="text-primary">Google Forms</span>
        </h1>
        <p className="max-w-[600px] text-muted-foreground md:text-xl mb-8">
          Build rich, responsive forms with drag-and-drop components, advanced conditional logic, and robust analytics.
        </p>
        <div className="flex gap-4">
          <Link href="/signup" className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1">
            Get Started
          </Link>
        </div>
      </main>
    </div>
  );
}
