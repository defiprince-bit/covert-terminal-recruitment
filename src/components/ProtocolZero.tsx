import { useEffect, useState } from "react";
import scoutImg from "@/assets/scout.jpeg";
import wantedImg from "@/assets/wanted-poster.jpeg";
import operatorImg from "@/assets/operator.jpeg";
import recruitImg from "@/assets/recruit.jpeg";

// ============================================================================
// PROTOCOL ZERO — Whitelist submission webhook
// Replace this placeholder with your Google Apps Script Web App URL.
// The script should accept a POST with JSON: { wallet, twitter, quoteTweetUrl, ts }
// ============================================================================
const WEBHOOK_URL = "https://script.google.com/macros/s/REPLACE_WITH_YOUR_DEPLOYMENT_ID/exec";

type Status = "idle" | "loading" | "error" | "success";

const TASKS = [
  { id: 1, code: "0x01", title: "ESTABLISH COMMS", sub: "Connect EVM Wallet" },
  { id: 2, code: "0x02", title: "VERIFY IDENTITY", sub: "Follow @RangoEth on X" },
  { id: 3, code: "0x03", title: "SPREAD THE SIGNAL", sub: "Quote-tweet the pinned post" },
  { id: 4, code: "0x04", title: "SECURE CLEARANCE", sub: "Submit dossier" },
] as const;

function shortAddr(a: string) {
  return a.length > 10 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a;
}

