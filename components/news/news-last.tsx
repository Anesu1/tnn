import React from 'react'
import { StaggeredImageGallery } from '../ui/staggered-image-gallery'
import Image from 'next/image';

interface ConclusionProps{
  heading?: string
  content?: string
  imageAlt: string
  imageUrl?: string
}

export default function NewsLast({heading, content, imageUrl, imageAlt}: ConclusionProps) {
  
  return (
    <section className="py-16 md:py-24 px-[5%] bg-gray-50  scroll-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16">
          {/* Left Column - Heading */}
          <div>
            <h2 className="text-4xl mb-[30px] md:text-5xl lg:text-[80px] font-bold text-gray-900 leading-tight">
              {heading}
            </h2>
            <div className="space-y-6 text-gray-700">
              <p className="text-lg md:text-xl">
                {content}
              </p>
             
            </div>
          </div>

          {/* Right Column - Text Content */}
          <div className="relative aspect-[3/4]  overflow-hidden">
            <Image
              src={imageUrl || "/placeholder.svg?height=400&width=600"}
              alt={imageAlt || ""}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
