let state = {
  personInfo: null,
  currentPrivacyLevel: "medium",
  backgroundImage: null,
  bgColor: "#000000",
  textColor: "white",
  brightness: 100,
  saturation: 100
};

export function updateState(newState) {
  Object.assign(state, newState);
}

const canvas = document.getElementById("output");
const ctx = canvas.getContext("2d");
canvas.width = 1280;
canvas.height = 720;

let lastTime = performance.now();
let fps = 0;

function drawBackground() {
  const { backgroundImage, bgColor } = state;
  if (backgroundImage) {
    const imgRatio = backgroundImage.width / backgroundImage.height;
    const canvasRatio = canvas.width / canvas.height;
    let drawWidth, drawHeight, offsetX = 0, offsetY = 0;

    if (imgRatio > canvasRatio) {
      drawHeight = canvas.height;
      drawWidth = backgroundImage.width * (drawHeight / backgroundImage.height);
      offsetX = (canvas.width - drawWidth) / 2;
    } else {
      drawWidth = canvas.width;
      drawHeight = backgroundImage.height * (drawWidth / backgroundImage.width);
      offsetY = (canvas.height - drawHeight) / 2;
    }

    ctx.drawImage(backgroundImage, offsetX, offsetY, drawWidth, drawHeight);
  } else {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function drawPersonInfo() {
  const { personInfo, currentPrivacyLevel } = state;
  if (!personInfo?.employee) return;

  const emp = personInfo.employee;
  const level = currentPrivacyLevel;
  const x = 30;
  const y = canvas.height - 240;

  ctx.fillStyle = state.textColor;
  ctx.font = "bold 32px 'Segoe UI'";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  let offsetY = 0;
  ctx.fillText(emp.full_name || "—", x, y + offsetY); offsetY += 45;
  ctx.font = "24px 'Segoe UI'";
  ctx.fillText(emp.position || "—", x, y + offsetY); offsetY += 40;

  if (level === 'medium' || level === 'high') {
    ctx.font = "20px 'Segoe UI'";
    if (emp.company) { ctx.fillText(emp.company, x, y + offsetY); offsetY += 30; }
    if (emp.department) { ctx.fillText(emp.department, x, y + offsetY); offsetY += 30; }
    if (emp.office_location) { ctx.fillText(emp.office_location, x, y + offsetY); offsetY += 30; }
  }

  if (level === 'high') {
    ctx.font = "18px 'Segoe UI'";
    if (emp.contact?.email) { ctx.fillText(`📧 ${emp.contact.email}`, x, y + offsetY); offsetY += 25; }
    if (emp.contact?.telegram) { ctx.fillText(`📱 ${emp.contact.telegram}`, x, y + offsetY); offsetY += 25; }
    if (emp.branding?.slogan) { ctx.fillText(`"${emp.branding.slogan}"`, x, y + offsetY); }
  }
}

import { getImageSegmenter } from './model.js';

export function startRendering() {
  const video = document.getElementById("video");
  const fpsDisplay = document.getElementById("fps");

  function processFrame() {
    const imageSegmenter = getImageSegmenter();
    if (!imageSegmenter || !video.videoWidth) {
      requestAnimationFrame(processFrame);
      return;
    }

    try {
      const now = performance.now();
      const deltaTime = now - lastTime;
      lastTime = now;
      fps = Math.round(1000 / deltaTime);
      fpsDisplay.textContent = `FPS: ${fps}`;

      const segmentation = imageSegmenter.segmentForVideo(video, now);
      const mask = segmentation.categoryMask;

      if (!mask) {
        segmentation.close();
        requestAnimationFrame(processFrame);
        return;
      }

      drawBackground();
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const maskData = mask.getAsUint8Array();
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const scaleX = canvas.width / mask.width;
      const scaleY = canvas.height / mask.height;

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const maskX = Math.min(Math.floor(x / scaleX), mask.width - 1);
          const maskY = Math.min(Math.floor(y / scaleY), mask.height - 1);
          const maskIndex = maskY * mask.width + maskX;
          const alpha = maskData[maskIndex] === 0 ? 0 : 255;
          const pixelIndex = (y * canvas.width + x) * 4 + 3;
          data[pixelIndex] = alpha;
        }
      }

      ctx.putImageData(imageData, 0, 0);

      // Apply filters only to person
      const { brightness, saturation } = state;
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');

      tempCtx.drawImage(canvas, 0, 0);
      drawBackground();

      tempCtx.filter = `brightness(${brightness / 100}) saturate(${saturation / 100})`;
      ctx.drawImage(tempCanvas, 0, 0);

      drawPersonInfo();
      segmentation.close();
    } catch (e) {
      console.error("Ошибка обработки кадра:", e);
    }

    requestAnimationFrame(processFrame);
  }

  processFrame();
}