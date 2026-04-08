import { Logo } from "./Logo";

export function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-ap-greyLight px-6">
      <Logo className="h-10 mb-8" />
      <h1 className="text-2xl font-bold tracking-tighter mb-2">
        Audit not found
      </h1>
      <p className="text-ap-greyDark text-sm">
        This audit link may have expired or the ID is incorrect.
      </p>
    </div>
  );
}
