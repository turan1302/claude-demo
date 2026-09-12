import { Sparkle } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
            <Sparkle className="h-4.5 w-4.5 text-white" strokeWidth={2.4} />
          </div>
          <span className="text-lg font-semibold tracking-tight">Ufuk</span>
        </div>
        {children}
      </div>
    </div>
  );
}
