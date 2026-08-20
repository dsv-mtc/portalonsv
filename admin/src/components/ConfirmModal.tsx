import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { BrandButton } from "./UIBits";

export function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 16, width: 400, maxWidth: "90vw",
          padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: "#fdecec", color: "#C8102E",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: 18, fontWeight: 800, color: "#14213D", margin: 0,
              fontFamily: "var(--font-display)",
            }}>{title}</h3>
            <p style={{
              fontSize: 14, color: "#5c6273", lineHeight: 1.5,
              margin: "6px 0 0",
            }}>{message}</p>
          </div>
          <button type="button" onClick={onCancel} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#5c6273", padding: 4, borderRadius: 6,
          }}><X className="w-4 h-4" /></button>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <BrandButton variant="outline" onClick={onCancel}>Cancelar</BrandButton>
          <BrandButton onClick={onConfirm}>Eliminar</BrandButton>
        </div>
      </div>
    </div>
  );
}
