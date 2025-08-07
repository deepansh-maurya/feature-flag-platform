import TopNavBar from "@/src/core/components/TopNavBar/TopNavBar";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dash-root">
      <TopNavBar/>
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}
