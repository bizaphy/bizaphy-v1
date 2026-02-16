import Link from "next/link";

export default function Nav() {
  return (
    <nav className="neon-nav relative z-20 flex items-center border-b border-fuchsia-500 bg-black px-6 py-4">
      <Link
        href="/"
        className="neon-link flex items-center gap-2 font-bold tracking-widest"
      >
        <span className="neon-led inline-block h-2 w-2 rounded-full bg-fuchsia-500" />
        NEONLAB
      </Link>

      <div className="ml-auto flex gap-5">
        <Link href="/blog" className="neon-link">
          <span className="text-fuchsia-500">&gt;</span> Blog
        </Link>
        <Link href="/lab" className="neon-link">
          <span className="text-fuchsia-500">&gt;</span> Lab
        </Link>
        <Link href="/projects" className="neon-link">
          <span className="text-fuchsia-500">&gt;</span> Projects
        </Link>
      </div>
    </nav>
  );
}
