"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface NewsCardProps {
  title: string;
  date: string;
  readTime: string;
  imageUrl: string;
  slug: string;
  variant?: "default" | "month" | "year-review";
  overlayPosition?: "left" | "right";
  className?: string;
}

export function NewsCard({
  title,
  date,
  readTime,
  imageUrl,
  slug,
  variant = "default",
  overlayPosition = "left",
  className,
}: NewsCardProps) {
  return (
    <Link
      href={`/news/${slug}`}
      className={cn("group block relative overflow-hidden h-full", className)}
    >
      <div className="relative w-full h-full aspect-[4/5]">
        {/* Image */}
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Geometric overlay */}
        {variant === "month" && (
          <div
            className={cn(
              "absolute inset-0 z-10",
              overlayPosition === "left"
                ? "bg-gradient-to-tr from-blue-600 via-blue-600/80 to-transparent"
                : "bg-gradient-to-tl from-blue-600 via-blue-600/80 to-transparent"
            )}
            style={{
              clipPath:
                overlayPosition === "left"
                  ? "polygon(0 0, 100% 100%, 0 100%)"
                  : "polygon(100% 0, 100% 100%, 0 100%)",
              opacity: 0.9,
            }}
          />
        )}

        {/* Logo watermark */}
        <div className="absolute top-4 right-4 z-10 opacity-80">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M16 0L32 32H0L16 0Z" fill="white" />
          </svg>
        </div>

        {/* Content overlay */}
        <div className="absolute inset-x-0 bottom-0 z-20 p-6 bg-[#333333] min-h-[180px]">
          {variant === "month" && (
            <div className="mb-2">
              <h2 className="text-4xl font-bold text-white">
                {title.split(" ")[0]}
                <br />
                {title.includes("at Rise") && "at Rise"}
              </h2>
            </div>
          )}
          {variant !== "month" && (
            <h2 className="text-2xl font-bold text-white mb-2">{title.length >  40 ? title.slice(0, 40) + "..." : title}</h2>
          )}
          <div className="flex items-center text-white/80 text-sm">
            <span>{date}</span>
            <span className="mx-2">|</span>
            <span>{readTime}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
