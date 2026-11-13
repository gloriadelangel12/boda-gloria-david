/* ===== Configuración de la invitación ===== */
const CONFIG = {
  weddingDate: "2027-07-31T18:00:00-05:00", // 6:00 PM hora de Tamaulipas fronterizo (CDT). Ajusta el -05:00 si tu zona difiere.
  eventEnd:    "2027-08-01T01:00:00-05:00", // Fin de la celebración: 1:00 AM
  /*whatsappNumber: "TU_NUMERO_REAL",         // <- Ej.: 528991234567 (código de país, sin + ni espacios)
  whatsappMessage: "¡Hola! Confirmo mi asistencia a la boda de Gloria y David. Mi nombre es: ",*/
  musicPath: "assets/cant-help-falling-in-love-piano.mp3",
  churchMapQuery: "Parroquia Nuestra Señora del Refugio, Calle 20 de Noviembre 809, Emiliano Zapata",
  venueMapQuery:  "Salón de Eventos EMCEE, Av. Rodolfo Garza Cantú 1211, Col. Tamaulipas",
  eventTitle: "Boda de Gloria & David",
  eventPlace: "Parroquia Nuestra Señora del Refugio, Calle 20 de Noviembre 809, Emiliano Zapata"
};

const $ = id => document.getElementById(id);
const intro = $("intro"), invitation = $("invitation");
const music = $("weddingMusic"), musicToggle = $("musicToggle"), vinyl = $("vinyl"), toast = $("toast");
let opened = false, toastTimer;

function showToast(msg) {
  toast.textContent = msg; toast.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 3400);
}

function openInvitation() {
  if (opened) return; opened = true;            
  $("openInvitation").disabled = true;
  tryStartMusic(true);
  intro.classList.add("leaving");               
  setTimeout(() => {                            
    intro.hidden = true;
    document.body.classList.remove("locked");
    window.scrollTo(0, 0);
    invitation.setAttribute("aria-hidden", "false");
    invitation.classList.add("show");
    musicToggle.hidden = false;
    observeStages();
  }, 850);
}
$("openInvitation").addEventListener("click", openInvitation);

function observeStages() {
  const els = document.querySelectorAll(".rv");
  if (!("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("in")); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .08 });
  els.forEach(e => io.observe(e));
}

/* ===== Cuenta regresiva ===== */
function updateCountdown() {
  const left = new Date(CONFIG.weddingDate).getTime() - Date.now();
  if (left <= 0) {
    $("countdown").hidden = true; const d = $("countdownDone"); d.hidden = false;
    d.textContent = Date.now() < new Date(CONFIG.eventEnd).getTime() ? "¡Hoy es nuestro gran día!" : "Gracias por acompañarnos en nuestro gran día";
    return;
  }
  const p = (n, l) => String(n).padStart(l, "0");
  $("days").textContent = p(Math.floor(left / 864e5), 3);
  $("hours").textContent = p(Math.floor(left % 864e5 / 36e5), 2);
  $("minutes").textContent = p(Math.floor(left % 36e5 / 6e4), 2);
  $("seconds").textContent = p(Math.floor(left % 6e4 / 1e3), 2);
}
updateCountdown(); setInterval(updateCountdown, 1000);

/* ===== Calendario (.ics) ===== */

$("calendarBtn").addEventListener("click", () => {

  const escapar = texto => String(texto)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");

  // Convierte fecha ISO a formato local del evento
  const formatoFecha = fecha => {
    const d = new Date(fecha);

    const partes = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Matamoros",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23"
    }).formatToParts(d);

    const p = Object.fromEntries(
      partes.map(x => [x.type, x.value])
    );

    return `${p.year}${p.month}${p.day}T${p.hour}${p.minute}${p.second}`;
  };

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Invitacion Boda//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VTIMEZONE",
    "TZID:America/Matamoros",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    "UID:boda-gloria-david-20270731@invitacion",
    "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""),
    "DTSTART;TZID=America/Matamoros:" + formatoFecha(CONFIG.weddingDate),
    "DTEND;TZID=America/Matamoros:" + formatoFecha(CONFIG.eventEnd),
    "SUMMARY:" + escapar(CONFIG.eventTitle),
    "LOCATION:" + escapar(CONFIG.eventPlace),
    "DESCRIPTION:" + escapar("Ceremonia religiosa 6:00 PM · Recepción 8:00 PM · Salón de Eventos EMCEE"),
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    "DESCRIPTION:Mañana es la boda de Gloria y David",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob(
    [ics + "\r\n"],
    { type: "text/calendar;charset=utf-8" }
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = "boda-gloria-david.ics";

  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(url), 10000);

  showToast("¡Tu evento está listo para añadir a tu calendario!");
});

/* ===== Mapas y asistencia ===== */
const maps = q => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
$("mapChurch").href = maps(CONFIG.churchMapQuery);
$("mapVenue").href = maps(CONFIG.venueMapQuery);
// Formulario de confirmación de asistencia
const rsvp = $("rsvpButton");

