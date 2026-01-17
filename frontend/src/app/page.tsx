import GoogleLoginButton from "@/components/common/GoogleLoginBtn";
import Link from "next/link";
import HeroSlider from "@/components/home/HeroSlider";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <HeroSlider />
    </main>
  );
}