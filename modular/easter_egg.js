document.addEventListener('DOMContentLoaded', function() {
  const texts = ["Mah Davveroh?", "Ebberghe?", "Tutto Positivo?"];
  let currentIndex = 0;
  const textChanger = document.getElementById('LTF_EasterEgg');

  if (!textChanger) return; // Exit if the element isn't found

  textChanger.style.opacity = 0; // Start with opacity 0

  function changeText() {
    // Fade out
    textChanger.style.transition = "opacity 0.5s ease-in-out"; // Add transition
    textChanger.style.opacity = 0;

    setTimeout(() => {
      textChanger.textContent = texts[currentIndex];
      currentIndex = (currentIndex + 1) % texts.length;

      // Fade in
      textChanger.style.transition = "opacity 0.5s ease-in-out"; // Add transition (or keep it)
      textChanger.style.opacity = 1;
    }, 500); // Wait for fade out to complete (adjust as needed)
  }

  changeText(); // Initial text set

  setInterval(changeText, 3500); // 3000ms text display + 500ms fade
});