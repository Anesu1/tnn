import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function ContactPage() {
  return (
    <PageShell
      title="Contact"
      description="Send tips, feedback, or story ideas to the NewsStream team."
    >
      <form className="max-w-2xl space-y-4">
        <Input placeholder="Your name" />
        <Input placeholder="Email address" type="email" />
        <Input placeholder="Subject" />
        <Textarea placeholder="Your message" rows={6} />
        <Button type="submit">Send Message</Button>
      </form>
    </PageShell>
  )
}
