import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { requireDashboardSession } from "@/lib/auth"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireDashboardSession()

  if (!session) {
    redirect("/auth-portal")
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col gap-6 px-4 py-4 lg:flex-row lg:px-6">
      <DashboardSidebar />
      <main className="flex-1">{children}</main>
    </div>
  )
}
