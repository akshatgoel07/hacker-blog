import HeroSection from "../components/HeroSection";
import FeaturesGrid from "../components/FeatureGrid";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
// import { FloatingDockDemo } from "../components/Dock";

export const Landing = () => {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <main className="flex-1">
        <Navbar />
        <HeroSection />
        <FeaturesGrid />
        {/* <FloatingDockDemo /> */}
        <Footer />
      </main>
    </div>
  );
};
