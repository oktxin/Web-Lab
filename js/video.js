document.addEventListener('DOMContentLoaded', function() {
    const videoControl = document.getElementById('videoControl');
    const videoPlayer = document.getElementById('videoPlayer');
    const mainVideo = document.getElementById('mainVideo');
    const videoWrapper = document.querySelector('.video-wrapper');

    const videoURLs = [
        '../video/video.mp4',
    ];

    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading';
    videoWrapper.appendChild(loadingIndicator);

    videoControl.addEventListener('click', function() {
        const randomVideoIndex = Math.floor(Math.random() * videoURLs.length);
        const selectedVideoURL = videoURLs[randomVideoIndex];

        loadingIndicator.classList.add('active');

        mainVideo.src = selectedVideoURL;

        mainVideo.load();

        mainVideo.addEventListener('loadeddata', function() {

            videoControl.style.opacity = '0';
            
            setTimeout(() => {
                videoControl.style.display = 'none';

                videoPlayer.classList.add('active');

                mainVideo.play().then(() => {

                    loadingIndicator.classList.remove('active');
                }).catch(error => {
                    console.error('Ошибка воспроизведения видео:', error);
                    loadingIndicator.classList.remove('active');
                });
            }, 300);
        });

        mainVideo.addEventListener('error', function() {
            console.error('Ошибка загрузки видео');
            loadingIndicator.classList.remove('active');

            alert('Не удалось загрузить видео. Пожалуйста, попробуйте еще раз.');
        });
    });

    mainVideo.addEventListener('ended', function() {
        videoControl.style.display = 'flex';
        setTimeout(() => {
            videoControl.style.opacity = '1';
        }, 10);

        videoPlayer.classList.remove('active');

        mainVideo.src = '';
    });

    mainVideo.addEventListener('click', function(e) {
        e.stopPropagation();
        
        if (mainVideo.paused) {
            mainVideo.play();
        } else {
            mainVideo.pause();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && videoPlayer.classList.contains('active')) {
            mainVideo.pause();

            videoControl.style.display = 'flex';
            setTimeout(() => {
                videoControl.style.opacity = '1';
            }, 10);

            videoPlayer.classList.remove('active');

            mainVideo.src = '';
        }
    });

    videoPlayer.addEventListener('click', function(e) {
        if (e.target === videoPlayer) {
            mainVideo.pause();

            videoControl.style.display = 'flex';
            setTimeout(() => {
                videoControl.style.opacity = '1';
            }, 10);

            videoPlayer.classList.remove('active');

            mainVideo.src = '';
        }
    });
});