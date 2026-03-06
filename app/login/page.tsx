import { LoginForm } from "@/components/dashboard/LoginForm";

export default function LoginPage() {
  return (
    <section className="card" style={{ maxWidth: 440 }}>
      <h1 className="page-title">Login</h1>
      <p className="muted">
        Login with magic link. Role enforcement is handled on dashboard pages and APIs.
      </p>
      <LoginForm />
    </section>
  );
}
