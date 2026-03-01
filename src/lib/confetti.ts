export function triggerConfetti() {
  if (typeof window === "undefined") return;
  const emojis = ["🎉", "🏏", "🏆", "⭐", "🎊"];

  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement("div");
    confetti.className = "fixed pointer-events-none";
    confetti.innerHTML = emojis[Math.floor(Math.random() * emojis.length)];
    confetti.style.left = Math.random() * window.innerWidth + "px";
    confetti.style.top = "-20px";
    confetti.style.fontSize = (Math.random() * 20 + 10) + "px";
    confetti.style.opacity = "1";
    confetti.style.zIndex = "9999";
    document.body.appendChild(confetti);

    const duration = Math.random() * 3 + 2;
    const xOffset = (Math.random() - 0.5) * 400;

    confetti.animate(
      [
        { transform: "translateY(0) translateX(0) rotate(0deg)", opacity: 1 },
        { transform: `translateY(${window.innerHeight + 50}px) translateX(${xOffset}px) rotate(360deg)`, opacity: 0 },
      ],
      { duration: duration * 1000, easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)" }
    );

    setTimeout(() => confetti.remove(), duration * 1000);
  }
}
