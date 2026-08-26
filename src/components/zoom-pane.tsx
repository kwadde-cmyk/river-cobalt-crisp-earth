import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Maximize2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/use-t";

const MIN_K = 0.18;
const MAX_K = 3.5;

type View = { x: number; y: number; k: number };

export function ZoomPane({
  contentWidth,
  contentHeight,
  selectedRect,
  children,
}: {
  contentWidth: number;
  contentHeight: number;
  selectedRect?: { x: number; y: number; w: number; h: number } | null;
  children: React.ReactNode;
}) {
  const { t } = useT();
  const viewportRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<View>({ x: 0, y: 0, k: 1 });
  const [view, setView] = useState<View>({ x: 0, y: 0, k: 1 });
  const dragRef = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);
  const pinchRef = useRef<{
    a: number;
    b: number;
    dist: number;
    midX: number;
    midY: number;
    k: number;
  } | null>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const [grabbing, setGrabbing] = useState(false);

  const apply = useCallback((next: View) => {
    const k = Math.min(MAX_K, Math.max(MIN_K, next.k));
    const v = { x: next.x, y: next.y, k };
    viewRef.current = v;
    setView(v);
  }, []);

  const fit = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const pad = 28;
    const vw = Math.max(1, el.clientWidth - pad * 2);
    const vh = Math.max(1, el.clientHeight - pad * 2);
    const k = Math.min(1.15, Math.max(MIN_K, Math.min(vw / contentWidth, vh / contentHeight)));
    apply({
      k,
      x: (el.clientWidth - contentWidth * k) / 2,
      y: (el.clientHeight - contentHeight * k) / 2,
    });
  }, [apply, contentWidth, contentHeight]);

  useEffect(() => {
    fit();
  }, [fit]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => fit());
    ro.observe(el);
    return () => ro.disconnect();
  }, [fit]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const cur = viewRef.current;
      const factor = Math.exp(-e.deltaY * 0.0015);
      const nextK = Math.min(MAX_K, Math.max(MIN_K, cur.k * factor));
      const ratio = nextK / cur.k;
      apply({
        k: nextK,
        x: mx - (mx - cur.x) * ratio,
        y: my - (my - cur.y) * ratio,
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [apply]);

  useEffect(() => {
    if (!selectedRect) return;
    const el = viewportRef.current;
    if (!el) return;
    const cur = viewRef.current;
    const sx = selectedRect.x * cur.k + cur.x;
    const sy = selectedRect.y * cur.k + cur.y;
    const sw = selectedRect.w * cur.k;
    const sh = selectedRect.h * cur.k;
    const pad = 20;
    let nx = cur.x;
    let ny = cur.y;
    if (sx < pad) nx += pad - sx;
    if (sy < pad) ny += pad - sy;
    if (sx + sw > el.clientWidth - pad) nx -= sx + sw - (el.clientWidth - pad);
    if (sy + sh > el.clientHeight - pad) ny -= sy + sh - (el.clientHeight - pad);
    if (nx !== cur.x || ny !== cur.y) apply({ ...cur, x: nx, y: ny });
  }, [selectedRect, apply]);

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointersRef.current.size === 2) {
      const pts = [...pointersRef.current.values()];
      const dx = pts[0]!.x - pts[1]!.x;
      const dy = pts[0]!.y - pts[1]!.y;
      const ids = [...pointersRef.current.keys()];
      pinchRef.current = {
        a: ids[0]!,
        b: ids[1]!,
        dist: Math.hypot(dx, dy) || 1,
        midX: (pts[0]!.x + pts[1]!.x) / 2,
        midY: (pts[0]!.y + pts[1]!.y) / 2,
        k: viewRef.current.k,
      };
      dragRef.current = null;
      return;
    }
    dragRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (pointersRef.current.has(e.pointerId)) {
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }
    const pinch = pinchRef.current;
    if (pinch && pointersRef.current.size >= 2) {
      const a = pointersRef.current.get(pinch.a);
      const b = pointersRef.current.get(pinch.b);
      if (a && b) {
        const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
        const nextK = Math.min(MAX_K, Math.max(MIN_K, pinch.k * (dist / pinch.dist)));
        const el = viewportRef.current;
        if (el) {
          const rect = el.getBoundingClientRect();
          const mx = (a.x + b.x) / 2 - rect.left;
          const my = (a.y + b.y) / 2 - rect.top;
          const cur = viewRef.current;
          const ratio = nextK / cur.k;
          apply({
            k: nextK,
            x: mx - (mx - cur.x) * ratio,
            y: my - (my - cur.y) * ratio,
          });
        }
      }
      return;
    }
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < 5) return;
    if (!d.moved) {
      d.moved = true;
      setGrabbing(true);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
    d.x = e.clientX;
    d.y = e.clientY;
    const cur = viewRef.current;
    apply({ ...cur, x: cur.x + dx, y: cur.y + dy });
  }

  function endPointer(e: ReactPointerEvent<HTMLDivElement>) {
    pointersRef.current.delete(e.pointerId);
    if (pinchRef.current && (e.pointerId === pinchRef.current.a || e.pointerId === pinchRef.current.b)) {
      pinchRef.current = null;
    }
    if (dragRef.current?.id === e.pointerId) {
      dragRef.current = null;
      setGrabbing(false);
    }
  }

  function zoomBy(factor: number) {
    const el = viewportRef.current;
    if (!el) return;
    const cur = viewRef.current;
    const nextK = Math.min(MAX_K, Math.max(MIN_K, cur.k * factor));
    const mx = el.clientWidth / 2;
    const my = el.clientHeight / 2;
    const ratio = nextK / cur.k;
    apply({
      k: nextK,
      x: mx - (mx - cur.x) * ratio,
      y: my - (my - cur.y) * ratio,
    });
  }

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden">
      <div
        ref={viewportRef}
        data-zoom-pane
        className={`absolute inset-0 overflow-hidden ${grabbing ? "cursor-grabbing" : "cursor-grab"}`}
        style={{ touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
      >
        <div
          style={{
            width: contentWidth,
            height: contentHeight,
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})`,
            transformOrigin: "0 0",
            willChange: "transform",
          }}
        >
          {children}
        </div>
      </div>
      <div className="absolute right-3 bottom-3 z-10 flex gap-1">
        <Button type="button" variant="outline" size="icon" className="size-9" onClick={fit} aria-label={t("graph.fit")}>
          <Maximize2 />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9"
          onClick={() => zoomBy(1 / 1.2)}
          aria-label={t("graph.zoomOut")}
        >
          <Minus />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9"
          onClick={() => zoomBy(1.2)}
          aria-label={t("graph.zoomIn")}
        >
          <Plus />
        </Button>
      </div>
    </div>
  );
}
