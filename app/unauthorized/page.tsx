import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShieldX, ArrowLeft, LogIn } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8FAFC]">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-[#FEF2F2] rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-8 h-8 text-[#EF4444]" />
        </div>
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-2">Access Denied</h1>
        <p className="text-[15px] text-[#64748B] leading-relaxed mb-8">
          You do not have permission to view this page. Please sign in with an authorized account or return to the home page.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/auth/login">
            <Button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white cursor-pointer h-10 px-5">
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="cursor-pointer h-10 px-5 border-[#E2E8F0] text-[#334155]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
