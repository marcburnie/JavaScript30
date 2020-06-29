/** @format */

const video = document.querySelector(".player");
const canvas = document.querySelector(".photo");
const ctx = canvas.getContext("2d");
const strip = document.querySelector(".strip");
const snap = document.querySelector(".snap");

//get webcam
const getVideo = function () {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then((localMediaStream) => {
      console.log(localMediaStream);
      video.srcObject = localMediaStream;
      video.play();
    })
    .catch((err) => {
      console.error(`Webcam must be enabled`, err);
    });
};

const paintToCanvas = function () {
  const width = video.videoWidth;
  const height = video.videoHeight;
  console.log(width, height);
  canvas.width = width;
  canvas.height = height;

  return setInterval(() => {
    ctx.drawImage(video, 0, 0, width, height);
    let pixels = ctx.getImageData(0, 0, width, height);

    //change pixel values
    // pixels = redEffect(pixels);
    // pixels = rgbSplit(pixels);

    //ghosting effect
    // ctx.globalAlpha = 0.1;

    //green screen effect
    pixels = greenScreen(pixels);

    //apply pixel changes to canvas
    ctx.putImageData(pixels, 0, 0);
  }, 16);
};

const takePhoto = function () {
  //play sound
  snap.currentTime = 0;
  snap.play();

  //take the data from the canvas
  const data = canvas.toDataURL("image/jpeg");
  //create link
  const link = document.createElement("a");
  link.href = data;

  link.setAttribute("download", "img");
  link.innerHTML = `<img src="${data}" alt="Your Photo" />`;
  strip.insertBefore(link, strip.firstChild);
};

const redEffect = function (pixels) {
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i + 0] = pixels.data[i + 0] + 100; //red
    pixels.data[i + 1] = pixels.data[i + 1] - 50; //green
    pixels.data[i + 2] = pixels.data[i + 2] * 0.5; //blue
  }
  return pixels;
};

const rgbSplit = function (pixels) {
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i - 150] = pixels.data[i + 0]; //red
    pixels.data[i + 100] = pixels.data[i + 1]; //green
    pixels.data[i - 150] = pixels.data[i + 2]; //blue
  }
  return pixels;
};

const greenScreen = function (pixels) {
  const levels = {};

  document.querySelectorAll(".rgb input").forEach((input) => {
    levels[input.name] = input.value;
  });

  for (i = 0; i < pixels.data.length; i = i + 4) {
    red = pixels.data[i + 0];
    green = pixels.data[i + 1];
    blue = pixels.data[i + 2];
    alpha = pixels.data[i + 3];

    if (
      red >= levels.rmin &&
      green >= levels.gmin &&
      blue >= levels.bmin &&
      red <= levels.rmax &&
      green <= levels.gmax &&
      blue <= levels.bmax
    ) {
      // take it out!
      pixels.data[i + 3] = 0;
    }
  }

  return pixels;
};

getVideo();

video.addEventListener("canplay", paintToCanvas);
