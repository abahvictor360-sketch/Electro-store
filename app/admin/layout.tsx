import SessionProvider from "@/components/SessionProvider";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div>
        <AdminSidebar />
        <div className="admin-content">
          {children}
        </div>
      </div>
    </SessionProvider>
  );
}
