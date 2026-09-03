import { useEffect, useMemo, useState } from "react";
import { compileBip388 } from "@/lib/miniscript/bip388";
import { defaultAccountPath, detectHid, type HwKind } from "@/lib/hw";
import { useHardware } from "@/store/hardware";
import { useStudio } from "@/store/studio";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/lib/use-t";
import { localizeMessage } from "@/lib/i18n";
import { Usb } from "lucide-react";
import { toast } from "sonner";

export function HardwareButton() {
  const { t } = useT();
  const open = useHardware((s) => s.open);
  const setOpen = useHardware((s) => s.setOpen);
  const status = useHardware((s) => s.status);
  const ready = status === "ready" || status === "busy";

  useEffect(() => {
    useHardware.setState({ hid: detectHid() });
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="relative size-9" aria-label={t("header.usb")} aria-pressed={ready}>
          <Usb />
          {ready ? <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-ok" aria-hidden /> : null}
        </Button>
      </DialogTrigger>
      <HardwareDialogBody />
    </Dialog>
  );
}

function HardwareDialogBody() {
  const { t, locale } = useT();
  const status = useHardware((s) => s.status);
  const kind = useHardware((s) => s.kind);
  const demo = useHardware((s) => s.demo);
  const label = useHardware((s) => s.label);
  const fingerprint = useHardware((s) => s.fingerprint);
  const pairingCode = useHardware((s) => s.pairingCode);
  const error = useHardware((s) => s.error);
  const hid = useHardware((s) => s.hid);
  const pendingKeyId = useHardware((s) => s.pendingKeyId);
  const lastHmac = useHardware((s) => s.lastHmac);
  const connect = useHardware((s) => s.connect);
  const disconnect = useHardware((s) => s.disconnect);
  const fillKey = useHardware((s) => s.fillKey);
  const registerPolicy = useHardware((s) => s.registerPolicy);
  const keys = useStudio((s) => s.keys);
  const root = useStudio((s) => s.root);
  const network = useStudio((s) => s.network);
  const reuseKeys = useStudio((s) => s.reuseKeys);
  const dialogOpen = useHardware((s) => s.open);
  const [path, setPath] = useState(defaultAccountPath(network));
  const [busyAction, setBusyAction] = useState<string | null>(null);

  useEffect(() => {
    setPath(defaultAccountPath(network));
  }, [network]);

  const pending = keys.find((k) => k.id === pendingKeyId) ?? null;
  const bip = useMemo(
    () => (dialogOpen && root ? compileBip388(root, keys, "Scriptwerk", reuseKeys) : null),
    [dialogOpen, root, keys, reuseKeys],
  );
  const ready = status === "ready" || status === "busy";
  const errText = error ? localizeMessage(locale, error) : null;

  async function run(fn: () => Promise<void>) {
    setBusyAction("1");
    try {
      await fn();
    } catch (err) {
      const msg = localizeMessage(locale, err instanceof Error ? err.message : "hw.err.generic");
      toast.error(msg);
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <DialogContent className="max-h-[min(720px,calc(100dvh-2rem))] w-[min(520px,calc(100vw-1.5rem))] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{t("hw.title")}</DialogTitle>
        <DialogDescription>{t("hw.blurb")}</DialogDescription>
      </DialogHeader>

      {hid === "missing" ? <p className="text-xs text-warn">{t("hw.needChrome")}</p> : null}
      {hid === "iframe" ? <p className="text-xs text-warn">{t("hw.iframe")}</p> : null}

      {!ready ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <DeviceCard
            title={t("export.ledger")}
            hint={t("hw.ledgerHint")}
            disabled={status === "picking" || status === "connecting" || status === "pairing"}
            onUsb={() =>
              run(async () => {
                await connect("ledger", false);
                toast.success(t("hw.connected"));
              })
            }
            onDemo={() =>
              run(async () => {
                await connect("ledger", true);
                toast.success(t("hw.demoOn"));
              })
            }
          />
          <DeviceCard
            title={t("export.bitbox")}
            hint={t("hw.bitboxHint")}
            disabled={status === "picking" || status === "connecting" || status === "pairing"}
            onUsb={() =>
              run(async () => {
                await connect("bitbox", false);
                toast.success(t("hw.connected"));
              })
            }
            onDemo={() =>
              run(async () => {
                await connect("bitbox", true);
                toast.success(t("hw.demoOn"));
              })
            }
          />
        </div>
      ) : null}

      {status === "pairing" && pairingCode ? (
        <div className="rounded-xl border border-border-strong bg-surface px-4 py-5 text-center">
          <p className="text-2xs tracking-[0.14em] text-fg-subtle uppercase">{t("hw.pairing")}</p>
          <p className="mt-2 font-mono text-3xl tracking-[0.3em] text-fg">{pairingCode}</p>
          <p className="mt-2 text-xs text-fg-muted">{t("hw.pairingBlurb")}</p>
        </div>
      ) : null}

      {status === "picking" || status === "connecting" ? (
        <p className="text-sm text-fg-muted">{kind === "ledger" ? t("hw.waitLedger") : t("hw.waitBitbox")}</p>
      ) : null}

      {errText ? <p className="text-xs text-danger">{errText}</p> : null}

      {ready && kind ? (
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-surface px-3 py-2.5">
            <p className="text-sm text-fg">
              {label}
              {demo ? <span className="ml-2 text-2xs text-fg-subtle uppercase">{t("hw.demo")}</span> : null}
            </p>
            <p className="font-mono text-2xs text-fg-muted">{fingerprint || "—"}</p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="hw-path">{t("keys.bip32")}</Label>
            <Input
              id="hw-path"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              className="font-mono text-xs"
            />
          </div>

          {pending ? <p className="text-xs text-fg-muted">{t("hw.pendingKey", { name: pending.name })}</p> : null}

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              disabled={Boolean(busyAction)}
              onClick={() =>
                run(async () => {
                  const target = pending ?? keys.find((k) => !k.xpub.trim()) ?? keys[0];
                  if (!target) {
                    toast.error(t("keys.empty"));
                    return;
                  }
                  await fillKey(target.id, path);
                  toast.success(t("keys.taken", { name: target.name }));
                })
              }
            >
              {t("hw.fetchKey")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={Boolean(busyAction) || !bip?.ok}
              onClick={() =>
                run(async () => {
                  if (!bip?.ok) {
                    toast.error(bip?.error ?? t("export.none"));
                    return;
                  }
                  await registerPolicy(bip.policy);
                  toast.success(t("hw.registered"));
                })
              }
            >
              {t("hw.register")}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => void disconnect()}>
              {t("hw.disconnect")}
            </Button>
          </div>
          {lastHmac && lastHmac !== "ok" && lastHmac !== "demo" ? (
            <p className="font-mono text-2xs break-all text-fg-subtle">HMAC {lastHmac}</p>
          ) : null}
          <p className="text-2xs text-fg-subtle">{t("hw.registerHint")}</p>
        </div>
      ) : null}
    </DialogContent>
  );
}

function DeviceCard({
  title,
  hint,
  disabled,
  onUsb,
  onDemo,
}: {
  title: string;
  hint: string;
  disabled: boolean;
  onUsb: () => void;
  onDemo: () => void;
}) {
  const { t } = useT();
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-3">
      <p className="text-sm text-fg">{title}</p>
      <p className="text-2xs text-pretty text-fg-muted">{hint}</p>
      <Button size="sm" disabled={disabled} onClick={onUsb}>
        <Usb /> {t("hw.connectUsb")}
      </Button>
      <Button size="sm" variant="ghost" disabled={disabled} onClick={onDemo}>
        {t("hw.connectDemo")}
      </Button>
    </div>
  );
}

export function useHwFillKey(keyId: string, onOrigin?: (origin: string) => void) {
  const { t, locale } = useT();
  const setOpen = useHardware((s) => s.setOpen);
  const setPendingKey = useHardware((s) => s.setPendingKey);
  const fillKey = useHardware((s) => s.fillKey);
  const fetchXpub = useHardware((s) => s.fetchXpub);
  const sessionKind = useHardware((s) => s.kind);
  const status = useHardware((s) => s.status);

  return async (kind: HwKind, path?: string) => {
    setPendingKey(keyId);
    if (status === "ready" && sessionKind === kind) {
      try {
        if (onOrigin) {
          const result = await fetchXpub(path);
          onOrigin(result.origin);
          return;
        }
        await fillKey(keyId, path);
        toast.success(t("keys.taken", { name: useStudio.getState().keys.find((k) => k.id === keyId)?.name ?? "" }));
      } catch (err) {
        toast.error(localizeMessage(locale, err instanceof Error ? err.message : "hw.err.generic"));
      }
      return;
    }
    setOpen(true);
  };
}
