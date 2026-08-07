import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  const role = user?.publicMetadata?.role as string | undefined;
  
  if (role !== "admin" && role !== "staff") {
    redirect("/");
  }


  const userEmail = user?.emailAddresses[0]?.emailAddress;

  return (
    <div className="flex h-screen bg-warm-parchment text-ink-black font-body-md overflow-hidden">
      <AdminSidebar userEmail={userEmail} role={role} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <header className="h-16 bg-warm-parchment border-b border-ink-black flex items-center pr-4 md:pr-8 pl-14 md:pl-8 justify-between shrink-0">
          <div className="font-label-caps text-label-caps uppercase truncate">Admin Panel</div>
          <div className="flex gap-4">
            <Link href="/" target="_blank" className="text-sm underline underline-offset-4 decoration-ink-black/40 hover:decoration-ink-black">
              View Store
            </Link>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
