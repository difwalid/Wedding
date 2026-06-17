const weddingDate = new Date("2026-09-21T16:30:00-07:00").getTime();
const loader = document.querySelector("#loader");
const opening = document.querySelector("#opening");
const envelope = document.querySelector(".envelope");
const openInvite = document.querySelector("#openInvite");
const nav = document.querySelector("#topNav");
const musicToggle = document.querySelector("#musicToggle");
const musicIcon = document.querySelector("#musicIcon");
const rsvpForm = document.querySelector("#rsvpForm");
const rsvpMessage = document.querySelector("#rsvpMessage");

window.addEventListener("load", () => {
  gsap.to(loader, {
    autoAlpha: 0,
    duration: 0.8,
    delay: 0.35,
    ease: "power2.out",
    onComplete: () => loader.remove(),
  });
});

const lenis = new Lenis({
  duration: 1.25,
  smoothWheel: true,
  wheelMultiplier: 0.85,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

gsap.registerPlugin(ScrollTrigger);

gsap.utils.toArray(".reveal").forEach((element) => {
  gsap.from(element, {
    y: 48,
    opacity: 0,
    duration: 1.1,
    ease: "power3.out",
    scrollTrigger: {
      trigger: element,
      start: "top 82%",
    },
  });
});

gsap.to(".parallax", {
  yPercent: 12,
  ease: "none",
  scrollTrigger: {
    trigger: "#hero",
    start: "top top",
    end: "bottom top",
    scrub: true,
  },
});

openInvite.addEventListener("click", () => {
  envelope.classList.add("open");
  gsap.to(openInvite, { autoAlpha: 0, y: 12, duration: 0.35 });
  gsap.to(opening, {
    autoAlpha: 0,
    scale: 1.03,
    duration: 1.1,
    delay: 1.15,
    ease: "power2.inOut",
    onComplete: () => {
      opening.remove();
      gsap.to(nav, { opacity: 1, duration: 0.65 });
      lenis.scrollTo("#hero", { immediate: true });
    },
  });
});

function updateCountdown() {
  const distance = weddingDate - Date.now();
  const safeDistance = Math.max(distance, 0);
  const days = Math.floor(safeDistance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((safeDistance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((safeDistance / (1000 * 60)) % 60);
  const seconds = Math.floor((safeDistance / 1000) % 60);

  document.querySelector("#days").textContent = String(days).padStart(2, "0");
  document.querySelector("#hours").textContent = String(hours).padStart(2, "0");
  document.querySelector("#minutes").textContent = String(minutes).padStart(2, "0");
  document.querySelector("#seconds").textContent = String(seconds).padStart(2, "0");
}

updateCountdown();
setInterval(updateCountdown, 1000);

let audioContext;
let musicNodes = [];
let musicPlaying = false;

function startMusic() {
  audioContext = audioContext || new AudioContext();
  const master = audioContext.createGain();
  master.gain.value = 0.035;
  master.connect(audioContext.destination);

  const notes = [261.63, 329.63, 392, 493.88];
  musicNodes = notes.map((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = index % 2 ? "triangle" : "sine";
    oscillator.frequency.value = frequency;
    gain.gain.value = index === 0 ? 0.7 : 0.35;
    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start();
    return { oscillator, gain };
  });

  musicPlaying = true;
  musicIcon.textContent = "Ⅱ";
  musicToggle.setAttribute("aria-label", "Pause music");
}

function stopMusic() {
  musicNodes.forEach(({ oscillator, gain }) => {
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.25);
    oscillator.stop(audioContext.currentTime + 0.3);
  });
  musicNodes = [];
  musicPlaying = false;
  musicIcon.textContent = "♪";
  musicToggle.setAttribute("aria-label", "Play music");
}

musicToggle.addEventListener("click", async () => {
  if (!musicPlaying) {
    startMusic();
    if (audioContext.state === "suspended") await audioContext.resume();
  } else {
    stopMusic();
  }
});

rsvpForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(rsvpForm).entries());
  localStorage.setItem("wedding-rsvp", JSON.stringify({ ...data, sentAt: new Date().toISOString() }));
  rsvpMessage.textContent = data.attendance === "yes"
    ? "Thank you. Your RSVP has been received with joy."
    : "Thank you for letting us know. You will be missed.";
  rsvpForm.reset();
});

const savedRsvp = localStorage.getItem("wedding-rsvp");
if (savedRsvp) {
  rsvpMessage.textContent = "Your RSVP is already saved on this device.";
}