rsvp.href = "https://lal.so/e/SMjoAuvRyx6";
rsvp.target = "_blank";
rsvp.rel = "noopener noreferrer";

rsvp.addEventListener("click", function() {
  this.classList.add("clicked");
});

document.addEventListener("DOMContentLoaded", function() {
  const boton = document.getElementById("rsvpButton");

  if (boton) {
      boton.addEventListener("click", function() {
          this.classList.add("clicked");
      });
  }
});

/* ===== Música ===== */
function setPlaying(on) {
  musicToggle.classList.toggle("playing", on); vinyl.classList.toggle("spin", on);
  musicToggle.setAttribute("aria-pressed", String(on));
}
async function tryStartMusic(silent) {
  if (!music.getAttribute("src")) music.src = CONFIG.musicPath;
  try { await music.play(); setPlaying(true); }
  catch { setPlaying(false); if (!silent) showToast("Toca el disco o el botón ♫ para escuchar la música"); }
}
function toggleMusic() { if (music.paused) tryStartMusic(false); else { music.pause(); setPlaying(false); } }
musicToggle.addEventListener("click", toggleMusic);
vinyl.addEventListener("click", toggleMusic);


/* ===== Ajuste automático del texto (móvil y computadora) =====
   1) Muchos celulares agrandan todo el texto según "Tamaño de fuente" del sistema.
      Aquí se mide cuánto lo agrandan y se compensa (variable CSS --tz), para que las letras
      conserven la proporción del diseño sin importar la configuración del dispositivo.
   2) Como red de seguridad, si algún texto aun así no cabe en su caja, se reduce poco a poco
      (variable CSS --k) hasta que quede completo y dentro de su lugar. */
(function () {
  const root = document.documentElement;
  const SELECTOR = ".t, .pill, .intro-names, .intro-date, .intro-quote, .open-prompt";
  let lastWidth = -1;

  function systemTextScale() {
    const probe = document.createElement("div");
    probe.style.cssText = "position:absolute;left:-9999px;top:0;visibility:hidden;font:100px/1 serif;" +
      "white-space:nowrap;-webkit-text-size-adjust:none;text-size-adjust:none";
    probe.textContent = "Mg";
    document.body.appendChild(probe);
    const z = probe.getBoundingClientRect().height / 100;   // 1 = normal; 1.3 = fuente grande
    probe.remove();
    return (z > 0.5 && z < 3) ? z : 1;
  }

  function fitsWidth(el) {
    const intro = el.closest(".intro-inner");
    if (intro) return el.getBoundingClientRect().width <= intro.clientWidth - 28;
    if (el.scrollWidth > el.clientWidth + 1) return false;
    if (el.dataset.mw) {                                    // ancho ideal del diseño (en unidades de 1/512 de la tarjeta)
      const r = document.createRange(); r.selectNodeContents(el);
      const stage = el.closest(".stage");
      if (r.getBoundingClientRect().width > el.dataset.mw * stage.clientWidth / 512) return false;
    }
    return !el.classList.contains("pill") || el.scrollHeight <= el.clientHeight + 2;   // la altura solo importa en botones
  }

  function fitsBox(el) {                       // bloques que deben quedar dentro de una tarjeta
    if (el.classList.contains("parents")) {
      const wide = [...el.querySelectorAll("p")].every(p => p.scrollWidth <= p.clientWidth + 1);
      const card = document.querySelector(el.dataset.limit || "");
      if (!card) return wide;
      const c = card.getBoundingClientRect(), e = el.getBoundingClientRect();
      return wide && e.bottom <= c.bottom - c.width * 0.09;
    }
    return true;
  }

  function fitAll() {
    const z = systemTextScale();
    root.style.setProperty("--tz", Math.abs(z - 1) > 0.02 ? (1 / z).toFixed(4) : "1");
    document.querySelectorAll(SELECTOR).forEach(el => {
      el.style.removeProperty("--k");
      if (el.hidden || el.offsetParent === null && getComputedStyle(el).position !== "fixed") return;
      let k = 1;
      while (!(fitsWidth(el) && fitsBox(el)) && k > 0.5) {
        k = +(k - 0.025).toFixed(3);
        el.style.setProperty("--k", k);
      }
    });
  }

  function onResize() {
    if (window.innerWidth === lastWidth) return;           // ignora cambios de altura (barra del navegador)
    lastWidth = window.innerWidth;
    clearTimeout(onResize.t); onResize.t = setTimeout(fitAll, 120);
  }

  const start = () => { lastWidth = window.innerWidth; fitAll(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start); else window.addEventListener("load", start);
  window.addEventListener("load", start);
  window.addEventListener("resize", onResize);
  window.addEventListener("orientationchange", () => setTimeout(fitAll, 300));
  document.addEventListener("visibilitychange", () => { if (!document.hidden) fitAll(); });
})();
