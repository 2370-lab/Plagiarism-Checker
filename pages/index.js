import { useState, useRef } from "react";
import Head from "next/head";

const ScoreRing = ({ score, color, size = 120 }) => {
  const radius = (size - 16) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1a1a25" strokeWidth="8" />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={color} strokeWidth="8"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)" }}
      />
    </svg>
  );
};

const verdictConfig = {
  "LIKELY ORIGINAL": { color: "#10b981", bg: "#10b98120", icon: "✓" },
  "POSSIBLY PLAGIARIZED": { color: "#f59e0b", bg: "#f59e0b20", icon: "⚠" },
  "LIKELY PLAGIARIZED": { color: "#ef4444", bg: "#ef444420", icon: "✗" },
  "NO PLAGIARISM": { color: "#10b981", bg: "#10b98120", icon: "✓" },
  "POSSIBLE PLAGIARISM": { color: "#f59e0b", bg: "#f59e0b20", icon: "⚠" },
  "CONFIRMED PLAGIARISM": { color: "#ef4444", bg: "#ef444420", icon: "✗" },
};

export default function Home() {
  const [mode, setMode] = useState("single");
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const resultsRef = useRef(null);

  const wordCount = (t) => t.trim() ? t.trim().split(/\s+/).length : 0;

  const handleCheck = async () => {
    if (!text1.trim()) return;
    if (mode === "compare" && !text2.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text1, text2, mode }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (e) {
      setError(e.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const mainScore = result
    ? mode === "single"
      ? result.plagiarismScore
      : result.similarityScore
    : 0;

  const scoreColor =
    mainScore >= 70 ? "#ef4444" : mainScore >= 40 ? "#f59e0b" : "#10b981";

  const vconf = result?.verdict ? verdictConfig[result.verdict] : null;

  return (
    <>
      <Head>
        <title>PlagScan — AI Plagiarism Detector</title>
        <meta name="description" content="Advanced AI-powered plagiarism checker" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={styles.page}>
        {/* Background Grid */}
        <div style={styles.gridBg} />

        {/* Header */}
        <header style={styles.header}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>⬡</span>
            <span style={styles.logoText}>PlagScan</span>
          </div>
          <div style={styles.tagline}>AI-Powered Originality Analysis</div>
        </header>

        {/* Hero */}
        <section style={styles.hero}>
          <div style={styles.heroLabel}>POWERED BY CLAUDE AI</div>
          <h1 style={styles.heroTitle}>
            Detect Plagiarism<br />
            <span style={styles.heroAccent}>Instantly & Accurately</span>
          </h1>
          <p style={styles.heroSub}>
            Paste any text to analyze for originality, writing inconsistencies,<br />
            and potential copied content using advanced AI detection.
          </p>
        </section>

        {/* Mode Toggle */}
        <div style={styles.modeRow}>
          <button
            onClick={() => { setMode("single"); setResult(null); }}
            style={{ ...styles.modeBtn, ...(mode === "single" ? styles.modeBtnActive : {}) }}
          >
            <span>◈</span> Single Text Analysis
          </button>
          <button
            onClick={() => { setMode("compare"); setResult(null); }}
            style={{ ...styles.modeBtn, ...(mode === "compare" ? styles.modeBtnActive : {}) }}
          >
            <span>⇄</span> Compare Two Texts
          </button>
        </div>

        {/* Input Area */}
        <div style={styles.inputSection}>
          <div style={styles.textareaWrapper}>
            <div style={styles.textareaLabel}>
              {mode === "compare" ? "TEXT A — Source / Reference" : "YOUR TEXT"}
              <span style={styles.wordCount}>{wordCount(text1)} words</span>
            </div>
            <textarea
              style={styles.textarea}
              placeholder={mode === "single"
                ? "Paste the text you want to check for plagiarism..."
                : "Paste the original / reference text here..."
              }
              value={text1}
              onChange={(e) => setText1(e.target.value)}
              rows={10}
            />
          </div>

          {mode === "compare" && (
            <div style={styles.textareaWrapper}>
              <div style={styles.textareaLabel}>
                TEXT B — Submission / Comparison
                <span style={styles.wordCount}>{wordCount(text2)} words</span>
              </div>
              <textarea
                style={styles.textarea}
                placeholder="Paste the text to check against Text A..."
                value={text2}
                onChange={(e) => setText2(e.target.value)}
                rows={10}
              />
            </div>
          )}
        </div>

        {/* CTA */}
        <div style={styles.ctaRow}>
          <button
            onClick={handleCheck}
            disabled={loading || !text1.trim() || (mode === "compare" && !text2.trim())}
            style={{
              ...styles.checkBtn,
              ...(loading || !text1.trim() ? styles.checkBtnDisabled : {}),
            }}
          >
            {loading ? (
              <span style={styles.spinnerWrap}>
                <span style={styles.spinner} /> Analyzing...
              </span>
            ) : (
              <span>⬡ Run Plagiarism Check</span>
            )}
          </button>
          {(text1 || text2) && (
            <button
              onClick={() => { setText1(""); setText2(""); setResult(null); setError(""); }}
              style={styles.clearBtn}
            >
              Clear
            </button>
          )}
        </div>

        {error && (
          <div style={styles.errorBox}>
            <span>⚠</span> {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div ref={resultsRef} style={styles.resultsSection}>
            <div style={styles.resultsDivider}>
              <span style={styles.resultsDividerText}>ANALYSIS RESULTS</span>
            </div>

            {/* Verdict Banner */}
            {vconf && (
              <div style={{
                ...styles.verdictBanner,
                background: vconf.bg,
                borderColor: vconf.color + "50",
              }}>
                <span style={{ ...styles.verdictIcon, color: vconf.color }}>{vconf.icon}</span>
                <div>
                  <div style={{ ...styles.verdictLabel, color: vconf.color }}>{result.verdict}</div>
                  <div style={styles.verdictSummary}>{result.summary}</div>
                </div>
                <div style={{ ...styles.verdictConfidence, color: vconf.color }}>
                  {result.confidence} CONFIDENCE
                </div>
              </div>
            )}

            {/* Score Cards */}
            <div style={styles.scoreGrid}>
              <div style={styles.scoreCard}>
                <div style={styles.scoreRingWrap}>
                  <ScoreRing score={mainScore} color={scoreColor} />
                  <div style={styles.scoreRingInner}>
                    <span style={{ ...styles.scoreNum, color: scoreColor }}>{mainScore}%</span>
                  </div>
                </div>
                <div style={styles.scoreLabel}>
                  {mode === "single" ? "Plagiarism Risk" : "Similarity Score"}
                </div>
              </div>

              {mode === "single" && (
                <div style={styles.scoreCard}>
                  <div style={styles.scoreRingWrap}>
                    <ScoreRing score={result.originalityScore} color="#10b981" />
                    <div style={styles.scoreRingInner}>
                      <span style={{ ...styles.scoreNum, color: "#10b981" }}>{result.originalityScore}%</span>
                    </div>
                  </div>
                  <div style={styles.scoreLabel}>Originality Score</div>
                </div>
              )}

              {mode === "compare" && (
                <div style={styles.scoreCard}>
                  <div style={styles.scoreRingWrap}>
                    <ScoreRing score={result.plagiarismScore} color={result.plagiarismScore > 50 ? "#ef4444" : "#f59e0b"} />
                    <div style={styles.scoreRingInner}>
                      <span style={{ ...styles.scoreNum, color: result.plagiarismScore > 50 ? "#ef4444" : "#f59e0b" }}>
                        {result.plagiarismScore}%
                      </span>
                    </div>
                  </div>
                  <div style={styles.scoreLabel}>Plagiarism Score</div>
                </div>
              )}

              <div style={styles.metaCard}>
                {mode === "compare" && (
                  <div style={styles.metaRow}>
                    <span style={styles.metaKey}>Structural Similarity</span>
                    <span style={{
                      ...styles.metaBadge,
                      background: result.structuralSimilarity === "HIGH" ? "#ef444420" : result.structuralSimilarity === "MEDIUM" ? "#f59e0b20" : "#10b98120",
                      color: result.structuralSimilarity === "HIGH" ? "#ef4444" : result.structuralSimilarity === "MEDIUM" ? "#f59e0b" : "#10b981",
                    }}>{result.structuralSimilarity}</span>
                  </div>
                )}
                {mode === "compare" && (
                  <div style={styles.metaRow}>
                    <span style={styles.metaKey}>Paraphrasing Detected</span>
                    <span style={{
                      ...styles.metaBadge,
                      background: result.paraphrasingDetected ? "#f59e0b20" : "#10b98120",
                      color: result.paraphrasingDetected ? "#f59e0b" : "#10b981",
                    }}>{result.paraphrasingDetected ? "YES" : "NO"}</span>
                  </div>
                )}
                {mode === "single" && result.writingStyleAnalysis && (
                  <div style={styles.styleAnalysis}>
                    <div style={styles.metaKey}>Writing Style Analysis</div>
                    <p style={styles.styleText}>{result.writingStyleAnalysis}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Suspicious / Matched Segments */}
            {mode === "single" && result.suspiciousSegments?.length > 0 && (
              <div style={styles.segmentsSection}>
                <div style={styles.segmentsTitle}>
                  <span style={{ color: "#f59e0b" }}>⚑</span> Suspicious Segments
                </div>
                <div style={styles.segmentsList}>
                  {result.suspiciousSegments.map((seg, i) => (
                    <div key={i} style={styles.segmentItem}>
                      <div style={styles.segmentText}>"{seg.text}"</div>
                      <div style={styles.segmentReason}>{seg.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mode === "compare" && result.matchedSegments?.length > 0 && (
              <div style={styles.segmentsSection}>
                <div style={styles.segmentsTitle}>
                  <span style={{ color: "#f59e0b" }}>⇄</span> Matched Segments
                </div>
                <div style={styles.segmentsList}>
                  {result.matchedSegments.map((seg, i) => (
                    <div key={i} style={styles.matchItem}>
                      <div style={styles.matchRow}>
                        <span style={styles.matchLabel}>Text A</span>
                        <span style={styles.matchText}>"{seg.textA}"</span>
                      </div>
                      <div style={styles.matchArrow}>↕</div>
                      <div style={styles.matchRow}>
                        <span style={styles.matchLabel}>Text B</span>
                        <span style={styles.matchText}>"{seg.textB}"</span>
                      </div>
                      <span style={{
                        ...styles.simBadge,
                        background: seg.similarity === "EXACT" ? "#ef444420" : seg.similarity === "PARAPHRASED" ? "#f59e0b20" : "#7c3aed20",
                        color: seg.similarity === "EXACT" ? "#ef4444" : seg.similarity === "PARAPHRASED" ? "#f59e0b" : "#a855f7",
                      }}>{seg.similarity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => { setResult(null); setText1(""); setText2(""); }}
              style={styles.newCheckBtn}
            >
              ↩ New Analysis
            </button>
          </div>
        )}

        <footer style={styles.footer}>
          <span>PlagScan</span>
          <span style={styles.footerDot}>·</span>
          <span>Powered by Claude AI</span>
          <span style={styles.footerDot}>·</span>
          <span>For educational use</span>
        </footer>
      </div>

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "0 24px 80px",
    maxWidth: 900,
    margin: "0 auto",
    position: "relative",
  },
  gridBg: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: `
      linear-gradient(rgba(124,58,237,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(124,58,237,0.03) 1px, transparent 1px)
    `,
    backgroundSize: "48px 48px",
    pointerEvents: "none",
    zIndex: 0,
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "28px 0 0",
    position: "relative", zIndex: 1,
  },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoIcon: { fontSize: 22, color: "#7c3aed" },
  logoText: { fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px" },
  tagline: { fontSize: 12, color: "#64748b", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em" },
  hero: {
    textAlign: "center", padding: "72px 0 48px",
    position: "relative", zIndex: 1,
  },
  heroLabel: {
    fontSize: 11, letterSpacing: "0.2em", color: "#7c3aed",
    fontFamily: "'JetBrains Mono', monospace",
    marginBottom: 20, fontWeight: 500,
  },
  heroTitle: {
    fontSize: "clamp(38px, 6vw, 64px)",
    fontWeight: 800, lineHeight: 1.05,
    letterSpacing: "-1.5px", marginBottom: 20,
  },
  heroAccent: {
    background: "linear-gradient(135deg, #7c3aed, #a855f7)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  heroSub: {
    color: "#64748b", fontSize: 16, lineHeight: 1.7,
    fontFamily: "'JetBrains Mono', monospace", fontWeight: 300,
  },
  modeRow: {
    display: "flex", gap: 12, justifyContent: "center",
    marginBottom: 32, position: "relative", zIndex: 1,
  },
  modeBtn: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "10px 22px", borderRadius: 8,
    border: "1px solid #2a2a3a", background: "#111118",
    color: "#64748b", cursor: "pointer", fontSize: 14, fontWeight: 600,
    fontFamily: "'Syne', sans-serif", transition: "all 0.2s",
  },
  modeBtnActive: {
    border: "1px solid #7c3aed", color: "#a855f7",
    background: "#7c3aed15",
  },
  inputSection: {
    display: "flex", flexDirection: "column", gap: 16,
    position: "relative", zIndex: 1,
  },
  textareaWrapper: { display: "flex", flexDirection: "column", gap: 8 },
  textareaLabel: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    fontSize: 11, fontWeight: 600, letterSpacing: "0.15em",
    color: "#64748b", fontFamily: "'JetBrains Mono', monospace",
    textTransform: "uppercase",
  },
  wordCount: { color: "#7c3aed", fontWeight: 500 },
  textarea: {
    width: "100%", background: "#111118",
    border: "1px solid #2a2a3a", borderRadius: 12,
    color: "#e2e8f0", padding: "16px 20px",
    fontSize: 15, lineHeight: 1.7, resize: "vertical",
    fontFamily: "'JetBrains Mono', monospace", fontWeight: 300,
    outline: "none", transition: "border-color 0.2s",
  },
  ctaRow: {
    display: "flex", gap: 12, alignItems: "center",
    justifyContent: "center", margin: "28px 0",
    position: "relative", zIndex: 1,
  },
  checkBtn: {
    padding: "14px 36px", borderRadius: 10,
    background: "linear-gradient(135deg, #7c3aed, #a855f7)",
    color: "white", border: "none", cursor: "pointer",
    fontSize: 15, fontWeight: 700, fontFamily: "'Syne', sans-serif",
    letterSpacing: "0.02em", transition: "all 0.2s",
    boxShadow: "0 0 30px rgba(124,58,237,0.3)",
  },
  checkBtnDisabled: {
    opacity: 0.4, cursor: "not-allowed",
    boxShadow: "none",
  },
  spinnerWrap: { display: "flex", alignItems: "center", gap: 10 },
  spinner: {
    display: "inline-block", width: 16, height: 16,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "white", borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  clearBtn: {
    padding: "14px 22px", borderRadius: 10,
    background: "transparent", color: "#64748b",
    border: "1px solid #2a2a3a", cursor: "pointer",
    fontSize: 14, fontWeight: 600, fontFamily: "'Syne', sans-serif",
    transition: "all 0.2s",
  },
  errorBox: {
    background: "#ef444415", border: "1px solid #ef444440",
    borderRadius: 10, padding: "14px 20px",
    color: "#ef4444", fontSize: 14, display: "flex",
    gap: 10, alignItems: "center", marginBottom: 24,
    position: "relative", zIndex: 1,
  },
  resultsSection: {
    position: "relative", zIndex: 1,
    animation: "fadeUp 0.5s ease both",
  },
  resultsDivider: {
    display: "flex", alignItems: "center", gap: 16,
    marginBottom: 28,
  },
  resultsDividerText: {
    fontSize: 11, letterSpacing: "0.2em", color: "#7c3aed",
    fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
    whiteSpace: "nowrap",
  },
  verdictBanner: {
    display: "flex", alignItems: "flex-start", gap: 20,
    padding: "20px 24px", borderRadius: 12,
    border: "1px solid", marginBottom: 24,
  },
  verdictIcon: { fontSize: 28, flexShrink: 0, marginTop: 2 },
  verdictLabel: { fontWeight: 800, fontSize: 18, letterSpacing: "-0.3px", marginBottom: 6 },
  verdictSummary: { color: "#94a3b8", fontSize: 14, lineHeight: 1.6 },
  verdictConfidence: {
    marginLeft: "auto", fontSize: 11, fontWeight: 600,
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "0.1em", flexShrink: 0, marginTop: 6,
  },
  scoreGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16, marginBottom: 24,
  },
  scoreCard: {
    background: "#111118", border: "1px solid #2a2a3a",
    borderRadius: 12, padding: "24px 20px",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
  },
  scoreRingWrap: { position: "relative", display: "inline-flex" },
  scoreRingInner: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  scoreNum: { fontSize: 22, fontWeight: 800, letterSpacing: "-1px" },
  scoreLabel: { fontSize: 12, color: "#64748b", fontWeight: 600, textAlign: "center", letterSpacing: "0.05em" },
  metaCard: {
    background: "#111118", border: "1px solid #2a2a3a",
    borderRadius: 12, padding: "20px 24px",
    display: "flex", flexDirection: "column", gap: 16,
    justifyContent: "center",
  },
  metaRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 },
  metaKey: { fontSize: 13, color: "#64748b", fontWeight: 600 },
  metaBadge: {
    padding: "4px 10px", borderRadius: 6,
    fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "0.05em",
  },
  styleAnalysis: { display: "flex", flexDirection: "column", gap: 8 },
  styleText: { fontSize: 13, color: "#94a3b8", lineHeight: 1.6 },
  segmentsSection: {
    background: "#111118", border: "1px solid #2a2a3a",
    borderRadius: 12, padding: "24px", marginBottom: 24,
  },
  segmentsTitle: {
    fontSize: 13, fontWeight: 700, letterSpacing: "0.1em",
    textTransform: "uppercase", marginBottom: 16,
    display: "flex", alignItems: "center", gap: 8,
    fontFamily: "'JetBrains Mono', monospace",
  },
  segmentsList: { display: "flex", flexDirection: "column", gap: 12 },
  segmentItem: {
    background: "#1a1a25", borderRadius: 8, padding: "14px 18px",
    borderLeft: "3px solid #f59e0b40",
  },
  segmentText: {
    fontSize: 14, color: "#e2e8f0", marginBottom: 6,
    fontStyle: "italic", lineHeight: 1.5,
  },
  segmentReason: { fontSize: 12, color: "#64748b", lineHeight: 1.5 },
  matchItem: {
    background: "#1a1a25", borderRadius: 8, padding: "14px 18px",
    display: "flex", flexDirection: "column", gap: 6, position: "relative",
  },
  matchRow: { display: "flex", alignItems: "flex-start", gap: 10 },
  matchLabel: {
    fontSize: 10, fontWeight: 700, color: "#7c3aed",
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "0.1em", flexShrink: 0, marginTop: 2,
  },
  matchText: { fontSize: 13, color: "#e2e8f0", fontStyle: "italic", lineHeight: 1.5 },
  matchArrow: { textAlign: "center", color: "#2a2a3a", fontSize: 16 },
  simBadge: {
    alignSelf: "flex-start",
    padding: "3px 8px", borderRadius: 5,
    fontSize: 10, fontWeight: 700,
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "0.08em", marginTop: 4,
  },
  newCheckBtn: {
    display: "block", width: "100%",
    padding: "14px", borderRadius: 10,
    background: "transparent", color: "#64748b",
    border: "1px solid #2a2a3a", cursor: "pointer",
    fontSize: 14, fontWeight: 600, fontFamily: "'Syne', sans-serif",
    transition: "all 0.2s", marginTop: 8, marginBottom: 32,
  },
  footer: {
    textAlign: "center", padding: "32px 0 0",
    fontSize: 12, color: "#2a2a3a",
    fontFamily: "'JetBrains Mono', monospace",
    display: "flex", justifyContent: "center", gap: 10,
    position: "relative", zIndex: 1,
  },
  footerDot: { opacity: 0.4 },
};
