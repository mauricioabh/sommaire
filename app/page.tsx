import Image from "next/image";
import HeroSection from "@/components/home/hero-section";
import BgGradient from "@/components/common/bg-gradient";
import DemoSection from "@/components/home/demo-section";
import HowItWorks from "@/components/home/how-it-works-section";
import PricingSection from "@/components/home/pricing-section";
import CTASection from "@/components/home/cta-section";

export default function Home() {
  return (
    <div className="relative w-full">
      <BgGradient></BgGradient>
      <div className="flex flex-col">
        <HeroSection></HeroSection>
        <DemoSection></DemoSection>
        <HowItWorks></HowItWorks>
        <PricingSection></PricingSection>
        <CTASection></CTASection>
      </div>
    </div>
  );
}
