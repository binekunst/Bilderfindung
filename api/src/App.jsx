import { useState, useRef, useEffect } from "react";

// ── System Prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Du bist ein kunstpädagogischer Ateliergespräch-Partner für Schülerinnen und Schüler eines Kunst-Leistungskurses (Q1, Gymnasium). Sie beschäftigen sich mit der Malerin Lynette Yiadom-Boakye und entwickeln eigene Bildideen.

Deine Rolle ist die eines erfahrenen, aufmerksamen Gesprächspartners im Atelier – wie eine Mentorin, die genau hinschaut, präzise nachfragt, ehrlich und ermutigend reagiert und hilft, aus einer ersten Idee ein durchdachtes malerisches Konzept zu entwickeln.

══════════════════════════════════════════
ÜBER LYNETTE YIADOM-BOAKYE
══════════════════════════════════════════

- Britische Malerin (*1977, London), eine der bedeutendsten figurativen Malerinnen der Gegenwart
- Malt ausschließlich fiktive Personen – nie aus Beobachtung, immer aus Imagination
- Das Malerische IST der Inhalt: Haltung, Licht, Pinselduktus, Figur-Grund-Verhältnis
- Hintergründe: dunkel, erdig, fast monochrom – kein Kontext, nur Fläche
- Kleidung: zeitlos, oft schwarz – kein Bedeutungsträger, nur malerisches Volumen
- Titel entstehen IMMER nach dem Malen – als poetische Verdichtung, nie als Vorgabe
- Keine Requisiten, keine Symbole, keine Narrative – die Figur trägt alles allein

══════════════════════════════════════════
DEINE GESPRÄCHSHALTUNG
══════════════════════════════════════════

- Warm, präzise, auf Augenhöhe – wie ein echtes Ateliergespräch, nicht wie Unterricht
- Du reagierst IMMER konkret auf das was die Schüler*in geschrieben oder gezeigt hat – nie generisch
- Du stellst genau EINE Frage auf einmal
- Du verstärkst positiv was stark ist: "Das ist eine interessante Entscheidung, weil..." oder "Genau das trägt das Bild schon..."
- Du fragst nach wenn etwas unklar ist: "Was meinst du genau mit...?" oder "Kannst du das malerisch beschreiben?"
- Du lenkst sanft zurück wenn SuS narrativ werden: weg von Bedeutung, hin zum Sichtbaren
- Du verwendest Fachsprache auf Q1 LK-Niveau und führst sie selbstverständlich ein

══════════════════════════════════════════
FACHSPRACHE
══════════════════════════════════════════

Verwende aktiv und erkläre kurz im Kontext:
Figur-Grund-Verhältnis, Bildraum, Negativraum, Valeur, Farbtemperatur, Lokalfarbe, Kontur (scharf/weich/verloren), Bildachsen, Komposition, Pinselduktus, Impasto, Lasur, malerische Geste, Bildformat, Simultankontrast, Chiaroscuro, Atmosphäre, Raumwirkung

══════════════════════════════════════════
DIE VIER GESPRÄCHSPHASEN
══════════════════════════════════════════

PHASE 1 – ERSTE BILDIDEE (3–4 Runden)
Ziel: Verstehen was die Schüler*in vorhat und die Idee malerisch schärfen.
- Frage nach Figur, Haltung, Bewegung, Verhältnis zum Bildformat
- Wenn eine Skizze hochgeladen wird: Beschreibe genau was du siehst, benenne was stark ist, stelle eine konkrete Frage
- Positiv verstärken: Benenne konkret was in der Idee oder Skizze bereits trägt
- Keine Namen, Berufe, Gefühle, narrative Kontexte

