"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Link2, Share2, Facebook, Twitter } from "lucide-react"
import { FaLinkedin, FaWhatsapp } from "react-icons/fa"

interface ShareDialogProps {
  title?: string
  className?: string
}

export function ShareDialog({ title, className }: ShareDialogProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(`${window.location.origin}${pathname}`)
    }
  }, [pathname])

  const encodedUrl = useMemo(() => encodeURIComponent(shareUrl), [shareUrl])
  const encodedTitle = useMemo(() => encodeURIComponent(title ?? "Check this out"), [title])

  const twitterHref = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`
  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
  const linkedInHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
  const whatsappHref = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`

  const handleCopy = async () => {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <button
        className={className ?? "p-2 border border-border hover:bg-accent hover:text-white transition-all"}
        onClick={() => setOpen(true)}
        aria-label="Share story"
        type="button"
      >
        <Share2 className="h-4 w-4" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share this story</DialogTitle>
            <DialogDescription>
              Copy the link or share directly on your favorite platforms.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <button
              className="w-full border border-border px-4 py-3 flex items-center justify-between text-sm hover:border-accent transition-colors"
              onClick={handleCopy}
              type="button"
            >
              <span className="flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                {shareUrl || "Copy link"}
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {copied ? "Copied" : "Copy"}
              </span>
            </button>

            <div className="grid grid-cols-2 gap-3 text-xs font-bold uppercase tracking-widest">
              <a
                href={twitterHref}
                target="_blank"
                rel="noreferrer"
                className="border border-border px-4 py-3 flex items-center gap-2 hover:border-accent transition-colors"
              >
                <Twitter className="h-4 w-4" />
                X / Twitter
              </a>
              <a
                href={facebookHref}
                target="_blank"
                rel="noreferrer"
                className="border border-border px-4 py-3 flex items-center gap-2 hover:border-accent transition-colors"
              >
                <Facebook className="h-4 w-4" />
                Facebook
              </a>
              <a
                href={linkedInHref}
                target="_blank"
                rel="noreferrer"
                className="border border-border px-4 py-3 flex items-center gap-2 hover:border-accent transition-colors"
              >
                 <FaLinkedin className="h-4 w-4" />
                LinkedIn
              </a>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="border border-border px-4 py-3 flex items-center gap-2 hover:border-accent transition-colors"
              >
                 <FaWhatsapp className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
