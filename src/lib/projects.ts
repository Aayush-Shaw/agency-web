import { gridVideo, popupVideo, posterVideo } from "@/lib/media";

export type Category = "Website" | "Video" | "AI Video";

export type Project = {
  title: string;
  cat: Category;
  src: string;
  posterSrc?: string;
  popupSrc?: string;
  video?: boolean;
  /** Live site. Video projects open their local popup source instead. */
  href?: string;
  /** Width ÷ height. The only thing that decides a tile's size: it is given the
      height of the band it sits in and this multiplies it out to a width.
      Below 1 (0.5625 is 9:16) means portrait, and that is also the switch for
      which band it gets - see TALL below. */
  aspect: number;
};

export const videoProject = (
  filename: string,
  aspect: number,
  title?: string,
  cat?: Category
): Project => ({
  title:
    title ??
    filename
      .replace(/_AI(?=\.[^.]+$)|\.[^.]+$/g, "")
      .replaceAll("-", " "),
  cat: cat ?? (/_AI(?=\.[^.]+$)/.test(filename) ? "AI Video" : "Video"),
  src: gridVideo(filename),
  posterSrc: posterVideo(filename),
  popupSrc: popupVideo(filename),
  video: true,
  aspect,
});

/* Video aspects are measured display width ÷ height from each MP4 track. */
export const PROJECTS: Project[] = [
  { title: "AutoNorth Motors", cat: "Website", src: "/work/autonorth-motors.jpg", href: "https://autonorth-motors.vercel.app/", aspect: 1.6 },
  { title: "Indian Grill", cat: "Website", src: "/work/indian-grill.jpg", href: "https://indiangrill.vercel.app/", aspect: 1.6 },
  { title: "JUJCO Heating & Cooling", cat: "Website", src: "/work/jujco-hvac.png", href: "https://digibearca.github.io/JUJCO-HVAC-website/", aspect: 1.6 },
  { title: "Auto Loan Calculator", cat: "Website", src: "/work/AutoNorth-Motors.png", href: "https://autonorthab.ca/", aspect: 1.6 },
  { title: "Earls", cat: "Website", src: "/work/earls.jpg", href: "https://services0987.github.io/earls/", aspect: 1.6 },
  { title: "Restaurant", cat: "Website", src: "/work/Restaurant.png", href: "https://services0987.github.io/SR/", aspect: 1.6 },
  // Landscape video placed 1st on top of the grid
  videoProject("cars-cinema_AI.mp4", 1.7778, "Cars Cinema"),
  videoProject("bronco-edit_AI.mp4", 1.7792, "Bronco Edit", "Video"),
  videoProject("2026-VAI_AI.mp4", 0.5625),
  videoProject("bronco_AI.mp4", 0.5625),
  videoProject("BRONCO-1-MAY.mp4", 0.5625),
  videoProject("bronco-amritpal_AI.mp4", 0.5625),
  videoProject("bronco-edit1_AI.mp4", 0.5625),
  videoProject("bronco-walkarround_AI.mp4", 0.5625),
  videoProject("citc_AI.mp4", 0.5625, "CITC"),
  videoProject("digibear-info_AI.mp4", 0.5625),
  videoProject("digibear-promo_AI.mp4", 0.5696),
  videoProject("dodge-helcat.mp4", 0.5625),
  videoProject("language_AI.mp4", 0.5699),
  videoProject("mountain_AI.mp4", 0.5625),
  videoProject("mustang-dealship.mp4", 0.5625),
  videoProject("mustang-edit_AI.mp4", 1.7792),
  videoProject("MUSTANG-MACH.mp4", 0.5625),
  videoProject("mustang-walkarround_AI.mp4", 0.5625),
  videoProject("jujco_AI.mp4", 0.5625, "JUJCO"),
  videoProject("rapter.mp4", 0.5625),
  videoProject("raptor-black.mp4", 0.5625),
  videoProject("raptor-R.mp4", 0.5625),
  videoProject("REAL-ESTATE_AI.mp4", 1.7778),
  videoProject("Video-97762_AI.mp4", 0.5625),
  videoProject("boutique-1.mp4", 0.5625),
  videoProject("boutique-2.mp4", 0.5625),
  videoProject("boutique-3.mp4", 0.5625),
];

export const TABS = ["All", "Website", "Video", "AI Video"] as const;
