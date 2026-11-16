/* sayac-dev — Dev tipografik sayaçlar (15 Kas 2026, G4 · mcp:webmaker/20261115-202337-k60m · D17–D18).
   Yer tutucular: sdvsinif sdvust sdvbaslik sdvmetin sdvsayilar sdvetiket.
   data: [{ sayi, onek?, sonek?, etiket, aciklama? }] — sayi sayı (123 · 4.5 · "1200"); etiket/aciklama/onek/sonek dil sözlüğü.
   Sunucu son değeri sayfa diliyle biçimlenmiş basar (Intl — SEO / JS'siz doğru); istemci görünür olunca 0'dan sayar (reduced-motion'da saymaz).
   Veri yoksa blok basılmaz. */
const pick = (v) => {
  if (v == null) return "";
  if (typeof v !== "object") return String(v);
  if (typeof wmPickLang === "function") { try { return wmPickLang(v, json.lang) || ""; } catch (e) { /* alt satır */ } }
  return String(v[json.lang] ?? Object.values(v)[0] ?? "");
};
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const medyaUrl = (v) => {
  const s = String(v ?? "").trim();
  if (!s || /^\s*(javascript|vbscript|file):/i.test(s)) return "";
  if (/^data:/i.test(s)) return /^data:(image|video|audio)\//i.test(s) ? s : "";
  if (s.startsWith("/") || /^https?:\/\//i.test(s)) return s;
  return `/img/${s}`;
};
const href = (v) => {
  const s = String(v ?? "").trim();
  if (!s || /^\s*(javascript|vbscript|data):/i.test(s)) return "";
  if (/^(https?:)?\/\//i.test(s) || /^(mailto:|tel:|#)/i.test(s)) return s;
  return wxLangInternalHref(s);
};
const dogru = (v, d) => (v === undefined || v === null || v === "") ? d : !(v === false || v === "false" || v === 0 || v === "0");
const ikonAd = (v) => String(v ?? "").trim().replace(/[^a-z0-9_]/gi, "");
const satirlar = (s) => esc(s).replace(/\r?\n/g, "<br />");
const { desing: des = {} } = json;
const setting = webmakerdata?.setting ?? {};
const veri = Array.isArray(json.data) ? json.data : [];

const sayilar = veri.map((o) => {
  const ham = String((o && o.sayi) ?? "").trim().replace(/\s/g, "").replace(",", ".");
  const deger = Number(ham);
  if (!ham || !Number.isFinite(deger)) return null;
  const ondalik = (ham.split(".")[1] || "").length;
  return { deger, ondalik: Math.min(3, ondalik), onek: pick(o.onek).trim(), sonek: pick(o.sonek).trim(), etiket: pick(o.etiket).trim(), aciklama: pick(o.aciklama).trim() };
}).filter((o) => o && o.etiket);

const bicim = (d, ondalik) => {
  try { return new Intl.NumberFormat(json.lang, { minimumFractionDigits: ondalik, maximumFractionDigits: ondalik }).format(d); } catch (e) { return d.toFixed(ondalik); }
};

const sdvSayilar = sayilar.map((s, i) =>
  `<div class="modulex-sdv-oge" style="--sdv-sira:${i}">`
  + `<p class="modulex-sdv-sayi"><span class="modulex-sdv-onek">${esc(s.onek)}</span><span class="modulex-sdv-deger" data-hedef="${s.deger}" data-ondalik="${s.ondalik}">${esc(bicim(s.deger, s.ondalik))}</span><span class="modulex-sdv-sonek">${esc(s.sonek)}</span></p>`
  + `<p class="modulex-sdv-etiket">${esc(s.etiket)}</p>`
  + (s.aciklama ? `<p class="modulex-sdv-aciklama">${satirlar(s.aciklama)}</p>` : "")
  + "</div>").join("");

const ust = pick(des.ust).trim();
const baslik = pick(des.baslik).trim();
const metin = pick(des.metin).trim();
const stil = ["cizgi", "koyu"].includes(String(des.stil || "").trim()) ? String(des.stil).trim() : "cizgi";

html = html
  .replaceAll("{{sdvsinif}}", () => ` modulex-sdv--${stil}` + (ust || baslik || metin ? "" : " modulex-sdv--bassiz") + ` modulex-sdv--n${Math.min(4, sayilar.length)}`)
  .replaceAll("{{sdvust}}", () => (ust ? `<p class="modulex-sdv-ust">${esc(ust)}</p>` : ""))
  .replaceAll("{{sdvbaslik}}", () => (baslik ? `<h2 class="modulex-sdv-baslik" id="sdv-{{id}}-baslik">${esc(baslik)}</h2>` : ""))
  .replaceAll("{{sdvmetin}}", () => (metin ? `<p class="modulex-sdv-metin">${satirlar(metin)}</p>` : ""))
  .replaceAll("{{sdvetiket}}", () => (baslik ? 'aria-labelledby="sdv-{{id}}-baslik"' : ""))
  .replaceAll("{{sdvsayilar}}", () => sdvSayilar);
if (!sayilar.length) html = "";
