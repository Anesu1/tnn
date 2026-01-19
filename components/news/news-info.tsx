import React from 'react'
import { StaggeredImageGallery } from '../ui/staggered-image-gallery'

interface NewsInfoProps {

  content?: string
  images?: Array<{
    src: string
    alt: string
  }>
}

export default function NewsInfo({content, images}:NewsInfoProps) {
  const topRowImages = images.slice(0, 2)
  const bottomRowImages = images.slice(2, 4)
  return (
    <section className="py-16 md:py-24 px-[5%] bg-white scroll-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="flex md:justify-end gap-12 md:gap-16">
          {/* Left Column - Heading */}
          

          {/* Right Column - Text Content */}
          <div className="space-y-6 max-w-[500px] text-gray-700">
            <p className="text-lg md:text-xl">
           {content} </p>
           
           
          </div>
        </div>

        {/* Image Gallery */}
       <StaggeredImageGallery
                           topRowImages={topRowImages}
                           bottomRowImages={bottomRowImages}
                           className="mt-16 md:mt-24"
                       />

       
      </div>
    </section>
  )
}
