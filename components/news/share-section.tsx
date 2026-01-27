"use client";

import Link from "next/link";
import { Mail, Facebook, Linkedin, Twitter, Share2 } from "lucide-react";

interface ShareSectionProps {
  title?: string;
  url?: string;
}

export function ShareSection({
  title = "Share this post",
  url,
}: ShareSectionProps) {
  // Default to current URL if none provided
  const shareUrl =
    url || (typeof window !== "undefined" ? window.location.href : "");

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent("Check out this article");

    let shareLink = "";

    switch (platform) {
      case "email":     
        shareLink = `mailto:?subject=${encodedTitle}&body=${encodedUrl}`;
        break;
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case "whatsapp":
        shareLink = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
        break;
      default:
        return;
    }

    window.open(shareLink, "_blank", "width=600,height=400");
  };

  return (
    <div className="">
      {/* Divider line */}
      <div className="border-t border-gray-300 mb-8"></div>

      {/* Share section */}
      <div className="mb-16 px-[5%]">
        <h3 className="text-3xl font-bold text-gray-800 mb-6">{title}</h3>
        <div className="flex space-x-3">
          <button
            onClick={() => handleShare("email")}
            className="bg-black text-white rounded-full p-3 hover:bg-gray-800 transition-colors"
            aria-label="Share via email"
          >
            <Mail size={20} />
          </button>
          <button
            onClick={() => handleShare("facebook")}
            className="bg-black text-white rounded-full p-3 hover:bg-gray-800 transition-colors"
            aria-label="Share on Facebook"
          >
            <Facebook size={20} />
          </button>
          <button
            onClick={() => handleShare("linkedin")}
            className="bg-black text-white rounded-full p-3 hover:bg-gray-800 transition-colors"
            aria-label="Share on LinkedIn"
          >
            <Linkedin size={20} />
          </button>
          <button
            onClick={() => handleShare("twitter")}
            className="bg-black text-white rounded-full p-3 hover:bg-gray-800 transition-colors"
            aria-label="Share on Twitter"
          >
            <Twitter size={20} />
          </button>
          <button
            onClick={() => handleShare("whatsapp")}
            className="bg-black text-white rounded-full p-3 hover:bg-gray-800 transition-colors"
            aria-label="Share on WhatsApp"
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-gray-200 p-[5%]">
        <div className="max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Do you have an upcoming video production project or digital live
            event?{" "}
            <Link
              href="/contact"
              className="underline hover:text-gray-600 transition-colors"
            >
              Get in touch today
            </Link>{" "}
            – we'd love to hear from you.
          </h2>
        </div>
      </div>
    </div>
  );
}
