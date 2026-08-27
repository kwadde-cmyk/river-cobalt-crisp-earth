import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import jsQR from "jsqr";
import { Button } from "@/components/ui/button";
import { Camera, FileUp, ImageUp } from "lucide-react";
import { useT } from "@/lib/use-t";

export function QrPreview({ value, label, compact }: { value: string; label: string; compact?: boolean }) {
  const { t } = useT();
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setSrc(null);
    if (!value) {
      setError(t("qr.none"));
      return;
    }
    QRCode.toDataURL(value, {
      errorCorrectionLevel: value.length > 800 ? "L" : "M",
      margin: 1,
      width: compact ? 200 : 320,
      color: { dark: "#0b0c0e", light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelled) setSrc(url);
      })
      .catch(() => {
        if (!cancelled) setError(t("qr.long"));
      });
    return () => {
      cancelled = true;
    };
  }, [value, t, compact]);

  return (
    <div className="flex flex-col items-center gap-3">
      {src ? (
        <img
          src={src}
          alt={t("qr.alt", { label })}
          className={compact ? "size-40 rounded-lg bg-paper p-2" : "size-64 rounded-lg bg-paper p-2"}
          width={compact ? 160 : 256}
          height={compact ? 160 : 256}
        />
      ) : (
        <div
          className={
            compact
              ? "flex size-40 items-center justify-center rounded-lg border border-border bg-surface text-xs text-fg-muted"
              : "flex size-64 items-center justify-center rounded-lg border border-border bg-surface text-xs text-fg-muted"
          }
        >
          {error ?? t("qr.building")}
        </div>
      )}
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}

export function QrScanner({ onRead, compact }: { onRead: (text: string) => void; compact?: boolean }) {
  const { t } = useT();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [camError, setCamError] = useState<string | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active) return;
    let stream: MediaStream | null = null;
    let raf = 0;
    let stopped = false;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        const tick = () => {
          if (stopped) return;
          const canvas = canvasRef.current;
          if (video && canvas && video.readyState >= 2) {
            const max = 480;
            const scale = Math.min(1, max / Math.max(video.videoWidth, video.videoHeight));
            const w = Math.max(1, Math.floor(video.videoWidth * scale));
            const h = Math.max(1, Math.floor(video.videoHeight * scale));
            if (canvas.width !== w) canvas.width = w;
            if (canvas.height !== h) canvas.height = h;
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            if (ctx && w && h) {
              ctx.drawImage(video, 0, 0, w, h);
              const img = ctx.getImageData(0, 0, w, h);
              const code = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
              if (code?.data) {
                onRead(code.data);
                stopped = true;
                return;
              }
            }
          }
          raf = window.setTimeout(() => {
            raf = requestAnimationFrame(tick);
          }, 80);
        };
        raf = requestAnimationFrame(tick);
      } catch {
        setCamError(t("qr.noCam"));
        setActive(false);
      }
    }

    void start();
    return () => {
      stopped = true;
      clearTimeout(raf);
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((tr) => tr.stop());
    };
  }, [active, onRead, t]);

  function onFile(file: File) {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(data.data, data.width, data.height);
      URL.revokeObjectURL(url);
      if (code?.data) onRead(code.data);
      else setCamError(t("qr.noCode"));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setCamError(t("qr.badImage"));
    };
    img.src = url;
  }

  return (
    <div className="space-y-2">
      {active ? (
        <div className="overflow-hidden rounded-xl border border-border bg-ink">
          <video
            ref={videoRef}
            className="aspect-video max-h-40 w-full object-cover"
            muted
            playsInline
          />
        </div>
      ) : null}
      <canvas ref={canvasRef} className="hidden" />
      {camError ? <p className="text-xs text-danger">{camError}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant={active ? "secondary" : "outline"} onClick={() => setActive((v) => !v)}>
          <Camera />
          {active ? t("qr.camOff") : t("qr.cam")}
        </Button>
        <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
          <ImageUp /> {t("qr.image")}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

export function FilePick({
  onRead,
  label,
}: {
  onRead: (text: string) => void;
  label?: string;
}) {
  const { t } = useT();
  const ref = useRef<HTMLInputElement>(null);
  const [name, setName] = useState<string | null>(null);
  return (
    <div className="flex items-center gap-2">
      <input
        ref={ref}
        type="file"
        accept=".txt,.json,.bsms,.desc,.miniscript,text/plain,application/json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          void f.text().then((text) => {
            setName(f.name);
            onRead(text);
          });
        }}
      />
      <Button type="button" variant="outline" size="sm" onClick={() => ref.current?.click()}>
        <FileUp />
        {label ?? t("import.file")}
      </Button>
      {name ? <span className="truncate font-mono text-2xs text-fg-muted">{name}</span> : null}
    </div>
  );
}
