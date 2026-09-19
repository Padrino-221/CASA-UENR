import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7FC]">
      <div className="text-center px-6">
        <p className="text-[120px] font-black text-[#E2E8F0] leading-none tracking-tighter">
          404
        </p>
        <h1 className="text-2xl font-black text-[#0F172A] tracking-tight mt-2">
          Page not found
        </h1>
        <p className="text-sm text-[#94A3B8] font-medium mt-3 max-w-sm mx-auto leading-relaxed">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-[#1E67FC] text-white text-sm font-bold hover:bg-[#0F53D6] transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
