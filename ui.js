import { updateState } from './renderer.js';

export function setupUI() {
  const bgInput = document.getElementById("bgInput");
  const brightnessSlider = document.getElementById("brightness");
  const saturationSlider = document.getElementById("saturation");

  bgInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        updateState({ backgroundImage: img });
      };
    } else {
      updateState({ backgroundImage: null });
    }
  });

  function setBgColor(color) {
    const textColor = (color === "#FFFFFF") ? "black" : "white";
    updateState({ bgColor: color, backgroundImage: null, textColor });
  }

  document.getElementById("bgBlack").addEventListener("click", () => setBgColor("#000000"));
  document.getElementById("bgBlue").addEventListener("click", () => setBgColor("#0052CC"));
  document.getElementById("bgGray").addEventListener("click", () => setBgColor("#333333"));
  document.getElementById("bgWhite").addEventListener("click", () => setBgColor("#FFFFFF"));

  brightnessSlider.addEventListener("input", () => {
    updateState({ brightness: parseInt(brightnessSlider.value) });
  });

  saturationSlider.addEventListener("input", () => {
    updateState({ saturation: parseInt(saturationSlider.value) });
  });

  document.getElementById("btnLow").addEventListener("click", () => updateState({ currentPrivacyLevel: "low" }));
  document.getElementById("btnMedium").addEventListener("click", () => updateState({ currentPrivacyLevel: "medium" }));
  document.getElementById("btnHigh").addEventListener("click", () => updateState({ currentPrivacyLevel: "high" }));
}