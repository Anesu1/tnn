import Link from "next/link"

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto border border-border p-8 bg-card">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Sign In</span>
          <h1 className="text-3xl font-serif font-black tracking-tighter mt-3">Welcome Back</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Sign in to manage your subscriptions, saved stories, and newsletters.
          </p>
          <form className="mt-6 space-y-4">
            <input
              className="w-full border border-border bg-background/60 px-3 py-2 text-sm"
              placeholder="Email address"
              type="email"
            />
            <input
              className="w-full border border-border bg-background/60 px-3 py-2 text-sm"
              placeholder="Password"
              type="password"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-3 w-3" />
                Remember me
              </label>
              <Link href="#" className="underline">Forgot password?</Link>
            </div>
            <button className="w-full bg-accent text-white py-2 text-xs font-black uppercase tracking-[0.2em]">
              Sign In
            </button>
          </form>
          <p className="text-xs text-muted-foreground mt-6">
            New here? <Link href="/subscribe" className="underline">Start a subscription</Link>.
          </p>
        </div>
      </section>
    </main>
  )
}
