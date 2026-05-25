import { useEffect, useState } from "react";
import wantedImg from "@/assets/wanted-poster.jpeg";
import operatorImg from "@/assets/operator.jpeg";
import scoutImg from "@/assets/scout.jpeg";

// ============================================================================
// PROTOCOL ZERO — Whitelist submission webhook
// Replace this placeholder with your Google Apps Script Web App URL.
// The script should accept POST { wallet, twitter, qtLink, friends, ts }
// as text/plain JSON (no-cors mode dodges preflight).
// ============================================================================
const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbxr2niQ2_whrwYzBa13AdRPEBDdEGjwC3yT8amzmxNL2jBgbQ7ecmp-WyQWoy2Rie9w/exec";

const TWITTER_PROFILE_URL = "https://x.com/RangoETH_";
const PINNED_TWEET_URL = "https://x.com/i/status/2058103735016919478";

type Status = "idle" | "loading" | "error" | "success";

function shortAddr(a: string) {
  return a.length > 10 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a;
}

export function ProtocolZero() {
  const [followed, setFollowed] = useState(false);
  const [twitter, setTwitter] = useState("");
  const [qtLink, setQtLink] = useState("");
  const [friends, setFriends] = useState("");
  const [wallet, setWallet] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleOk = /^@?[A-Za-z0-9_]{1,15}$/.test(twitter.trim());
  const qtOk = /^https?:\/\/(x|twitter)\.com\/.+\/status\/\d+/.test(qtLink.trim());
  const walletOk = /^0x[a-fA-F0-9]{40}$/.test(wallet.trim());
  const friendsOk = friends.trim().length > 0;
  const canSubmit = followed && handleOk && qtOk && friendsOk && walletOk;

  async function execute(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || status === "loading") return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const payload = {
        wallet: wallet.trim(),
        twitter: twitter.replace(/^@/, "").trim(),
        qtLink: qtLink.trim(),
        friends: friends.trim(),
        ts: new Date().toISOString(),
      };
      await fetch(WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Signal lost — try again.");
    }
  }

  if (status === "success") return <SuccessView wallet={wallet} twitter={twitter} />;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Decorative WANTED poster strip across the very top */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-44 opacity-60 mix-blend-multiply sm:h-56"
        style={{
          backgroundImage: `url(${wantedImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center 35%",
          maskImage: "linear-gradient(to bottom, black 30%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 30%, transparent 100%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-2xl px-5 py-8 sm:py-12">
        {/* Top bar — back chip + title */}
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="rounded-full bg-foreground px-4 py-2 font-display text-sm tracking-wide text-primary-foreground shadow-[3px_3px_0_0_rgba(0,0,0,0.25)] transition-transform hover:-translate-y-0.5"
          >
            ← BACK
          </button>
          <img
            src={operatorImg}
            alt="RangoEth operator"
            className="size-12 rounded-full border-[3px] border-foreground object-cover shadow-[3px_3px_0_0_rgba(0,0,0,0.35)] sm:size-14"
          />
        </div>

        <h1 className="mt-4 font-display text-5xl leading-[0.95] tracking-tight text-foreground drop-shadow-[2px_2px_0_rgba(255,240,200,0.45)] sm:text-6xl">
          APPLY
          <br />
          WHITELIST
        </h1>
        <p className="mt-3 max-w-md font-body text-[14px] text-foreground/75">
          RangoEth // 1,500 marked survivors. Complete every step to lock your slot in the
          final battalion.
        </p>

        {/* Card */}
        <form
          onSubmit={execute}
          className="relative mt-6 rounded-[2.25rem] border-[3px] border-foreground bg-card p-4 shadow-[8px_8px_0_0_rgba(24,15,8,0.85)] sm:p-6"
        >
          {/* corner stamp */}
          <div className="pointer-events-none absolute -right-3 -top-3 hidden rotate-12 rounded-md border-[2px] border-destructive bg-card px-2 py-1 font-display text-[11px] tracking-widest text-destructive sm:block">
            CLASSIFIED
          </div>

          <div className="space-y-4">
            {/* 0x01 — Follow */}
            <PillRow label="FOLLOW @RANGOETH">
              <a
                href={TWITTER_PROFILE_URL}
                target="_blank"
                rel="noreferrer"
                onClick={() => setFollowed(true)}
                className={`pill-input grid place-items-center font-display tracking-wide ${
                  followed ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground"
                }`}
              >
                {followed ? "Followed ✓" : "Follow"}
              </a>
            </PillRow>

            {/* 0x02 — Username (proof of follow) */}
            <PillRow label="X username">
              <input
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="@username"
                maxLength={32}
                className="pill-input bg-secondary text-foreground placeholder:text-foreground/40"
              />
            </PillRow>

            {/* 0x03 — QT pinned post */}
            <PillRow label={<>QT pinned post with<br />“rango is coming”</>}>
              <input
                value={qtLink}
                onChange={(e) => setQtLink(e.target.value)}
                placeholder="QT Link"
                className="pill-input bg-secondary text-foreground placeholder:text-foreground/40"
              />
            </PillRow>

            {/* 0x04 — friends comment */}
            <PillRow label={<>Tag 3 friends on<br />pinned post</>}>
              <input
                value={friends}
                onChange={(e) => setFriends(e.target.value)}
                placeholder="Comment link"
                className="pill-input bg-secondary text-foreground placeholder:text-foreground/40"
              />
            </PillRow>

            {/* 0x05 — wallet */}
            <PillRow label="SUBMIT EVM WALLET">
              <input
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                placeholder="0x........"
                maxLength={64}
                spellCheck={false}
                className="pill-input bg-secondary font-mono text-foreground placeholder:text-foreground/40"
              />
            </PillRow>

            {wallet.length > 0 && !walletOk && (
              <div className="ml-2 font-body text-[12px] text-destructive">
                Invalid EVM address.
              </div>
            )}

            {/* hint to QT pinned tweet */}
            <div className="flex flex-wrap items-center gap-2 px-2 font-body text-[12px] text-foreground/70">
              <span>Need the pinned post?</span>
              <a
                href={PINNED_TWEET_URL}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-foreground px-3 py-1 font-display text-[11px] tracking-wide text-primary-foreground"
              >
                Open it →
              </a>
            </div>
          </div>

          {/* Submit */}
          <div className="mt-6 flex justify-center">
            <button
              type="submit"
              disabled={!canSubmit || status === "loading"}
              className="rounded-full bg-foreground px-10 py-4 font-display text-xl tracking-[0.3em] text-primary-foreground shadow-[5px_5px_0_0_rgba(24,15,8,0.85)] transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              {status === "loading"
                ? "DECRYPTING…"
                : status === "error"
                  ? "RETRY"
                  : "SUBMIT"}
            </button>
          </div>

          {status === "error" && (
            <div className="mt-3 rounded-2xl border-[2px] border-destructive bg-destructive/10 px-4 py-2 text-center font-body text-[12px] text-destructive">
              {errorMsg}
            </div>
          )}
        </form>

        <div className="mt-5 flex items-center justify-between gap-3 px-1 font-body text-[11px] uppercase tracking-[0.25em] text-foreground/60">
          <span>© RangoEth</span>
          <img
            src={scoutImg}
            alt=""
            aria-hidden
            className="size-9 rounded-full border-[2px] border-foreground object-cover"
          />
          <span>Burn after reading</span>
        </div>
      </div>

      {/* shared pill input style */}
      <style>{`
        .pill-input {
          width: 100%;
          height: 3rem;
          border-radius: 9999px;
          border: 3px solid var(--color-foreground);
          padding: 0 1.25rem;
          font-family: var(--font-display);
          letter-spacing: 0.02em;
          font-size: 0.95rem;
          outline: none;
          transition: transform 0.1s ease;
        }
        .pill-input:focus { transform: translateY(-1px); }
        a.pill-input { text-decoration: none; }
      `}</style>
    </div>
  );
}

function PillRow({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border-[3px] border-foreground bg-foreground p-2 pl-5 pr-2 shadow-[3px_3px_0_0_rgba(24,15,8,0.4)]">
      <div className="flex-1 font-display text-[13px] uppercase leading-tight tracking-wide text-primary-foreground sm:text-[14px]">
        {label}
      </div>
      <div className="w-[44%] shrink-0 sm:w-[48%]">{children}</div>
    </div>
  );
}

function SuccessView({ wallet, twitter }: { wallet: string; twitter: string }) {
  const dossier = Math.floor(Math.random() * 1500).toString().padStart(4, "0");
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="relative z-10 mx-auto max-w-2xl px-5 py-10">
        <h1 className="font-display text-5xl leading-[0.95] tracking-tight text-foreground sm:text-6xl">
          WELCOME
          <br />
          SURVIVOR
        </h1>
        <p className="mt-2 max-w-md font-body text-[14px] text-foreground/75">
          Your dossier has been queued. Stand by for extraction signal.
        </p>

        <div className="mt-6 overflow-hidden rounded-[2rem] border-[3px] border-foreground bg-card shadow-[8px_8px_0_0_rgba(24,15,8,0.85)]">
          <img src={wantedImg} alt="WANTED — RangoEth" className="block w-full" />
          <div className="grid gap-3 p-4 sm:grid-cols-3">
            <Stat label="Wallet" value={shortAddr(wallet)} mono />
            <Stat label="Operator" value={`@${twitter.replace(/^@/, "")}`} />
            <Stat label="Dossier" value={`#${dossier}`} accent />
          </div>
        </div>

        <p className="mt-5 text-center font-body text-[12px] uppercase tracking-[0.3em] text-foreground/60">
          Transmission complete.
        </p>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  mono,
  accent,
}: {
  label: string;
  value: string;
  mono?: boolean;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border-[2px] border-foreground px-3 py-2 ${
        accent ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground"
      }`}
    >
      <div className="font-body text-[10px] uppercase tracking-[0.3em] opacity-70">{label}</div>
      <div className={`mt-0.5 break-all text-[13px] ${mono ? "font-mono" : "font-display"}`}>
        {value}
      </div>
    </div>
  );
}
