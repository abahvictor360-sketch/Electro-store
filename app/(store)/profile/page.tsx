import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/ProfileForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, createdAt: true, addresses: true, _count: { select: { orders: true } } },
  });
  if (!user) redirect("/auth/login");

  const initial = (user.name ?? user.email)[0].toUpperCase();
  const colors = ["#d10024", "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"];
  const avatarColor = colors[initial.charCodeAt(0) % colors.length];

  return (
    <>
      {/* BREADCRUMB */}
      <div id="breadcrumb" className="section">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <ul className="breadcrumb-tree">
                <li><Link href="/">Home</Link></li>
                <li className="active">My Profile</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="section" style={{ padding: "30px 0 60px" }}>
        <div className="container">
          <div className="row">

            {/* Sidebar */}
            <div className="col-md-3 hidden-sm hidden-xs">
              <div className="user-dash-sidebar" style={{ marginBottom: 20 }}>
                <div style={{ padding: "24px 20px", textAlign: "center", borderBottom: "1px solid #f0f2f7" }}>
                  <div style={{ width: 68, height: 68, borderRadius: "50%", background: avatarColor, color: "#fff", fontSize: 28, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                    {initial}
                  </div>
                  <div style={{ fontWeight: 700, color: "#2b2d42", fontSize: "0.95rem" }}>{user.name ?? "User"}</div>
                  <div style={{ fontSize: "0.78rem", color: "#999", marginTop: 2 }}>{user.email}</div>
                  <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 16 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontWeight: 700, color: "#2b2d42", fontSize: "1.1rem" }}>{user._count.orders}</div>
                      <div style={{ fontSize: "0.7rem", color: "#999" }}>Orders</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontWeight: 700, color: "#2b2d42", fontSize: "1.1rem" }}>{user.addresses.length}</div>
                      <div style={{ fontSize: "0.7rem", color: "#999" }}>Addresses</div>
                    </div>
                  </div>
                </div>
                <nav style={{ padding: "8px 0" }}>
                  {[
                    { href: "/orders",   icon: "fa-receipt",      label: "My Orders" },
                    { href: "/wishlist", icon: "fa-heart",         label: "Wishlist" },
                    { href: "/profile",  icon: "fa-user",          label: "Profile", active: true },
                    { href: "/store",    icon: "fa-shopping-bag",  label: "Continue Shopping" },
                  ].map((item) => (
                    <div key={item.href} className="nav-item">
                      <Link href={item.href} className={item.active ? "active" : ""}>
                        <i className={`fa ${item.icon}`} style={{ width: 18, color: item.active ? "#d10024" : undefined }} />
                        {item.label}
                      </Link>
                    </div>
                  ))}
                </nav>

                <div style={{ padding: "16px 20px", borderTop: "1px solid #f0f2f7" }}>
                  <div style={{ fontSize: "0.72rem", color: "#bbb" }}>
                    Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="col-md-9">
              <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", padding: "32px" }}>
                <h4 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, color: "#2b2d42", marginBottom: 6, fontSize: "1.1rem" }}>
                  Account Information
                </h4>
                <p style={{ color: "#999", fontSize: "0.85rem", marginBottom: 28 }}>
                  Update your name, email address and password below.
                </p>
                <ProfileForm user={user} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
