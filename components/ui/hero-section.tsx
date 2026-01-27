import Image from "next/image"
import { cn } from "@/lib/utils"
import { urlFor } from "@/sanity/lib/image"

interface HeroSectionProps {
  /** Background image URL */
  backgroundImage: any
  /** Background image alt text */
  backgroundAlt?: string
  /** Main heading text */
  heading: string
  /** Optional subheading text */
  subheading?: string
  /** Text alignment - default is left */
  textAlign?: "left" | "center" | "right"
  /** Text position - default is bottom-left */
  textPosition?:
    | "top-left"
    | "top-center"
    | "top-right"
    | "center-left"
    | "center"
    | "center-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right"
  /** Overlay opacity (0-100) - default is 40 */
  overlayOpacity?: number
  /** Hero section height - default is "h-[50vh] md:h-[60vh] lg:h-[70vh]" */
  height?: string
  /** Optional additional className */
  className?: string
  /** Optional additional className for the heading */
  headingClassName?: string
  /** Optional additional className for the subheading */
  subheadingClassName?: string
}

export function HeroSection({
  backgroundImage,
  backgroundAlt = "Hero background",
  heading,
  subheading,
  textAlign = "left",
  textPosition = "bottom-left",
  overlayOpacity = 40,
  height = "h-[50vh] md:h-[60vh] lg:h-[100vh] ",
  className,
  headingClassName,
  subheadingClassName,
}: HeroSectionProps) {
  // Map text position to Tailwind classes
  const positionClasses = {
    "top-left": "items-start justify-start text-left pt-16 pb-0 px-8 md:px-16",
    "top-center": "items-start justify-center text-center pt-16 pb-0 px-8",
    "top-right": "items-start justify-end text-right pt-16 pb-0 px-8 md:px-16",
    "center-left": "items-center justify-start text-left px-8 md:px-16",
    center: "items-center justify-center text-center px-8",
    "center-right": "items-center justify-end text-right px-8 md:px-16",
    "bottom-left": "items-end justify-start text-left pt-0 pb-16 px-8 md:px-16",
    "bottom-center": "items-end justify-center text-center pt-0 pb-16 px-8",
    "bottom-right": "items-end justify-end text-right pt-0 pb-16 px-8 md:px-16",
  }

  // Map text alignment to Tailwind classes
  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",  
  }
 const backgroundImageUrl =  backgroundImage;

  return (
    <div className={cn("relative w-full overflow-hidden", height, className)}>
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
       {backgroundImageUrl && backgroundImageUrl !== "" && <Image src={backgroundImageUrl || "/placeholder.svg?height=400&width=600"} alt={backgroundAlt} quality={100} fill priority className="object-cover" />} 
        {/* Overlay */}
        <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity / 100 }} />
      </div>

      {/* Content Container */}
      <div className={cn("relative z-10 flex w-full h-full", positionClasses[textPosition])}>
        <div className={cn("max-w-4xl", alignClasses[textAlign])}>
          {heading && (
            <h1
              className={cn("text-[50px] md:text-6xl font-bold text-white tracking-tight", headingClassName)}
            >
              {heading}
            </h1>
          )}

          {subheading && (
            <p className={cn("mt-4 max-w-[500px] text-lg md:text-xl text-white/90", subheadingClassName)}>{subheading}</p>
          )}
        </div>
      </div>
    </div>
  )
}
