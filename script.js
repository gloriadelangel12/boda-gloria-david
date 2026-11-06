/* ===== Configuración de la invitación ===== */
const CONFIG = {
  weddingDate: "2027-07-31T18:00:00-05:00", // 6:00 PM hora de Tamaulipas fronterizo (CDT). Ajusta el -05:00 si tu zona difiere.
  eventEnd:    "2027-08-01T01:00:00-05:00", // Fin de la celebración: 1:00 AM
  /*whatsappNumber: "TU_NUMERO_REAL",         // <- Ej.: 528991234567 (código de país, sin + ni espacios)
  whatsappMessage: "¡Hola! Confirmo mi asistencia a la boda de Gloria y David. Mi nombre es: ",*/
  musicPath: "assets/Can’t Help Falling in Love Piano.mp3",
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

/* ===== Calendario (.ics) ===== 
const icsDate = iso => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
$("calendarBtn").addEventListener("click", () => {
  const ics = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Invitacion Boda//ES","CALSCALE:GREGORIAN","BEGIN:VEVENT",
    "UID:boda-gloria-david-20270731@invitacion","DTSTAMP:" + icsDate(new Date().toISOString()),
    "DTSTART:" + icsDate(CONFIG.weddingDate),"DTEND:" + icsDate(CONFIG.eventEnd),
    "SUMMARY:" + CONFIG.eventTitle,"LOCATION:" + CONFIG.eventPlace.replace(/,/g, "\\,"),
    "DESCRIPTION:Ceremonia religiosa 6:00 PM · Recepción 8:00 PM · Salón de Eventos EMCEE",
    "BEGIN:VALARM","TRIGGER:-P1D","ACTION:DISPLAY","DESCRIPTION:Mañana es la boda de Gloria y David","END:VALARM",
    "END:VEVENT","END:VCALENDAR"].join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  a.download = "boda-gloria-david.ics"; document.body.appendChild(a); a.click(); a.remove();
  showToast("Evento listo para añadir a tu calendario");
});*/


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
  catch { setPlaying(false); if (!silent) showToast("assets/Can’t Help Falling in Love Piano.mp3"); }
}
function toggleMusic() { if (music.paused) tryStartMusic(false); else { music.pause(); setPlaying(false); } }
musicToggle.addEventListener("click", toggleMusic);
vinyl.addEventListener("click", toggleMusic);