PHASE 2 – MALERISCHE ENTSCHEIDUNGEN (4–5 Runden)
Ziel: Malerische Parameter klären und begründen.
Frage konkret nach: Licht (Herkunft, Härte, Temperatur, Valeurs), Bildgrund (Farbe, Tiefe, Verhältnis zur Figur), Kontur (scharf oder verloren?), Duktus (pastös oder lasierend?), Komposition (Achsen, Platzierung im Format).
Immer nachfragen: "Warum diese Wahl? Was bewirkt das im Bild?"

PHASE 3 – SKIZZEN-FEEDBACK (bei Bild-Upload)
Ziel: Konkretes fachsprachliches Feedback das weiterhilft.
- Beschreibe präzise was du siehst: Komposition, Valeurs, Kontur, Figur-Grund
- Benenne was stark ist und warum: "Die verlorene Kontur links erzeugt..."
- Stelle eine konkrete Frage zur Weiterentwicklung
- Ermutige: Zeige wo die Schüler*in bereits richtig denkt

PHASE 4 – KONZEPT UND ABSCHLUSS
Erstelle ein dreiteiliges Ergebnis mit diesen exakten Labels:

MALERISCHES KONZEPT:
3–5 Sätze, fachsprachlich präzise. Figur, Komposition, Licht, Farbpalette, Duktus. So konkret, dass die Schüler*in damit ans Bild gehen kann.

LYRISCHER BEGLEITTEXT:
4–6 Zeilen, atmosphärisch-poetisch im Geiste Yiadom-Boakyes. Nicht beschreibend, sondern verdichtend. Keine Reime. Eine Folge von Bildern und Zuständen die das Malerische in Sprache überführt.

TITEL:
1 kurze Wortverbindung, lakonisch, rätselhaft, ohne Artikel wenn möglich. Nach dem Konzept, nie davor.

Wenn Phase 4 abgeschlossen ist, füge am Ende EXAKT ein:
[KONZEPT_BEREIT]

══════════════════════════════════════════
BEGINN
══════════════════════════════════════════

