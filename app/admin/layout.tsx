import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SessionProvider from "@/components/SessionProvider";
import AdminSidebar from "@/components/AdminSidebar";
import AdminTopbar from "@/components/AdminTopbar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== "ADMIN") redirect("/auth/login");

  const userName = session.user?.name ?? session.user?.email ?? "Admin";
  const userInitial = userName[0].toUpperCase();

  return (
    <SessionProvider>
      {/* Bootstrap 5 + FA6 for admin */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />

      <div style={{ display: "flex" }}>
        <AdminSidebar />
        <div className="admin-content">
          <AdminTopbar userName={userName} userInitial={userInitial} />
          <div className="admin-main">
            {children}
          </div>
        </div>
      </div>

      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" async />
    </SessionProvider>
  );
}
