// The Studio fills the window; remove the browser's default page margin around it
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{"body{margin:0}"}</style>
      {children}
    </>
  )
}
