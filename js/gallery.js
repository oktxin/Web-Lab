document.addEventListener("DOMContentLoaded", function () {
  const imageCollections = {
    1: [
      {
        url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
        title: "Горный пейзаж 1",
        description: "Величественные горы с заснеженными вершинами",
        sound: "../sound/deep-strange-whoosh-183845.mp3",
      },
      {
        url: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606",
        title: "Горный пейзаж 2",
        description: "Скалистые вершины в туманной дымке",
        sound: "../sound/deep-strange-whoosh-183845.mp3",
      },
      {
        url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
        title: "Горный пейзаж 3",
        description: "Зеленые склоны гор под голубым небом",
        sound: "../sound/deep-strange-whoosh-183845.mp3",
      },
    ],
    2: [
      {
        url: "https://images.unsplash.com/photo-1502082553048-f009c37129b9",
        title: "Морской пейзаж 1",
        description: "Волны, разбивающиеся о скалы",
        sound: "../sound/dust-whooshes_mj5neh4o.mp3",
      },
      {
        url: "https://images.unsplash.com/photo-1471922694854-ff1b63b20054",
        title: "Морской пейзаж 2",
        description: "Тихая бухта с кристально чистой водой",
        sound: "../sound/dust-whooshes_mj5neh4o.mp3",
      },
      {
        url: "https://images.unsplash.com/photo-1428790067070-0ebf4418d9d8",
        title: "Морской пейзаж 3",
        description: "Закат над океаном с золотыми отблесками",
        sound: "../sound/dust-whooshes_mj5neh4o.mp3",
      },
    ],
    3: [
      {
        url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
        title: "Лесной пейзаж 1",
        description: "Тайга с высокими соснами",
        sound: "../sound/twisting-whoosh_fk4udhvu.mp3",
      },
      {
        url: "https://images.unsplash.com/photo-1448375240586-882707db888b",
        title: "Лесной пейзаж 2",
        description: "Осенний лес с разноцветными листьями",
        sound: "../sound/twisting-whoosh_fk4udhvu.mp3",
      },
      {
        url: "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd",
        title: "Лесной пейзаж 3",
        description: "Туманное утро в лесу",
        sound: "../sound/twisting-whoosh_fk4udhvu.mp3",
      },
      {
        url: "https://images.unsplash.com/photo-1426604966848-d7adac402bff",
        title: "Лесной пейзаж 4",
        description: "Зеленый лес с солнечными лучами",
        sound: "../sound/twisting-whoosh_fk4udhvu.mp3",
      },
    ],
  };

  const mainImage = document.getElementById("mainImage");
  const imageTitle = document.getElementById("imageTitle");
  const imageDescription = document.getElementById("imageDescription");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const muteBtn = document.getElementById("muteBtn");
  const volumeSlider = document.getElementById("volumeSlider");
  const interactiveItems = document.querySelectorAll(".interactive-item");

  const audioPlayer = new Audio();
  let isPlaying = false;
  let currentCollection = null;

  const playerIndicator = document.createElement("div");
  playerIndicator.className = "player-indicator";
  playerIndicator.textContent = "Воспроизведение";
  document.querySelector(".main-display").appendChild(playerIndicator);
  updatePlayerIndicator();

  audioPlayer.volume = volumeSlider.value;

  interactiveItems.forEach((item) => {
    item.addEventListener("click", function () {
      const collectionId = this.getAttribute("data-id");
      currentCollection = imageCollections[collectionId];
      changeImageAndSound();
    });
  });

  function changeImageAndSound() {
    if (!currentCollection || currentCollection.length === 0) return;

    const randomIndex = Math.floor(Math.random() * currentCollection.length);
    const selectedItem = currentCollection[randomIndex];

    mainImage.style.opacity = 0;

    setTimeout(() => {
      mainImage.src = selectedItem.url;
      mainImage.alt = selectedItem.title;
      imageTitle.textContent = selectedItem.title;
      imageDescription.textContent = selectedItem.description;

      mainImage.style.opacity = 1;
      mainImage.classList.add("fade-in");

      audioPlayer.src = selectedItem.sound;
      audioPlayer
        .play()
        .then(() => {
          isPlaying = true;
          updatePlayPauseButton();
          updatePlayerIndicator();
        })
        .catch((error) => {
          console.log("Автовоспроизведение заблокировано:", error);
        });

      setTimeout(() => {
        mainImage.classList.remove("fade-in");
      }, 500);
    }, 300);
  }

  playPauseBtn.addEventListener("click", function () {
    if (audioPlayer.paused) {
      if (audioPlayer.src) {
        audioPlayer.play().then(() => {
          isPlaying = true;
          updatePlayPauseButton();
          updatePlayerIndicator();
        });
      } else if (currentCollection) {
        changeImageAndSound();
      }
    } else {
      audioPlayer.pause();
      isPlaying = false;
      updatePlayPauseButton();
      updatePlayerIndicator();
    }
  });

  let wasPlayingBeforeMute = false;
  muteBtn.addEventListener("click", function () {
    if (audioPlayer.muted) {
      audioPlayer.muted = false;
      muteBtn.innerHTML =
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 9V15H7L12 20V4L7 9H3Z" fill="currentColor"/></svg>';
      if (wasPlayingBeforeMute) {
        audioPlayer.play();
      }
    } else {
      wasPlayingBeforeMute = !audioPlayer.paused;
      audioPlayer.muted = true;
      muteBtn.innerHTML =
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.63 3.63L2.22 5.04L7.44 10.26H3V13.75H7.44L12.75 19.06V14.56L17.97 19.78L19.38 18.37L4.63 3.63H3.63ZM12.75 5V9.75L10.75 7.75V5H10.75L7.44 8.31L5.94 6.81L10.75 2H12.75V5Z" fill="currentColor"/></svg>';
      audioPlayer.pause();
    }
  });

  volumeSlider.addEventListener("input", function () {
    audioPlayer.volume = this.value;
  });

  function updatePlayPauseButton() {
    if (isPlaying) {
      playPauseBtn.innerHTML =
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/></svg>';
    } else {
      playPauseBtn.innerHTML =
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 5V19L19 12L8 5Z" fill="currentColor"/></svg>';
    }
  }

  function updatePlayerIndicator() {
    if (isPlaying) {
      playerIndicator.textContent = "Воспроизведение";
      playerIndicator.classList.remove("paused");
    } else {
      playerIndicator.textContent = "Пауза";
      playerIndicator.classList.add("paused");
    }
  }

  audioPlayer.addEventListener("ended", function () {
    isPlaying = false;
    updatePlayPauseButton();
    updatePlayerIndicator();
  });

  audioPlayer.addEventListener("error", function () {
    console.error("Ошибка воспроизведения звука");
    isPlaying = false;
    updatePlayPauseButton();
    updatePlayerIndicator();
  });
});
