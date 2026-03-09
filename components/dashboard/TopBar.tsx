export function TopBar({ title }: { title: string }) {
  return (
    <header className="topbar">
      <h2>{title}</h2>
      <div className="topbar-right">
        <span className="chip">30D</span>
        <span className="chip">Google</span>
        <span className="chip">Meta</span>
        <span className="chip">Organic</span>
      </div>
    </header>
  );
}
