export function MetricCard(props: {
  title: string;
  value: string | number;
  delta?: number | null;
}) {
  const deltaClass =
    props.delta == null ? "muted" : props.delta > 0 ? "ok" : props.delta < 0 ? "bad" : "muted";
  const deltaLabel =
    props.delta == null
      ? "-"
      : `${props.delta > 0 ? "+" : ""}${props.delta.toFixed(2)} vs prev day`;

  return (
    <div className="card">
      <div className="muted">{props.title}</div>
      <div className="score">{props.value}</div>
      <div className={deltaClass}>{deltaLabel}</div>
    </div>
  );
}
