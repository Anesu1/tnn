import React from 'react'
import { StaggeredImageGallery } from '../ui/staggered-image-gallery'

export interface NewsInfoProps {
  heading?: string
  content?: string
  images?: Array<{
    src: string
    alt: string
  }>
}

export default function NewsInfoThree({heading, content, images}: NewsInfoProps) {
  const topRowImages = images.slice(0, 2)
  return (
    <section className="py-16 md:py-24 px-[5%] bg-white scroll-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16">
          {/* Left Column - Heading */}
          <div>
            <h2 className="text-4xl md:text-5xl lg:text-[80px] font-bold text-gray-900 leading-tight">
              {heading}
            </h2>
          </div>

          {/* Right Column - Text Content */}
          <div className="space-y-6 text-gray-700">
            <p className="text-lg md:text-xl">
            {content} </p>
           
           
          </div>
        </div>

        {/* Image Gallery */}
       <StaggeredImageGallery
                          
                           bottomRowImages={topRowImages}
                           className="mt-16 md:mt-24"
                       />

       
      </div>
    </section>
  )
}
