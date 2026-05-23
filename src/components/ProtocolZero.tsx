import { useEffect, useState } from "react";
import scoutImg from "@/assets/scout.jpeg";
import wantedImg from "@/assets/wanted-poster.jpeg";
import operatorImg from "@/assets/operator.jpeg";
import recruitImg from "@/assets/recruit.jpeg";

// ============================================================================
// PROTOCOL ZERO — Whitelist submission webhook
// Replace this placeholder with your Google Apps Script Web App URL.
// The script should accept POST { wallet, twitter, ts } as text/plain JSON.
// ============================================================================
const WEBHOOK_URL = "https://script.google.com/macros/s/REPLACE_WITH_YOUR_DEPLOYMENT_ID/exec";

// Developer node — swap with the real RangoEth X profile + pinned tweet.
const TWITTER_PROFILE_URL = "https://x.com/RangoEth";
const PINNED_TWEET_URL = "https://x.com/RangoEth/status/0000000000000000000";

type Status = "idle" | "loading" | "error" | "success";

function shortAddr(a: string) {
  return a.length > 10 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a;
}

export function ProtocolZero() {
  const [twitter, setTwitter] = useState("");
  const [followed, setFollowed] = useState(false);
  const [broadcasted, setBroadcasted] = useState(false);
  const [wallet, setWallet] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock(
        `${d.getUTCHours().toString().padStart(2, "0")}:${d
          .getUTCMinutes()
          .toString()
          .padStart(2, "0")}:${d.getUTCSeconds().toString().padStart(2, "0")} UTC`,
      );
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, []);

  const handleOk = /^@?[A-Za-z0-9_]{1,15}$/.test(twitter.trim());
  const walletOk = /^0x[a-fA-F0-9]{40}$/.test(wallet.trim());
  const canSubmit = handleOk && followed && broadcasted && walletOk;

  async function execute(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || status === "loading") return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const handle = twitter.replace(/^@/, "").trim();
      const payload = {
        wallet: wallet.trim(),
        twitter: handle,
        ts: new Date().toISOString(),
      };
      // Google Apps Script doPost — text/plain to dodge CORS preflight.
      await fetch(WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("[ SIGNAL LOST ]");
    }
  }

  if (status === "success") return <SuccessView wallet={wallet} twitter={twitter} />;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background image stack — desert + leather + candlelight */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.22] mix-blend-screen"
        style={{
          backgroundImage: `url(${recruitImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
          filter: "saturate(1.15) contrast(1.05)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 110%, rgba(10,5,20,0) 0%, rgba(10,5,20,0.85) 70%)",
        }}
      />
      <div className="pointer-events-none fixed inset-0 z-0 scanlines" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Top bar */}
        <header className="flex items-center justify-between border border-primary/40 bg-background/70 px-3 py-2 text-[11px] uppercase tracking-[0.2em] backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="size-2 bg-primary cursor-blink" />
            <span className="text-primary">PROTOCOL_ZERO</span>
            <span className="hidden text-muted-foreground sm:inline">// rangoeth.terminal</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="hidden text-destructive sm:inline">SECURE_CHANNEL</span>
            <span className="text-primary">{clock || "--:--:-- UTC"}</span>
          </div>
        </header>

        {/* Hero */}
        <section className="relative mt-3 grid gap-3 lg:grid-cols-12">
          {/* Operator PFP — upper corner */}
          <aside className="lg:col-span-4">
            <div className="relative grain border border-primary/60 bg-card/60 backdrop-blur">
              <div className="flex items-center justify-between border-b border-primary/30 px-2 py-1 text-[10px] uppercase tracking-[0.25em] text-primary">
                <span>OPERATOR // VERIFIED</span>
                <span className="flex items-center gap-1 text-destructive">
                  <span className="size-1.5 bg-destructive cursor-blink" /> LIVE
                </span>
              </div>
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={operatorImg}
                  alt="Verifying operator — RangoEth survivor"
                  className="h-full w-full object-cover contrast-110 saturate-[1.15]"
                />
                <div className="absolute inset-0 flicker bg-[radial-gradient(circle_at_30%_20%,transparent,rgba(0,0,0,0.55))]" />
                <div className="absolute bottom-2 left-2 right-2 flex justify-between text-[10px] uppercase tracking-widest text-primary">
                  <span>ID:R-0413</span>
                  <span>STATUS: ALIVE</span>
                </div>
              </div>
              <div className="border-t border-primary/30 p-3 text-[11px] leading-relaxed text-muted-foreground">
                <div className="mb-1 text-primary">// TRANSMISSION</div>
                <p>
                  We escaped the ambush. <span className="text-foreground">1,500</span> seats
                  remain in the final battalion. Burn the evidence after.
                </p>
              </div>
            </div>

            <img
              src={scoutImg}
              alt="Scout on watch"
              className="mt-3 hidden aspect-[4/3] w-full border border-primary/40 object-cover saturate-[1.2] lg:block"
            />
          </aside>

          {/* Center column */}
          <main className="lg:col-span-8">
            <div className="border border-primary/50 bg-background/70 backdrop-blur">
              {/* Window chrome */}
              <div className="flex items-center justify-between border-b border-primary/30 bg-background/60 px-3 py-2">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                  <span className="size-2 border border-destructive" />
                  <span className="size-2 border border-muted-foreground" />
                  <span className="size-2 border border-primary" />
                  <span className="ml-3">~/rangoeth/whitelist.sh</span>
                </div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-primary">v0.1.5</span>
              </div>

              {/* Hero text */}
              <div className="border-b border-primary/30 px-4 py-5 sm:px-6 sm:py-7">
                <div className="text-[10px] uppercase tracking-[0.4em] text-primary">
                  &gt; protocol_zero --init
                </div>
                <h1 className="mt-3 font-display text-3xl font-bold leading-[0.95] text-foreground sm:text-5xl">
                  RECRUITING THE
                  <br />
                  FINAL <span className="text-[oklch(0.78_0.18_55)]">BATTALION</span>
                  <span className="text-primary">_</span>
                </h1>
                <p className="mt-3 max-w-xl text-[12px] leading-relaxed text-muted-foreground sm:text-sm">
                  RangoEth // 1,500 marked survivors on Ethereum. Execute three directives to
                  claim a whitelist slot. No retries. No second drops.
                </p>

                {/* Metric chips */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-[10px] uppercase tracking-[0.25em]">
                  <Chip label="SUPPLY" value="1,500" tone="primary" />
                  <Chip label="CHAIN" value="ETHEREUM" tone="warm" />
                  <Chip label="MINT" value="TBA" tone="danger" />
                </div>
              </div>

              {/* Tasks */}
              <form onSubmit={execute}>
                <ol className="divide-y divide-primary/20">
                  {/* 0x01 — VERIFY IDENTITY */}
                  <TaskRow code="0x01" title="VERIFY IDENTITY" sub="Follow the official X account" done={followed && handleOk} current={!(followed && handleOk)}>
                    <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                      <input
                        value={twitter}
                        onChange={(e) => setTwitter(e.target.value)}
                        placeholder="@handle"
                        maxLength={32}
                        className="w-full border border-primary/50 bg-background/60 px-3 py-2 text-[12px] font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none sm:w-44"
                      />
                      <a
                        href={TWITTER_PROFILE_URL}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setFollowed(true)}
                        className="border border-primary px-3 py-2 text-center text-[11px] uppercase tracking-[0.25em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                      >
                        {followed ? "[ NETWORK SYNCED ]" : "[ SYNC WITH NETWORK ]"}
                      </a>
                    </div>
                  </TaskRow>

                  {/* 0x02 — SPREAD SIGNAL */}
                  <TaskRow code="0x02" title="SPREAD THE SIGNAL" sub="Quote-tweet the pinned announcement" done={broadcasted} current={followed && handleOk && !broadcasted}>
                    <a
                      href={PINNED_TWEET_URL}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setBroadcasted(true)}
                      className="inline-block border border-destructive px-3 py-2 text-[11px] uppercase tracking-[0.25em] text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
                    >
                      {broadcasted ? "[ SIGNAL TRANSMITTED ]" : "[ BROADCAST DISTRESS SIGNAL ]"}
                    </a>
                  </TaskRow>

                  {/* 0x03 — WALLET / FINAL */}
                  <li className="relative bg-primary/[0.04] px-4 py-5 sm:px-6">
                    <div className="absolute inset-y-0 left-0 w-[3px] bg-primary" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex size-7 items-center justify-center border border-primary text-[10px] text-primary">
                          03
                        </span>
                        <div>
                          <div className="text-[10px] uppercase tracking-[0.3em] text-primary">
                            0x03 // FINAL VERIFICATION
                          </div>
                          <div className="font-display text-sm font-bold uppercase tracking-[0.15em] text-foreground">
                            SECURE EXTRACTION CLEARANCE
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            Submit your EVM wallet to lock the slot
                          </div>
                        </div>
                      </div>
                      <span className="hidden text-[10px] uppercase tracking-[0.25em] text-destructive sm:inline">
                        ▮ HIGH RISK
                      </span>
                    </div>

                    <div className="mt-4">
                      <label className="mb-1 block text-[10px] uppercase tracking-[0.3em] text-primary">
                        &gt; wallet_address
                      </label>
                      <input
                        value={wallet}
                        onChange={(e) => setWallet(e.target.value)}
                        placeholder="0x..."
                        maxLength={64}
                        className="w-full border border-primary/60 bg-background/70 px-3 py-3 font-mono text-[13px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      />
                      {wallet.length > 0 && !walletOk && (
                        <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-destructive">
                          ▮ INVALID EVM ADDRESS
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={!canSubmit || status === "loading"}
                      className="mt-4 w-full border-2 border-primary bg-primary/10 px-4 py-4 text-center text-sm font-bold uppercase tracking-[0.4em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:border-border disabled:bg-transparent disabled:text-muted-foreground"
                    >
                      {status === "loading"
                        ? "[ DECRYPTING... ]"
                        : status === "error"
                          ? "[ RETRY EXECUTION ]"
                          : "[ EXECUTE REGISTRATION ]"}
                    </button>
                    {status === "error" && (
                      <div className="mt-2 border border-destructive bg-destructive/10 px-3 py-2 text-[11px] uppercase tracking-[0.25em] text-destructive">
                        {errorMsg || "[ SIGNAL LOST ]"} — RETRANSMIT
                      </div>
                    )}
                  </li>
                </ol>
              </form>

              {/* Footer log */}
              <div className="border-t border-primary/30 bg-background/60 px-3 py-2 font-mono text-[10px] leading-relaxed text-muted-foreground">
                <LogLine ok={handleOk}>auth :: identity</LogLine>
                <LogLine ok={followed}>net :: handshake</LogLine>
                <LogLine ok={broadcasted}>broadcast :: signal</LogLine>
                <LogLine ok={walletOk}>queue :: clearance</LogLine>
              </div>
            </div>
          </main>
        </section>

        <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 border border-primary/30 bg-background/60 px-3 py-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground backdrop-blur">
          <span>© RANGOETH // PROTOCOL ZERO</span>
          <span className="text-destructive">BURN AFTER READING</span>
        </footer>
      </div>
    </div>
  );
}

function Chip({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "primary" | "warm" | "danger";
}) {
  const toneCls =
    tone === "primary"
      ? "border-primary text-primary"
      : tone === "warm"
        ? "border-[oklch(0.78_0.18_55)] text-[oklch(0.85_0.16_70)]"
        : "border-destructive text-destructive";
  return (
    <div className={`border ${toneCls} bg-background/40 px-2 py-2 text-center`}>
      <div className="text-[9px] text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-display text-[12px] font-bold tracking-[0.15em]">{value}</div>
    </div>
  );
}

function TaskRow({
  code,
  title,
  sub,
  done,
  current,
  children,
}: {
  code: string;
  title: string;
  sub: string;
  done: boolean;
  current: boolean;
  children: React.ReactNode;
}) {
  return (
    <li
      className={`grid gap-3 px-4 py-4 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-6 sm:px-6 ${
        current ? "bg-primary/[0.03]" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex size-7 items-center justify-center border text-[10px] ${
            done
              ? "border-primary bg-primary text-primary-foreground"
              : current
                ? "border-primary text-primary"
                : "border-border text-muted-foreground"
          }`}
        >
          {done ? "✓" : code.slice(2)}
        </span>
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            {code}
          </div>
          <div className="font-display text-sm font-bold uppercase tracking-[0.15em] text-foreground">
            {title}
          </div>
          <div className="text-[11px] text-muted-foreground">{sub}</div>
        </div>
      </div>
      <div className="flex justify-start sm:justify-end">{children}</div>
    </li>
  );
}

function LogLine({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className={ok ? "text-primary" : "text-muted-foreground"}>
        {ok ? "[ OK ]" : "[ .. ]"}
      </span>
      <span>{children}</span>
    </div>
  );
}

function SuccessView({ wallet, twitter }: { wallet: string; twitter: string }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed inset-0 z-0 scanlines" />
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-10">
        <div className="mb-3 flex items-center justify-between border border-primary bg-background/70 px-3 py-2 text-[11px] uppercase tracking-[0.25em] text-primary backdrop-blur">
          <span className="flex items-center gap-2">
            <span className="size-2 bg-primary cursor-blink" /> CLEARANCE GRANTED
          </span>
          <span className="text-muted-foreground">
            DOSSIER #{Math.floor(Math.random() * 1500).toString().padStart(4, "0")}
          </span>
        </div>

        <div className="grain relative border border-primary/50 bg-card/40">
          <img src={wantedImg} alt="WANTED — RangoEth" className="block w-full" />
          <div className="absolute inset-0 flicker bg-[radial-gradient(circle_at_50%_30%,transparent,rgba(0,0,0,0.45))]" />
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="border border-primary/40 bg-background/60 p-3 backdrop-blur">
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">WALLET</div>
            <div className="mt-1 break-all font-mono text-[12px] text-foreground">{shortAddr(wallet)}</div>
          </div>
          <div className="border border-primary/40 bg-background/60 p-3 backdrop-blur">
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">OPERATOR</div>
            <div className="mt-1 text-[12px] text-foreground">@{twitter.replace(/^@/, "")}</div>
          </div>
          <div className="border border-primary bg-primary/10 p-3 backdrop-blur">
            <div className="text-[10px] uppercase tracking-[0.3em] text-primary">STATUS</div>
            <div className="mt-1 text-[12px] text-primary">QUEUED // BATTALION</div>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          &gt; transmission complete. stand by for the drop_<span className="cursor-blink">▮</span>
        </p>
      </div>
    </div>
  );
}