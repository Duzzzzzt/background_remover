export async function initCamera() {
  const video = document.getElementById("video");
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720, facingMode: "user" },
      audio: false
    });
    video.srcObject = stream;
    await video.play();
    console.log("✅ Камера запущена");
    document.getElementById("loading").style.display = "none";
    return true;
  } catch (e) {
    console.error("❌ Ошибка камеры:", e);
    document.getElementById("loading").textContent = "Не удалось получить доступ к камере.";
    return false;
  }
}