export function ProtocolZero() {
  const [wallet, setWallet] = useState<string>("");
  const [twitter, setTwitter] = useState<string>("");
  const [quoteUrl, setQuoteUrl] = useState<string>("");
  const [followed, setFollowed] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [clock, setClock] = useState<string>("");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock(d.toUTCString().split(" ").slice(-2).join(" "));
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, []);

  async function connectWallet() {
    setErrorMsg("");
    const eth = (window as unknown as { ethereum?: { request: (a: { method: string }) => Promise<string[]> } }).ethereum;
    if (!eth) {
      setErrorMsg("NO EVM PROVIDER DETECTED");
      return;
    }
    try {
      const accounts = await eth.request({ method: "eth_requestAccounts" });
      if (accounts?.[0]) setWallet(accounts[0]);
    } catch {
      setErrorMsg("HANDSHAKE REJECTED");
    }
  }

  const t1 = !!wallet;
  const t2 = followed;
  const t3 = /^https?:\/\/(x|twitter)\.com\/.+\/status\/\d+/i.test(quoteUrl);
  const t4Ready = t1 && t2 && t3 && twitter.trim().length > 0;

  async function execute() {
    if (!t4Ready || status === "loading") return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const handle = twitter.replace(/^@/, "").trim();
      const payload = {
        wallet,
        twitter: handle,
        quoteTweetUrl: quoteUrl,
        ts: new Date().toISOString(),
      };
      // Google Apps Script doPost — using text/plain to avoid preflight CORS.
      await fetch(WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("SIGNAL LOST");
    }
  }

  if (status === "success") return <SuccessView wallet={wallet} twitter={twitter} />;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed inset-0 scanlines z-0" />
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Top bar */}
        <header className="flex items-center justify-between border border-border bg-card/60 px-3 py-2 text-[11px] uppercase tracking-[0.2em]">
          <div className="flex items-center gap-2">
            <span className="size-2 bg-primary cursor-blink" />
            <span className="text-primary">PROTOCOL_ZERO</span>
            <span className="hidden text-muted-foreground sm:inline">// rangoeth.terminal</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="hidden sm:inline">SECURE_CHANNEL</span>
            <span className="text-primary">{clock || "--:-- UTC"}</span>
          </div>
        </header>

        <div className="mt-3 grid gap-3 lg:grid-cols-12">
          {/* LEFT — Security feed */}
          <aside className="lg:col-span-4 flex flex-col gap-3">
            <div className="relative grain border border-border bg-card/40">
              <div className="flex items-center justify-between border-b border-border px-2 py-1 text-[10px] uppercase tracking-[0.25em] text-primary">
                <span>CAM_01 / SCOUT</span>
                <span className="flex items-center gap-1 text-destructive">
                  <span className="size-1.5 bg-destructive cursor-blink" /> REC
                </span>
              </div>
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={scoutImg}
                  alt="Scout — RangoEth survivor on watch"
                  className="h-full w-full object-cover grayscale-[0.15] contrast-110"
                />
                <div className="absolute inset-0 flicker bg-[radial-gradient(circle_at_30%_20%,transparent,rgba(0,0,0,0.55))]" />
                <div className="absolute bottom-2 left-2 right-2 flex justify-between text-[10px] uppercase tracking-widest text-primary">
                  <span>ID:R-0413</span>
                  <span>STATUS: ALIVE</span>
                </div>
              </div>
            </div>

            <div className="border border-border bg-card/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
              <div className="mb-2 text-primary">// TRANSMISSION</div>
              <p>
                We escaped the ambush. <span className="text-foreground">1,500</span> seats remain in the
                final battalion. This terminal recruits operators worth their salt. Complete the four
                directives. Burn the evidence after.
              </p>
            </div>
          </aside>

          {/* CENTER — Terminal */}
          <main className="lg:col-span-8">
            <div className="border border-border bg-card/60">
              {/* Window chrome */}
              <div className="flex items-center justify-between border-b border-border bg-background/40 px-3 py-2">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                  <span className="size-2 border border-destructive" />
                  <span className="size-2 border border-muted-foreground" />
                  <span className="size-2 border border-primary" />
                  <span className="ml-3">~/rangoeth/whitelist.sh</span>
                </div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-primary">v0.1.5</span>
              </div>

              {/* Hero ascii */}
              <div className="border-b border-border px-4 py-5 sm:px-6 sm:py-7">
                <div className="text-[10px] uppercase tracking-[0.4em] text-primary">
                  &gt; protocol_zero --init
                </div>
                <h1 className="mt-3 font-display text-3xl font-bold leading-[0.95] text-foreground sm:text-5xl">
                  RECRUITING THE
                  <br />
                  FINAL BATTALION<span className="text-primary">_</span>
                </h1>
                <p className="mt-3 max-w-xl text-[12px] leading-relaxed text-muted-foreground sm:text-sm">
                  RangoEth // 1,500 marked survivors on Ethereum. Execute four directives to claim a
                  whitelist slot. No retries. No second drops.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.25em]">
                  <span className="border border-border px-2 py-1 text-muted-foreground">SUPPLY 1,500</span>
                  <span className="border border-border px-2 py-1 text-muted-foreground">CHAIN ETH</span>
                  <span className="border border-primary px-2 py-1 text-primary">MINT TBA</span>
                </div>
              </div>

              {/* Tasks */}
              <ol className="divide-y divide-border">
                <TaskRow
                  task={TASKS[0]}
                  done={t1}
                  current={!t1}
                >
                  <button
                    onClick={connectWallet}
                    className="border border-primary bg-transparent px-3 py-2 text-[11px] uppercase tracking-[0.25em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    {t1 ? `[ ${shortAddr(wallet)} ]` : "[ CONNECT WALLET ]"}
                  </button>
                </TaskRow>

                <TaskRow task={TASKS[1]} done={t2} current={t1 && !t2}>
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href="https://x.com/intent/follow?screen_name=RangoEth"
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setFollowed(true)}
                      className="border border-primary px-3 py-2 text-[11px] uppercase tracking-[0.25em] text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      [ OPEN /X/RANGOETH ]
                    </a>
                    <input
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      placeholder="@handle"
                      className="w-40 border border-border bg-input px-3 py-2 text-[12px] font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </TaskRow>

                <TaskRow task={TASKS[2]} done={t3} current={t2 && !t3}>
                  <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
                    <a
                      href="https://x.com/RangoEth"
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 border border-border px-3 py-2 text-[11px] uppercase tracking-[0.25em] text-foreground hover:border-primary hover:text-primary"
                    >
                      [ FIND PINNED ]
                    </a>
                    <input
                      value={quoteUrl}
                      onChange={(e) => setQuoteUrl(e.target.value)}
                      placeholder="https://x.com/yourhandle/status/..."
                      className="flex-1 border border-border bg-input px-3 py-2 text-[12px] font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </TaskRow>

                <TaskRow task={TASKS[3]} done={false} current={t4Ready}>
                  <div className="flex flex-col gap-2">
                    <button
                      disabled={!t4Ready || status === "loading"}
                      onClick={execute}
                      className="group relative w-full border border-primary bg-primary/0 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.4em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:border-border disabled:text-muted-foreground sm:w-auto"
                    >
                      {status === "loading"
                        ? "[ DECRYPTING... ]"
                        : status === "error"
                          ? "[ RETRY EXECUTE ]"
                          : "[ EXECUTE ]"}
                    </button>
                    {status === "error" && (
                      <div className="border border-destructive bg-destructive/10 px-3 py-2 text-[11px] uppercase tracking-[0.25em] text-destructive">
                        ▮ {errorMsg || "SIGNAL LOST"} — RETRANSMIT
                      </div>
                    )}
                    {errorMsg && status !== "error" && (
                      <div className="text-[11px] uppercase tracking-[0.25em] text-destructive">
                        ▮ {errorMsg}
                      </div>
                    )}
                  </div>
                </TaskRow>
              </ol>

              {/* Footer log */}
              <div className="border-t border-border bg-background/40 px-3 py-2 font-mono text-[10px] leading-relaxed text-muted-foreground">
                <LogLine ok={t1}>handshake :: wallet</LogLine>
                <LogLine ok={t2}>auth :: identity</LogLine>
                <LogLine ok={t3}>broadcast :: signal</LogLine>
                <LogLine ok={t4Ready}>queue :: clearance</LogLine>
              </div>
            </div>
          </main>
        </div>

        <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 border border-border bg-card/40 px-3 py-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          <span>© RANGOETH // PROTOCOL ZERO</span>
          <span>BURN AFTER READING</span>
        </footer>
      </div>
    </div>
  );
}

