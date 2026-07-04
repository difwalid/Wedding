const weddingDate = new Date("2026-09-21T16:30:00-07:00").getTime();
const loader = document.querySelector("#loader");
const opening = document.querySelector("#opening");
const envelope = document.querySelector(".envelope");
const openInvite = document.querySelector("#openInvite");
const nav = document.querySelector("#topNav");
const weddingMusic = document.querySelector("#weddingMusic");
const musicToggle = document.querySelector("#musicToggle");
const musicIcon = document.querySelector("#musicIcon");
const rsvpForm = document.querySelector("#rsvpForm");
const rsvpMessage = document.querySelector("#rsvpMessage");

let musicPlaying = false;

function updateMusicButton() {
  musicIcon.textContent = musicPlaying ? "Pause" : "Play";
  musicToggle.setAttribute("aria-label", musicPlaying ? "Pause music" : "Play music");
}

async function playMusic() {
  weddingMusic.volume = 0.55;

  try {
    await weddingMusic.play();
    musicPlaying = true;
  } catch (error) {
    musicPlaying = false;
  }

  updateMusicButton();
}

function pauseMusic() {
  weddingMusic.pause();
  musicPlaying = false;
  updateMusicButton();
}

window.addEventListener("load", () => {
  gsap.to(loader, {
    autoAlpha: 0,
    duration: 0.8,
    delay: 0.35,
    ease: "power2.out",
    onComplete: () => loader.remove(),
  });

  playMusic();
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
  playMusic();
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

musicToggle.addEventListener("click", async () => {
  if (!musicPlaying) {
    await playMusic();
  } else {
    pauseMusic();
  }
});

rsvpForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(rsvpForm).entries());
  localStorage.setItem("wedding-rsvp", JSON.stringify({ ...data, sentAt: new Date().toISOString() }));
  rsvpMessage.textContent =
    data.attendance === "yes"
      ? "Thank you. Your RSVP has been received with joy."
      : "Thank you for letting us know. You will be missed.";
  rsvpForm.reset();
});

const savedRsvp = localStorage.getItem("wedding-rsvp");
if (savedRsvp) {
  rsvpMessage.textContent = "Your RSVP is already saved on this device.";
}

updateMusicButton();
