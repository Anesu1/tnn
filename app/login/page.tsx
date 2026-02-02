import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  return (
    <PageShell title="Sign In" description="Access your NewsStream account.">
      <form className="max-w-md space-y-4">
        <Input placeholder="Email address" type="email" />
        <Input placeholder="Password" type="password" />
        <Button type="submit">Sign In</Button>
      </form>
    </PageShell>
  )
}