function TaskRow({
  task,
  done,
  current,
  children,
}: {
  task: (typeof TASKS)[number];
  done: boolean;
  current: boolean;
  children: React.ReactNode;
}) {
  return (
    <li
      className={`grid gap-3 px-4 py-4 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-6 sm:px-6 ${
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
          {done ? "✓" : task.code.slice(2)}
        </span>
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            {task.code}
          </div>
          <div className="font-display text-sm font-bold uppercase tracking-[0.15em] text-foreground">
            {task.title}
          </div>
          <div className="text-[11px] text-muted-foreground">{task.sub}</div>
        </div>
      </div>
      <div className="hidden h-px bg-border sm:block" />
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
      <div className="pointer-events-none fixed inset-0 scanlines z-0" />
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-10">
        <div className="mb-3 flex items-center justify-between border border-border bg-card/60 px-3 py-2 text-[11px] uppercase tracking-[0.25em] text-primary">
          <span className="flex items-center gap-2">
            <span className="size-2 bg-primary cursor-blink" /> CLEARANCE GRANTED
          </span>
          <span className="text-muted-foreground">DOSSIER #{Math.floor(Math.random() * 1500).toString().padStart(4, "0")}</span>
        </div>

        <div className="grain relative border border-border bg-card/40">
          <img src={wantedImg} alt="WANTED — RangoEth" className="block w-full" />
          <div className="absolute inset-0 flicker bg-[radial-gradient(circle_at_50%_30%,transparent,rgba(0,0,0,0.45))]" />
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="border border-border bg-card/40 p-3">
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">WALLET</div>
            <div className="mt-1 break-all text-[12px] text-foreground">{wallet}</div>
          </div>
          <div className="border border-border bg-card/40 p-3">
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">OPERATOR</div>
            <div className="mt-1 text-[12px] text-foreground">@{twitter.replace(/^@/, "")}</div>
          </div>
          <div className="border border-primary bg-primary/10 p-3">
            <div className="text-[10px] uppercase tracking-[0.3em] text-primary">STATUS</div>
            <div className="mt-1 text-[12px] text-primary">QUEUED // BATTALION</div>
          </div>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <img src={operatorImg} alt="Operator" className="aspect-square w-full border border-border object-cover grayscale-[0.1]" />
          <img src={recruitImg} alt="Recruit" className="aspect-square w-full border border-border object-cover grayscale-[0.1]" />
        </div>

        <p className="mt-4 text-center text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          &gt; transmission complete. stand by for the drop_<span className="cursor-blink">▮</span>
        </p>
      </div>
    </div>
  );
}