Begrüße die Schüler*in kurz und einladend (2–3 Sätze). Erkläre in einem Satz was sie hier erwartet. Stelle eine erste offene Frage zur Bildidee – oder lade sie ein, direkt eine Skizze hochzuladen. Ton: warm, neugierig, auf Augenhöhe.`;

// ── Helpers ───────────────────────────────────────────────────────────────────

const LOADING_PHRASES = [
  "Betrachtet …", "Denkt nach …", "Schaut genau hin …", "Überlegt …"
];

function useTypewriter(text, speed = 18) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    if (!text) return;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(iv);
    }, speed);
    return () => clearInterval(iv);
  }, [text]);
  return displayed;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TypingIndicator() {
  const [phrase] = useState(() => LOADING_PHRASES[Math.floor(Math.random() * LOADING_PHRASES.length)]);
  const [dots, setDots] = useState("");
  useEffect(() => {
    const iv = setInterval(() => setDots(d => d.length >= 3 ? "" : d + "."), 450);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "20px" }}>
      <div style={{
        background: "#142218", border: "1px solid #3a2810",
        borderRadius: "3px 14px 14px 14px", padding: "12px 18px",
        color: "#8ec87a", fontStyle: "italic", fontSize: "0.88rem", letterSpacing: "0.02em"
      }}>
        {phrase}{dots}
      </div>
    </div>
  );
}

function AssistantMessage({ text, isLatest }) {
  const displayed = useTypewriter(isLatest ? text : null);
  const content = isLatest ? displayed : text;
  return (
    <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "20px" }}>
      <div style={{
        background: "#122018", border: "1px solid #2e1e0e",
        borderRadius: "3px 14px 14px 14px", padding: "16px 20px",
        maxWidth: "78%", color: "#d4eacc", fontSize: "0.95rem",
        lineHeight: "1.75", whiteSpace: "pre-wrap"
      }}>
        {content}
      </div>
    </div>
  );
}

function UserMessage({ text, image }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
      <div style={{
        background: "#1a3022", border: "1px solid #5a3820",
        borderRadius: "14px 3px 14px 14px", padding: "14px 18px",
        maxWidth: "72%", color: "#e2f0d8", fontSize: "0.95rem", lineHeight: "1.7"
      }}>
        {image && (
          <img src={image} alt="Skizze" style={{
            maxWidth: "100%", borderRadius: "4px",
            marginBottom: text ? "10px" : "0",
            border: "1px solid #3a2810", display: "block"
          }} />
        )}
        {text && <span style={{ whiteSpace: "pre-wrap" }}>{text}</span>}
      </div>
    </div>
  );
}

function KonzeptKarte({ konzept, onClose }) {
  const lines = konzept.split('\n').filter(l => l.trim());

  function downloadAsText() {
    const blob = new Blob([konzept], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bildkonzept.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.85)",
      zIndex: 100, padding: "16px",
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "#142218", border: "1px solid #6a4820",
        borderRadius: "4px", width: "100%", maxWidth: "520px",
        maxHeight: "90vh",
        boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
        display: "flex", flexDirection: "column",
        overflow: "hidden"
      }}>
        {/* Fixed header with close button — always reachable */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px 12px 24px", flexShrink: 0
        }}>
          <div style={{
            fontSize: "0.7rem", letterSpacing: "0.18em", color: "#4a9e60",
            textTransform: "uppercase"
          }}>
            Dein Bildkonzept
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent", border: "none", color: "#8ec87a",
              fontSize: "1.4rem", lineHeight: 1, cursor: "pointer", padding: "4px 8px"
            }}
          >
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{
          overflowY: "scroll", WebkitOverflowScrolling: "touch",
          padding: "0 24px 24px 24px", flex: "1 1 auto", minHeight: 0
        }}>
          <div style={{
            width: "40px", height: "2px", background: "#4a9e60", marginBottom: "24px"
        }} />
        {lines.map((line, i) => (
          <p key={i} style={{
            color: "#d4eacc", fontSize: "0.95rem", lineHeight: "1.75",
            marginBottom: "10px", whiteSpace: "pre-wrap"
          }}>
            {line}
          </p>
        ))}
        <div style={{ marginTop: "32px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            onClick={downloadAsText}
            style={{
              flex: "1 1 auto", minWidth: "140px", padding: "11px", background: "#4a9e60",
              border: "none", borderRadius: "3px", color: "#fff",
              fontSize: "0.88rem", cursor: "pointer", letterSpacing: "0.05em"
            }}
          >
            Als Text speichern
          </button>
          <button
            onClick={onClose}
            style={{
              flex: "1 1 auto", minWidth: "140px", padding: "11px", background: "transparent",
              border: "1px solid #3a2810", borderRadius: "3px", color: "#8ec87a",
              fontSize: "0.88rem", cursor: "pointer"
            }}
          >
            Weiter im Gespräch
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [messages, setMessages] = useState([]); // {role, text, image, imageBase64, mediaType}
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);
  const [konzept, setKonzept] = useState(null);
  const [latestAssistantIndex, setLatestAssistantIndex] = useState(-1);
  const bottomRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ── API call ────────────────────────────────────────────────────────────────
  async function callClaude(history, userText, imageData) {
    const apiMessages = history.map(m => {
      if (m.role === "user" && m.imageBase64) {
        return {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: m.mediaType, data: m.imageBase64 } },
            { type: "text", text: m.text || "Ich habe diese Skizze hochgeladen." }
          ]
        };
      }
      return { role: m.role, content: m.text };
    });

    if (imageData) {
      apiMessages.push({
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: imageData.mediaType, data: imageData.base64 } },
          { type: "text", text: userText || "Ich habe diese Skizze hochgeladen." }
        ]
      });
    } else if (userText) {
      apiMessages.push({ role: "user", content: userText });
    }

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: apiMessages,
      })
    });
    const data = await res.json();
    return data.content?.map(b => b.text || "").join("") || "Keine Antwort.";
  }

  // ── Start ───────────────────────────────────────────────────────────────────
  async function startConversation() {
    setStarted(true);
    setLoading(true);
    try {
      const reply = await callClaude([], "__START__", null);
      const clean = reply.replace("[KONZEPT_BEREIT]", "").trim();
      setMessages([{ role: "assistant", text: clean, isKonzept: false }]);
      setLatestAssistantIndex(0);
      if (reply.includes("[KONZEPT_BEREIT]")) setKonzept(clean);
    } catch {
      setMessages([{ role: "assistant", text: "Verbindungsfehler – bitte Seite neu laden." }]);
    }
    setLoading(false);
  }

  // ── Send ────────────────────────────────────────────────────────────────────
  async function sendMessage() {
    const text = input.trim();
    if (!text && !pendingImage) return;

    const userMsg = {
      role: "user",
      text,
      image: pendingImage?.dataUrl || null,
      imageBase64: pendingImage?.base64 || null,
      mediaType: pendingImage?.mediaType || null,
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setPendingImage(null);
    setLoading(true);

    try {
      const reply = await callClaude(messages, text, pendingImage);
      const clean = reply.replace("[KONZEPT_BEREIT]", "").trim();
      const updated = [...newHistory, { role: "assistant", text: clean }];
      setMessages(updated);
      setLatestAssistantIndex(updated.length - 1);
      if (reply.includes("[KONZEPT_BEREIT]")) setKonzept(clean);
    } catch {
      const updated = [...newHistory, { role: "assistant", text: "Verbindungsfehler – bitte nochmal versuchen." }];
      setMessages(updated);
      setLatestAssistantIndex(updated.length - 1);
    }
    setLoading(false);
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target.result;
      setPendingImage({ dataUrl, base64: dataUrl.split(",")[1], mediaType: file.type });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  const canSend = !loading && (input.trim() || pendingImage);

  return (
    <div style={{
      minHeight: "100vh", background: "#0f1f14",
      display: "flex", flexDirection: "column",
      fontFamily: "'Georgia', 'Times New Roman', serif", color: "#d4eacc"
    }}>

      {/* Header */}
      <div style={{
        borderBottom: "1px solid #2a1a0a", padding: "16px 24px",
        background: "#0d1a10", display: "flex", alignItems: "center",
        justifyContent: "space-between", flexShrink: 0
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{
            width: "8px", height: "8px", borderRadius: "50%",
            background: "#4a9e60", flexShrink: 0
          }} />
          <div>
            <div style={{ fontSize: "0.95rem", fontWeight: "bold", color: "#f0d060", letterSpacing: "0.04em" }}>
              Bilderfindung
            </div>
            <div style={{ fontSize: "0.72rem", color: "#2e6040", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "1px" }}>
              Im Geiste von Lynette Yiadom-Boakye
            </div>
          </div>
        </div>
        {konzept && (
          <button
            onClick={() => setKonzept(konzept)}
            style={{
              padding: "7px 16px", background: "transparent",
              border: "1px solid #6a4820", borderRadius: "2px",
              color: "#8ec87a", fontSize: "0.8rem", cursor: "pointer",
              letterSpacing: "0.06em"
            }}
          >
            Mein Konzept
          </button>
        )}
      </div>

      {/* Chat */}
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 24px 12px" }}>
        {!started ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", minHeight: "60vh", textAlign: "center", gap: "24px"
          }}>
            {/* Dekoratives Element */}
            <div style={{
              width: "60px", height: "60px", borderRadius: "50%",
              background: "linear-gradient(135deg, #162a1c, #2a5c38)",
              border: "1px solid #2e6040", marginBottom: "8px"
            }} />
            <div style={{
              fontSize: "1.1rem", color: "#8ec87a", letterSpacing: "0.06em",
              fontStyle: "italic"
            }}>
              Erfinde eine Figur.
            </div>
            <div style={{
              fontSize: "0.85rem", color: "#3a7050", maxWidth: "340px",
              lineHeight: "1.9", letterSpacing: "0.02em"
            }}>
              Du wirst ein Gespräch führen, das dir hilft, eine eigene Bildidee zu entwickeln.
              Egal ob du mit einer Erinnerung, einem Gefühl oder einer ersten Skizze startest –
              gemeinsam übersetzen wir das in eine konkrete Bildidee,
              bei der Atmosphäre und Stimmung im Vordergrund stehen.
            </div>
            <div style={{ width: "1px", height: "32px", background: "#1a3022" }} />
            <div style={{ fontSize: "0.78rem", color: "#3a6048", letterSpacing: "0.04em" }}>
              Du kannst schreiben und Skizzen hochladen.
            </div>
            <button
              onClick={startConversation}
              style={{
                marginTop: "8px", padding: "13px 36px",
                background: "transparent", border: "1px solid #8a6030",
                borderRadius: "2px", color: "#f0d060", fontSize: "0.9rem",
                cursor: "pointer", letterSpacing: "0.1em",
                fontFamily: "inherit", transition: "all 0.2s"
              }}
            >
              Gespräch beginnen
            </button>
          </div>
        ) : (
          <>
            {messages.map((m, i) =>
              m.role === "assistant"
                ? <AssistantMessage key={i} text={m.text} isLatest={i === latestAssistantIndex} isKonzept={m.isKonzept} />
                : <UserMessage key={i} text={m.text} image={m.image} />
            )}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      {started && (
        <div style={{
          borderTop: "1px solid #2a1a0a", padding: "16px 24px",
          background: "#0d1a10", flexShrink: 0
        }}>
          {pendingImage && (
            <div style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
              <img src={pendingImage.dataUrl} alt="Vorschau"
                style={{ height: "52px", borderRadius: "3px", border: "1px solid #3a2010" }} />
              <button onClick={() => setPendingImage(null)}
                style={{ background: "none", border: "none", color: "#2e6040", cursor: "pointer", fontSize: "0.8rem" }}>
                Entfernen
              </button>
            </div>
          )}
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
            <button
              onClick={() => fileRef.current?.click()}
              title="Skizze hochladen"
              style={{
                flexShrink: 0, width: "42px", height: "42px",
                background: "transparent", border: "1px solid #2a1a0a",
                borderRadius: "3px", color: "#3a7050", cursor: "pointer",
                fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center"
              }}
            >
              ⬆
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />

            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Schreib hier – oder lade eine Skizze hoch …"
              rows={2}
              disabled={loading}
              style={{
                flex: 1, background: "#111e14", border: "1px solid #2a1a0a",
                borderRadius: "3px", color: "#d4eacc", padding: "10px 14px",
                fontFamily: "inherit", fontSize: "0.92rem", resize: "none",
                outline: "none", lineHeight: "1.6"
              }}
            />

            <button
              onClick={sendMessage}
              disabled={!canSend}
              style={{
                flexShrink: 0, width: "42px", height: "42px",
                background: canSend ? "#4a9e60" : "transparent",
                border: `1px solid ${canSend ? "#4a9e60" : "#1a3022"}`,
                borderRadius: "3px",
                color: canSend ? "#fff" : "#2a4a34",
                cursor: canSend ? "pointer" : "not-allowed",
                fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center"
              }}
            >
              →
            </button>
          </div>
          <div style={{ fontSize: "0.7rem", color: "#2a4a34", marginTop: "8px", letterSpacing: "0.04em" }}>
            Enter zum Senden · Shift+Enter für Zeilenumbruch · ⬆ für Skizzen
          </div>
        </div>
      )}

      {/* Konzept-Modal */}
      {/* Konzept wird direkt im Chat angezeigt */}
    </div>
  );
}
