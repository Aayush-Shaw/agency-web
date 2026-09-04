import type { Metadata } from "next";
import MeshGradient from "@/components/ui/MeshGradient";
import Footer from "@/components/sections/Footer";
import ProjectsGallery from "./ProjectsGallery";

export const metadata: Metadata = {
  title: "All Projects | Digi Bear",
  description:
    "Explore all projects crafted by Digi Bear: web applications, AI video generation, video editing, social media assets, and digital design.",
  alternates: { canonical: "/projects" },
  openGraph: {
    type: "website",
    url: "/projects",
    siteName: "Digi Bear",
    title: "All Projects | Digi Bear",
    description:
      "Explore all projects crafted by Digi Bear: web applications, AI video generation, video editing, social media assets, and digital design.",
  },
};

export default function ProjectsPage() {
  return (
    <div className="relative z-10 min-h-dvh overflow-clip bg-bg text-text">
      {/* Background animated mesh */}
      <MeshGradient />

      {/* Main container with sticky nav header and project grid */}
      <main className="relative z-10 mx-auto max-w-[1600px] px-5 pb-20 md:px-8">
        <ProjectsGallery />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
