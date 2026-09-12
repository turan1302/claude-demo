import { BrandMark } from "@/components/layout/brand-mark";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <BrandMark size="md" />
        </div>
        {children}
        <p className="mt-8 text-center text-[11.5px] text-ink-tertiary">
          © {new Date().getFullYear()} Ufuk · SEO/GEO Yönetim Paneli
        </p>
      </div>
    </div>
  );
}
