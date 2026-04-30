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
      {/* ── Admin-scoped CSS resets ──────────────────────────────────────── */}
      {/* Load Bootstrap 5 + FA6 — these override Bootstrap 3 from root layout */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
      />

      {/* Inline admin layout CSS — fully self-contained, never depends on globals.css */}
      <style>{`
        /* ── Reset Bootstrap 3 interference on admin ── */
        #admin-root *, #admin-root *::before, #admin-root *::after { box-sizing: border-box; }
        #admin-root { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 14px; color: #333; background: #f0f2f7; }

        /* ── LAYOUT ── */
        #admin-root .a-wrap { display: flex; min-height: 100vh; }

        /* ── SIDEBAR ── */
        #admin-root .a-sidebar {
          width: 260px; min-height: 100vh; position: fixed; top: 0; left: 0; z-index: 200;
          background: linear-gradient(180deg, #1e2030 0%, #2b2d42 100%);
          display: flex; flex-direction: column;
          box-shadow: 4px 0 24px rgba(0,0,0,0.18);
          overflow-y: auto;
        }
        #admin-root .a-content { margin-left: 260px; flex: 1; display: flex; flex-direction: column; }

        /* ── BRAND ── */
        #admin-root .a-brand {
          padding: 22px 20px 18px; border-bottom: 1px solid rgba(255,255,255,0.07); flex-shrink: 0;
        }
        #admin-root .a-brand-link {
          display: flex; align-items: center; gap: 10px; text-decoration: none !important;
        }
        #admin-root .a-brand-icon {
          width: 38px; height: 38px; background: #d10024; border-radius: 10px;
          display: flex; align-items: center; justify-content: center; font-size: 17px; color: #fff; flex-shrink: 0;
        }
        #admin-root .a-brand-name { font-size: 1.1rem; font-weight: 800; color: #fff; line-height: 1; }
        #admin-root .a-brand-sub { font-size: 0.6rem; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 1.5px; margin-top: 2px; }

        /* ── NAV ── */
        #admin-root .a-nav { flex: 1; padding: 10px 0; }
        #admin-root .a-nav-section {
          padding: 14px 20px 4px; font-size: 0.6rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 2px; color: rgba(255,255,255,0.22);
        }
        #admin-root .a-nav-link {
          display: flex !important; align-items: center; gap: 10px;
          padding: 10px 20px; margin: 1px 10px; border-radius: 8px;
          color: rgba(255,255,255,0.6) !important; font-size: 0.855rem; font-weight: 500;
          text-decoration: none !important; transition: all 0.15s;
          cursor: pointer; background: transparent !important; border: none !important;
          width: calc(100% - 20px); text-align: left; line-height: 1.4;
        }
        #admin-root .a-nav-link:hover { background: rgba(255,255,255,0.08) !important; color: #fff !important; }
        #admin-root .a-nav-link.active {
          background: rgba(209,0,36,0.2) !important; color: #fff !important;
          border-left: 3px solid #d10024 !important; padding-left: 17px !important;
        }
        #admin-root .a-nav-icon { width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0; }
        #admin-root .a-nav-badge {
          margin-left: auto; background: #d10024; color: #fff; font-size: 0.62rem;
          font-weight: 700; padding: 1px 7px; border-radius: 20px; min-width: 18px; text-align: center;
        }
        #admin-root .a-nav-divider { border: none; border-top: 1px solid rgba(255,255,255,0.07); margin: 12px 10px; }
        #admin-root .a-sidebar-foot {
          padding: 14px 20px; border-top: 1px solid rgba(255,255,255,0.06); flex-shrink: 0;
          font-size: 0.68rem; color: rgba(255,255,255,0.2); line-height: 1.6;
        }

        /* ── TOPBAR ── */
        #admin-root .a-topbar {
          background: #fff; border-bottom: 1px solid #e8eaf0;
          padding: 0 28px; height: 62px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 100;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05); flex-shrink: 0;
        }
        #admin-root .a-topbar-title { font-size: 1.15rem; font-weight: 700; color: #1e2030; margin: 0; }
        #admin-root .a-topbar-right { display: flex; align-items: center; gap: 14px; }
        #admin-root .a-avatar {
          width: 36px; height: 36px; background: #d10024; border-radius: 50%; color: #fff;
          font-weight: 700; font-size: 14px; display: flex; align-items: center; justify-content: center;
          cursor: pointer; border: none; flex-shrink: 0;
        }

        /* ── MAIN AREA ── */
        #admin-root .a-main { padding: 26px 28px; flex: 1; }

        /* ── STAT CARDS ── */
        #admin-root .stat-card {
          background: #fff; border-radius: 14px; padding: 20px 22px;
          display: flex; align-items: center; gap: 16px;
          box-shadow: 0 1px 8px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.04);
          transition: transform 0.15s, box-shadow 0.15s; height: 100%;
        }
        #admin-root .stat-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.1); }
        #admin-root .stat-icon { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
        #admin-root .stat-label { font-size: 0.72rem; color: #888; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
        #admin-root .stat-value { font-size: 1.65rem; font-weight: 800; color: #1e2030; line-height: 1; }
        #admin-root .stat-change { font-size: 0.73rem; margin-top: 4px; }

        /* ── DATA CARD ── */
        #admin-root .data-card { background: #fff; border-radius: 14px; box-shadow: 0 1px 8px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.04); overflow: hidden; }
        #admin-root .data-card-header { padding: 16px 20px 12px; border-bottom: 1px solid #f0f2f7; display: flex; align-items: center; justify-content: space-between; }
        #admin-root .data-card-title { font-size: 0.92rem; font-weight: 700; color: #1e2030; margin: 0; }

        /* ── TABLE ── */
        #admin-root .admin-table { width: 100%; border-collapse: collapse; }
        #admin-root .admin-table th {
          padding: 11px 16px; background: #f8f9fc; font-size: 0.7rem;
          font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;
          color: #666; border-bottom: 1px solid #e8eaf0; white-space: nowrap;
        }
        #admin-root .admin-table td { padding: 13px 16px; border-bottom: 1px solid #f0f2f7; font-size: 0.855rem; color: #333; vertical-align: middle; }
        #admin-root .admin-table tr:last-child td { border-bottom: none; }
        #admin-root .admin-table tbody tr:hover td { background: #fafbfd; }

        /* ── BUTTONS ── */
        #admin-root .btn-ap {
          background: #d10024; color: #fff !important; border: none; border-radius: 8px;
          padding: 8px 16px; font-size: 0.82rem; font-weight: 600; cursor: pointer;
          display: inline-flex; align-items: center; gap: 6px; text-decoration: none !important;
          transition: background 0.15s; white-space: nowrap;
        }
        #admin-root .btn-ap:hover { background: #b8001f; }
        #admin-root .btn-as {
          background: #fff; color: #444 !important; border: 1px solid #e0e0e0; border-radius: 8px;
          padding: 7px 14px; font-size: 0.82rem; font-weight: 500; cursor: pointer;
          display: inline-flex; align-items: center; gap: 6px; text-decoration: none !important;
          transition: border-color 0.15s, background 0.15s; white-space: nowrap;
        }
        #admin-root .btn-as:hover { border-color: #bbb; background: #f8f9fc; }
        #admin-root .btn-icon {
          width: 32px; height: 32px; border-radius: 8px; border: 1px solid #e0e0e0;
          background: #fff; display: inline-flex; align-items: center; justify-content: center;
          cursor: pointer; color: #666; font-size: 13px; transition: all 0.15s; text-decoration: none !important;
        }
        #admin-root .btn-icon:hover { border-color: #d10024; color: #d10024; }
        #admin-root .btn-icon.danger:hover { background: #fee; border-color: #f44; color: #f44; }

        /* ── FORM CONTROLS ── */
        #admin-root .a-input {
          width: 100%; padding: 9px 13px; border: 1px solid #e0e0e0; border-radius: 8px;
          font-size: 0.855rem; outline: none; background: #fff; color: #333;
          transition: border-color 0.15s; box-sizing: border-box; font-family: inherit;
        }
        #admin-root .a-input:focus { border-color: #d10024; box-shadow: 0 0 0 3px rgba(209,0,36,0.08); }
        #admin-root .a-label { display: block; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #555; margin-bottom: 6px; }
        #admin-root .a-form-group { margin-bottom: 18px; }

        /* ── STATUS BADGES ── */
        #admin-root .badge-pending   { background: #fef3c7; color: #92400e; }
        #admin-root .badge-paid      { background: #cffafe; color: #155e75; }
        #admin-root .badge-shipped   { background: #dbeafe; color: #1e40af; }
        #admin-root .badge-delivered { background: #d1fae5; color: #065f46; }
        #admin-root .badge-cancelled { background: #fee2e2; color: #991b1b; }

        /* ── SEARCH BAR ── */
        #admin-root .a-search { position: relative; }
        #admin-root .a-search input { padding-left: 36px !important; }
        #admin-root .a-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #aaa; font-size: 12px; }

        /* ── DROPDOWN ── */
        #admin-root .a-dropdown {
          position: absolute; right: 0; top: calc(100% + 8px);
          background: #fff; border-radius: 10px; box-shadow: 0 8px 32px rgba(0,0,0,0.14);
          border: 1px solid #eee; width: 196px; z-index: 999; overflow: hidden;
        }
        #admin-root .a-dropdown a, #admin-root .a-dropdown button {
          display: flex !important; align-items: center; gap: 10px;
          padding: 10px 15px; font-size: 0.855rem; text-decoration: none !important;
          width: 100%; text-align: left; background: none; border: none; cursor: pointer;
          transition: background 0.12s;
        }
        #admin-root .a-dropdown a { color: #555 !important; }
        #admin-root .a-dropdown a:hover, #admin-root .a-dropdown button:hover { background: #f8f9fc; }
        #admin-root .a-dropdown button { color: #d10024 !important; }

        /* ── ALIASES (used by admin sub-pages) ── */
        #admin-root .data-card         { background: #fff; border-radius: 14px; box-shadow: 0 1px 8px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.04); overflow: hidden; }
        #admin-root .data-card-header  { padding: 16px 20px 12px; border-bottom: 1px solid #f0f2f7; display: flex; align-items: center; justify-content: space-between; }
        #admin-root .data-card-title   { font-size: 0.92rem; font-weight: 700; color: #1e2030; margin: 0; }
        #admin-root .data-card-body    { padding: 0; }
        #admin-root .admin-table       { width: 100%; border-collapse: collapse; }
        #admin-root .admin-table th    { padding: 11px 16px; background: #f8f9fc; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #666; border-bottom: 1px solid #e8eaf0; white-space: nowrap; }
        #admin-root .admin-table td    { padding: 13px 16px; border-bottom: 1px solid #f0f2f7; font-size: 0.855rem; color: #333; vertical-align: middle; }
        #admin-root .admin-table tr:last-child td { border-bottom: none; }
        #admin-root .admin-table tbody tr:hover td { background: #fafbfd; }
        #admin-root .btn-ap            { background: #d10024; color: #fff !important; border: none; border-radius: 8px; padding: 8px 16px; font-size: 0.82rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; text-decoration: none !important; transition: background 0.15s; white-space: nowrap; }
        #admin-root .btn-ap:hover      { background: #b8001f; }
        #admin-root .btn-as            { background: #fff; color: #444 !important; border: 1px solid #e0e0e0; border-radius: 8px; padding: 7px 14px; font-size: 0.82rem; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; text-decoration: none !important; transition: border-color 0.15s; white-space: nowrap; }
        #admin-root .btn-as:hover      { border-color: #bbb; background: #f8f9fc; }
        #admin-root .btn-admin-primary { background: #d10024; color: #fff !important; border: none; border-radius: 8px; padding: 8px 16px; font-size: 0.82rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; text-decoration: none !important; transition: background 0.15s; white-space: nowrap; }
        #admin-root .btn-admin-primary:hover { background: #b8001f; }
        #admin-root .btn-admin-secondary { background: #fff; color: #444 !important; border: 1px solid #e0e0e0; border-radius: 8px; padding: 7px 14px; font-size: 0.82rem; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; text-decoration: none !important; white-space: nowrap; }
        #admin-root .btn-admin-secondary:hover { border-color: #bbb; background: #f8f9fc; }
        #admin-root .admin-search      { position: relative; }
        #admin-root .admin-input       { width: 100%; padding: 9px 13px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 0.855rem; outline: none; background: #fff; color: #333; transition: border-color 0.15s; box-sizing: border-box; font-family: inherit; }
        #admin-root .admin-input:focus { border-color: #d10024; box-shadow: 0 0 0 3px rgba(209,0,36,0.08); }

        /* ── MISC ── */
        #admin-root .empty-state { text-align: center; padding: 50px 20px; color: #bbb; }
        #admin-root .empty-state i { font-size: 2.6rem; margin-bottom: 14px; display: block; }
        #admin-root .empty-state p { font-size: 0.9rem; color: #aaa; }
        #admin-root .text-red { color: #d10024 !important; }
      `}</style>

      {/* ── Shell ──────────────────────────────────────────────────────── */}
      <div id="admin-root">
        <div className="a-wrap">
          <AdminSidebar />
          <div className="a-content">
            <AdminTopbar userName={userName} userInitial={userInitial} />
            <div className="a-main">
              {children}
            </div>
          </div>
        </div>
      </div>

      <script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
        async
      />
    </SessionProvider>
  );
}
