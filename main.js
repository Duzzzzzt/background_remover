import { initModel, loadModelInfo } from './model.js';
import { initCamera } from './camera.js';
import { setupUI } from './ui.js';
import { startRendering, updateState } from './renderer.js';

let currentPrivacyLevel = "medium";
let personInfo = {
  employee: {
    full_name: "Загрузка...",
    position: "",
    company: "",
    department: "",
    office_location: "",
    contact: {},
    branding: {}
  }
};

// Load employee info
async function loadPersonInfo() {
  try {
    const response = await fetch("info.json");
    if (response.ok) {
      personInfo = await response.json();
      console.log("✅ Данные сотрудника загружены:", personInfo);
    }
  } catch (e) {
    console.warn("⚠️ Ошибка загрузки info.json:", e.message);
  }
}

// Main entry point
async function main() {
  await loadPersonInfo();
  if (personInfo?.employee?.privacy_level) {
    currentPrivacyLevel = personInfo.employee.privacy_level;
  }

  updateState({ personInfo, currentPrivacyLevel });

  const modelReady = await initModel();
  if (!modelReady) return;

  const cameraReady = await initCamera();
  if (!cameraReady) return;

  setupUI();
  loadModelInfo();
  startRendering();
}

main().catch(console.error);