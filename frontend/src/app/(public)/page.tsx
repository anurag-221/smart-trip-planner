import GoogleLoginButton from "@/components/common/GoogleLoginBtn";
import Link from "next/link";
import HeroSlider from "@/components/home/HeroSlider";
import PageContainer from "@/components/layout/PageContainer";

export default function HomePage() {
  return (
    <PageContainer className="bg-slate-950 text-white" fullWidth={true}>
      <HeroSlider />
    </PageContainer>
  );
}