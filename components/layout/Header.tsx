import Link from "next/link";
import { PrimaryNav } from "./PrimaryNav";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-(--background)/75 backdrop-blur-xl">
      <div className="mx-auto flex w-[min(1180px,calc(100%_-_2rem))] items-center justify-between gap-6 py-4 md:py-5">
        <Link
          href="/"
          className="display-heading text-primary text-lg font-semibold whitespace-nowrap"
        >
          Multipurpose Calculators
        </Link>

        <PrimaryNav />
      </div>
    </header>
  );
}
