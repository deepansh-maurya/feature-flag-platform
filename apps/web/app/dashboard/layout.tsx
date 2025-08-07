import Sidebar from "@/src/core/components/sidebar/Sidebar";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dash-root">
      <Sidebar />
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}
