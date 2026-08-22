import { CurrentYear } from "./CurrentYear";

export function Footer() {
  return (
    <footer className="border-t border-border py-8 md:py-10">
      <div className="mx-auto w-[min(1180px,calc(100%_-_2rem))]">
        <p className="text-muted-foreground text-sm">
          &copy; <CurrentYear /> Multipurpose Calculators. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
