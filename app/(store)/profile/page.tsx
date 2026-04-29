import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, createdAt: true, addresses: true },
  });
  if (!user) redirect("/auth/login");

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4" style={{ color: "var(--dark)" }}>My Profile</h2>
      <div className="row g-4">
        <div className="col-md-8">
          <ProfileForm user={user} />
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-4 text-center">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
              style={{ width: 80, height: 80, background: "var(--primary)", color: "#fff", fontSize: 32, fontWeight: 700 }}
            >
              {(user.name ?? user.email)[0].toUpperCase()}
            </div>
            <h5 className="fw-bold">{user.name ?? "—"}</h5>
            <p className="text-muted mb-1">{user.email}</p>
            <small className="text-muted">
              Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
