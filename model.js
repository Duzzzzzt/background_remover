import { FilesetResolver, ImageSegmenter } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

let imageSegmenter = null;

export async function initModel() {
  try {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    );

    imageSegmenter = await ImageSegmenter.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite",
        delegate: "GPU"
      },
      runningMode: "VIDEO",
      outputCategoryMask: true
    });

    console.log("✅ Модель загружена");
    document.getElementById("loading").textContent = "Запуск камеры...";
    return true;
  } catch (e) {
    console.error("❌ Ошибка загрузки модели:", e);
    document.getElementById("loading").textContent = "Ошибка загрузки модели.";
    return false;
  }
}

export function getImageSegmenter() {
  return imageSegmenter;
}

export async function loadModelInfo() {
  const modelInfoDiv = document.getElementById("modelInfo");
  try {
    const jsonUrl = "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/model.json";
    const response = await fetch(jsonUrl);
    const data = await response.json();

    const info = [
      `Модель: ${data.modelType || 'Selfie Segmenter'}`,
      `Версия: ${data.version || 'latest'}`,
      `Описание: ${data.description || 'Multi-class background removal'}`
    ].join('<br>');

    modelInfoDiv.innerHTML = info;
  } catch (e) {
    console.warn("Не удалось загрузить info о модели", e);
    modelInfoDiv.textContent = "Информация недоступна";
  }
}  