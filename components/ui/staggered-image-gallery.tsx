import Image from "next/image"
import { cn } from "@/lib/utils"

export interface GalleryImage {
  src: string
  alt: string
}

interface StaggeredImageGalleryProps {
  /** Images for the top row (first is larger, second is smaller) */
  topRowImages?: [GalleryImage, GalleryImage]
  /** Images for the bottom row (first is smaller, second is larger) */
  bottomRowImages?: [GalleryImage, GalleryImage]
  /** Gap between images (default: "gap-1") */
  gap?: string
  /** Width of larger images (default: "w-[80%] md:w-[55%]") */
  largeImageWidth?: string
  /** Width of smaller images (default: "w-[60%] md:w-[40%]") */
  smallImageWidth?: string
  /** Aspect ratio for all images (default: "aspect-video") */
  aspectRatio?: string
  /** Optional additional className for the container */
  className?: string
}

export function StaggeredImageGallery({
  topRowImages,
  bottomRowImages,
  gap = "gap-1",
  largeImageWidth = "w-[80%] md:w-[55%]",
  smallImageWidth = "w-[60%] md:w-[40%]",
  aspectRatio = "aspect-video",
  className,
}: StaggeredImageGalleryProps) {
  return (
    <div className={cn("flex flex-col", gap, className)}>
      {/* Top row */}
      {topRowImages && (<div
        className={cn(
          "flex flex-col md:flex-row items-end md:items-end justify-end md:justify-center",
          gap
        )}
      >
        <div
          className={cn(
            largeImageWidth,
            aspectRatio,
            "relative overflow-hidden"
          )}
        >
          <Image
            src={topRowImages[0].src || "/placeholder.svg"}
            alt={topRowImages[0].alt}
            fill
            className="object-cover"
          />
        </div>
        <div
          className={cn(
            smallImageWidth,
            aspectRatio,
            "relative overflow-hidden"
          )}
        >
          <Image
            src={topRowImages[1].src || "/placeholder.svg"}
            alt={topRowImages[1].alt}
            fill
            className="object-cover"
          />
        </div>
      </div>)}
      

      {bottomRowImages && (
         <div
        className={cn(
          "flex flex-col md:flex-row items-start md:items-start justify-start md:justify-center",
          gap
        )}
      >
        <div
          className={cn(
            smallImageWidth,
            aspectRatio,
            "relative overflow-hidden"
          )}
        >
          <Image
            src={bottomRowImages[0].src || "/placeholder.svg"}
            alt={bottomRowImages[0].alt}
            fill
            className="object-cover"
          />
        </div>
        <div
          className={cn(
            largeImageWidth,
            aspectRatio,
            "relative overflow-hidden"
          )}
        >
          <Image
            src={bottomRowImages[1].src || "/placeholder.svg"}
            alt={bottomRowImages[1].alt}
            fill
            className="object-cover"
          />
        </div>
      </div>
      )}
      {/* Bottom row */}
     
    </div>
  );
}
