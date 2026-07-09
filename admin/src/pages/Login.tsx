import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OnsvLogo } from "../components/OnsvLogo";
import { BrandButton } from "../components/UIBits";

export function Login() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const formData = new URLSearchParams();
    formData.append("username", user);
    formData.append("password", password);
    try {
      const res = await fetch("/administrador/api/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
      });
      if (res.url.includes("/api/auth/success")) {
        navigate("/");
      } else {
        setError("Credenciales inválidas");
      }
    } catch {
      setError("Error de conexión");
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-4" style={{ background: "linear-gradient(135deg, #0d1730 0%, #101a34 50%, #0b1428 100%)" }}>
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-8" style={{ boxShadow: "var(--shadow-brand-lg, 0 20px 54px rgba(20,33,61,.18))" }}>
        <div className="flex flex-col items-center text-center mb-8">
          <OnsvLogo className="w-16 h-16" tone="light" />
          <h1 className="mt-4 text-[22px] uppercase font-extrabold font-[family-name:var(--font-display)]" style={{ color: "var(--brand-navy)" }}>Iniciar Sesión</h1>
          <p className="text-[13px] mt-1" style={{ color: "var(--muted-foreground)" }}>Panel Administrativo ONSV</p>
        </div>
        {error && <div className="mb-4 p-3 rounded-lg bg-[#fdecec] text-[color:var(--brand-red)] text-[13px] font-semibold text-center">{error}</div>}
        <label className="block mb-4">
          <span className="text-[11px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>Usuario</span>
          <input type="text" value={user} onChange={e => setUser(e.target.value)} required className="mt-1 w-full h-11 rounded-lg border-2 px-3 text-[14.5px] outline-none transition focus:border-[color:var(--brand-navy)]" style={{ borderColor: "var(--brand-line)" }} />
        </label>
        <label className="block mb-6">
          <span className="text-[11px] uppercase tracking-[0.08em] font-bold font-[family-name:var(--font-cond)]" style={{ color: "var(--brand-navy)" }}>Contraseña</span>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 w-full h-11 rounded-lg border-2 px-3 text-[14.5px] outline-none transition" style={{ borderColor: "var(--brand-line)" }} />
        </label>
        <BrandButton type="submit" className="w-full justify-center h-12">Ingresar</BrandButton>
      </form>
    </div>
  );
}
