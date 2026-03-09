export function TopBar({ title }: { title: string }) {
  return (
    <header className="topbar">
      <h2>{title}</h2>
      <div className="topbar-right">
        <span className="chip">Today</span>
        <span className="chip">7D</span>
        <span className="chip">14D</span>
        <span className="chip">30D</span>
        <span className="chip">Google</span>
        <span className="chip">Meta</span>
        <span className="chip">Yandex</span>
        <span className="chip">Organic</span>
      </div>
    </header>
  );
}
