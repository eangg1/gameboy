let currentScreen = 'loading';
let tetrisGame = null;
let gameScore = 0;
let gameLevel = 1;
let gameLines = 0;
let typewriterInterval = null;
let isTyping = false;
let currentPhotoIndex = 0;
let currentMusicIndex = 0;
let isPlaying = false;
let playbackInterval = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    showScreen('loading');
    simulateLoading();
    addEventListeners();
    initializeTetris();
}

function simulateLoading() {
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.querySelector('.progress-text');
    const loadingText = document.querySelector('.loading-text');
    const loadingScreen = document.getElementById('loading-screen');
    
    let progress = 0;
    const loadingMessages = [
        '&gt; INITIALIZING..._',
        '&gt; LOADING MEMORIES..._',
        '&gt; PREPARING SURPRISE..._',
        '&gt; ALMOST READY..._',
        '&gt; LOADING COMPLETE!_'
    ];
    
    let messageIndex = 0;
    
    const interval = setInterval(() => {
        progress += Math.random() * 15 + 5; 
        
        if (progress > 100) progress = 100;
        
        progressFill.style.width = progress + '%';
        progressText.textContent = Math.floor(progress) + '%';
        
        const newMessageIndex = Math.floor((progress / 100) * (loadingMessages.length - 1));
        if (newMessageIndex !== messageIndex && newMessageIndex < loadingMessages.length) {
            messageIndex = newMessageIndex;
            
            loadingText.style.opacity = '0';
            
            setTimeout(() => {
                loadingText.innerHTML = loadingMessages[messageIndex];
                loadingText.style.opacity = '1';
            }, 200);
        }
        
        if (progress >= 100) {
            clearInterval(interval);
            
            loadingScreen.classList.add('loading-complete');
            
            setTimeout(() => {
                transitionToMainScreen();
            }, 1000);
        }
    }, 200);
}

function transitionToMainScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const mainScreen = document.getElementById('main-screen');
    
    loadingScreen.classList.add('fade-out');
    
    setTimeout(() => {
        loadingScreen.classList.remove('active', 'fade-out', 'loading-complete');
        
        mainScreen.classList.add('active', 'screen-entering');
        currentScreen = 'main';
        
        setTimeout(() => {
            initializeMainScreen();
        }, 100);
        
        setTimeout(() => {
            mainScreen.classList.remove('screen-entering');
        }, 1200);
        
    }, 600);
}

function initializeMainScreen() {
    const menuButtons = document.querySelectorAll('.menu-btn');
    const startBtn = document.querySelector('.start-btn');
    
    menuButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
    
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    }
    
    menuButtons.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
}

function showScreen(screenName) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
    
    const targetScreen = document.getElementById(screenName + '-screen');
    if (targetScreen) {
        targetScreen.classList.add('active');
        currentScreen = screenName;
        
        switch(screenName) {
            case 'message':
                setTimeout(() => {
                    initializeMessage();
                }, 100);
                break;
            case 'gallery':
                setTimeout(() => {
                    initializeGallery();
                }, 100);
                break;
            case 'tetris':
                setTimeout(() => {
                    if (tetrisGame && !tetrisGame.gameRunning) {
                        startTetrisGame();
                    }
                }, 100);
                break;
        }
    }
}

function initializeMessage() {
    if (typewriterInterval) {
        clearInterval(typewriterInterval);
        typewriterInterval = null;
    }
    
    const messageScreen = document.getElementById('message-screen');
    if (!messageScreen) return;
    
    const pageScreen = messageScreen.querySelector('.page-screen');
    if (pageScreen) {
        pageScreen.innerHTML = `
            <div class="page-header">Message</div>
            <div class="message-content">
                <!-- Content will be populated by typewriter -->
            </div>
            <button class="skip-btn">SKIP</button>
        `;
        
        const skipBtn = pageScreen.querySelector('.skip-btn');
        if (skipBtn) {
            skipBtn.addEventListener('click', skipTypewriter);
        }
    }
    
    setTimeout(() => {
        startTypewriter();
    }, 300);
}

function startTypewriter() {
    const messageContent = document.querySelector('.message-content');
    if (!messageContent) return;
    
    const fullMessage = `haloo ara a nya 16 kali, kata ade kamu.

    selamat hbd yg keberapa gatau dah.

    kadang aku masih suka mikir, lucu juga ya, kita bisa kenal dari game rosblok. awalnya cuma sama-sama main, ketemu di server random, ngobrol sekadarnya. malah jadi temen beneran (kita temenan kan?). ga semua orang yg ketemu di dunia maya bisa jadi temen.

    di umur yg baru ini, aku doain kamu supaya diberi kesehatan yg baik fisik maupun mental, semoga bisa dikasih pekerjaan yg lebih baik, gaji 20juta sebulan, lingkungan baik dan atasan yg baik, semoga cepet dapet pasangan, jangan lupa undang yak biar aku bisa ngerasain kondangan di nikahan temen aku.

    semoga kamu selalu dikelilingi orang-orang yg baik, yg ada buat kamu bukan cuma pas lagi seneng doang, tapi juga pas lagi capek. dan semoga rezeki kamu lancar, tabungan aman, dan kamu bisa beli hal-hal yg kamu pengenin tanpa harus mikir dua kali.

    terakhir, semoga kamu tetap jadi diri kamu sendiri: apa adanya, nyebelin, tukang rusuh, sering matiin streak tiktok.

    sekali lagi, selamat ulang tahun ara a nya 16 kali, semoga tahun ini jadi tahun yg paling baik buat kamu.`;

    messageContent.innerHTML = '';
    let charIndex = 0;
    isTyping = true;
    
    if (typewriterInterval) {
        clearInterval(typewriterInterval);
    }
    
    typewriterInterval = setInterval(() => {
        if (charIndex < fullMessage.length) {
            const char = fullMessage[charIndex];
            if (char === '\n') {
                messageContent.innerHTML += '<br>';
            } else {
                messageContent.innerHTML += char;
            }
            charIndex++;
            messageContent.scrollTop = messageContent.scrollHeight;
        } else {
            clearInterval(typewriterInterval);
            isTyping = false;
        }
    }, 50);
}

function skipTypewriter() {
    if (isTyping && typewriterInterval) {
        clearInterval(typewriterInterval);
        const messageContent = document.querySelector('.message-content');
        if (messageContent) {
            const fullMessage = `haloo ara a nya 16 kali, kata ade kamu.<br><br>selamat hbd yg keberapa gatau dah.<br><br>kadang aku masih suka mikir, lucu juga ya, kita bisa kenal dari game rosblok. awalnya cuma sama-sama main, ketemu di server random, ngobrol sekadarnya. malah jadi temen beneran (kita temenan kan?). ga semua orang yg ketemu di dunia maya bisa jadi temen.<br><br>di umur yg baru ini, aku doain kamu supaya diberi kesehatan yg baik fisik maupun mental, semoga bisa dikasih pekerjaan yg lebih baik, gaji 20juta sebulan, lingkungan baik dan atasan yg baik, semoga cepet dapet pasangan, jangan lupa undang yak biar aku bisa ngerasain kondangan di nikahan temen aku.<br><br>semoga kamu selalu dikelilingi orang-orang yg baik, yg ada buat kamu bukan cuma pas lagi seneng doang, tapi juga pas lagi capek. dan semoga rezeki kamu lancar, tabungan aman, dan kamu bisa beli hal-hal yg kamu pengenin tanpa harus mikir dua kali.<br><br>terakhir, semoga kamu tetap jadi diri kamu sendiri: apa adanya, nyebelin, tukang rusuh, sering matiin streak tiktok.<br><br>sekali lagi, selamat ulang tahun ara a nya 16 kali, semoga tahun ini jadi tahun yg paling baik buat kamu.`;
            messageContent.innerHTML = fullMessage;
            isTyping = false;
            messageContent.scrollTop = messageContent.scrollHeight;
        }
    }
}

function initializeGallery() {
    const galleryContent = document.querySelector('.gallery-content');
    if (!galleryContent) return;
    
    galleryContent.innerHTML = '';
    
    const galleryHTML = `
        <div class="photobox-header">
            <div class="photobox-dot red"></div>
            <span class="photobox-title">PHOTOBOX</span>
            <div class="photobox-dot green"></div>
        </div>
        <div class="photobox-progress">READY TO PRINT</div>
        <div class="photo-display">
            <div class="photo-placeholder">Press MULAI CETAK to start photo session</div>
        </div>
        <div class="photobox-controls">
            <button class="photo-btn">MULAI CETAK</button>
        </div>
    `;
    
    galleryContent.innerHTML = galleryHTML;
    
    setTimeout(() => {
        const photoBtn = document.querySelector('.photo-btn');
        if (photoBtn) {
            photoBtn.addEventListener('click', startPhotoShow);
            console.log('Photo button found and listener added'); 
        } else {
            console.log('Photo button not found'); 
        }
    }, 100);
}

function startPhotoShow() {
    const photoBtn = document.querySelector('.photo-btn');
    const photoDisplay = document.querySelector('.photo-display'); 
    const progressDiv = document.querySelector('.photobox-progress');
    
    if (!photoBtn || !photoDisplay || !progressDiv) return;
    
    const photos = [
        {
            text: 'Our First Date 💕',
            image: './images/photo1.jpg'
        },
        {
            text: 'Birthday Moment 🎂',
            image: './images/photo2.jpg'
        },
        {
            text: 'Adventure Time 🌟',
            image: './images/photo3.jpg'
        },
        {
            text: 'Cozy Together ❤️',
            image: './images/photo4.jpg'
        },
        {
            text: 'Sweet Memories 🥰',
            image: './images/photo5.jpg'
        },
        {
            text: 'Laugh Together 😂',
            image: './images/photo6.jpg'
        },
        {
            text: 'Perfect Day ☀️',
            image: './images/photo7.jpg'
        },
        {
            text: 'Love Forever 💖',
            image: './images/photo8.jpg'
        }
    ];
    
    console.log('Total photos:', photos.length);
    
    photoBtn.textContent = 'MENCETAK...';
    photoBtn.disabled = true;
    progressDiv.textContent = 'INITIALIZING CAMERA...';
    
    let framesHTML = '';
    for (let i = 0; i < photos.length; i++) {
        framesHTML += `
            <div class="photo-frame" id="frame-${i + 1}">
                <div class="photo-content">READY</div>
            </div>
        `;
    }
    
    const photoStripHTML = `
        <div class="photo-strip">
            <div class="photo-strip-header">PHOTOSTRIP SESSION</div>
            <div class="photo-frames-container">
                ${framesHTML}
            </div>
            <div class="photo-strip-footer">💕 BIRTHDAY MEMORIES 💕</div>
        </div>
        <div class="scroll-indicator">⬇ Scroll Down ⬇</div>
    `;
    
    photoDisplay.innerHTML = photoStripHTML;
    currentPhotoIndex = 0;
    
    let countdown = 3;
    progressDiv.textContent = `GET READY... ${countdown}`;
    
    const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            progressDiv.textContent = `GET READY... ${countdown}`;
        } else {
            clearInterval(countdownInterval);
            progressDiv.textContent = 'SMILE! 📸';
            startPhotoCapture(photos);
        }
    }, 1000);
}

function startPhotoCapture(photos) {
    const progressDiv = document.querySelector('.photobox-progress');
    const photoBtn = document.querySelector('.photo-btn');
    const photoDisplay = document.querySelector('.photo-display');
    const framesContainer = document.querySelector('.photo-frames-container');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    
    console.log('Starting photo capture. Initial currentPhotoIndex:', currentPhotoIndex);
    console.log('Total photos to capture:', photos.length);
    
    const captureInterval = setInterval(() => {
        console.log('=== CAPTURE LOOP ===');
        console.log('Current photo index:', currentPhotoIndex);
        console.log('Photos remaining:', photos.length - currentPhotoIndex);
        
        if (currentPhotoIndex < photos.length) {
            const frameId = `frame-${currentPhotoIndex + 1}`;
            const frame = document.getElementById(frameId);
            
            console.log('Processing frame:', frameId);
            console.log('Photo content:', photos[currentPhotoIndex]);
            
            if (frame) {
                progressDiv.textContent = '✨ FLASH! ✨';
                
                setTimeout(() => {
                    if (framesContainer) {
                        try {
                            const frameTop = frame.offsetTop - framesContainer.offsetTop;
                            const containerHeight = framesContainer.clientHeight;
                            const frameHeight = frame.clientHeight;
                            
                            const scrollPosition = frameTop - (containerHeight / 2) + (frameHeight / 2);
                            
                            framesContainer.scrollTo({
                                top: scrollPosition,
                                behavior: 'smooth'
                            });
                        } catch (error) {
                            console.log('Scroll error:', error);
                            const frameTop = frame.offsetTop - framesContainer.offsetTop;
                            framesContainer.scrollTop = frameTop - (framesContainer.clientHeight / 2);
                        }
                    }
                }, 200);
                
                setTimeout(() => {
                    frame.classList.add('filled');
                    
                    const photo = photos[currentPhotoIndex];
                    frame.innerHTML = `
                        <img src="${photo.image}" alt="${photo.text}" class="photo-image" 
                             onerror="this.style.display='none'; this.nextElementSibling.style.background='linear-gradient(45deg, #ff6b9d, #c44569)';" />
                        <div class="photo-overlay">
                            <div class="photo-content">${photo.text}</div>
                        </div>
                    `;
                    
                    const displayCount = currentPhotoIndex + 1;
                    progressDiv.textContent = `CAPTURED ${displayCount}/${photos.length}`;
                    
                    console.log('Photo captured. Showing:', displayCount, 'of', photos.length);
                    
                    if (currentPhotoIndex < photos.length - 1 && scrollIndicator) {
                        scrollIndicator.style.display = 'block';
                    }
                    
                    currentPhotoIndex++;
                    console.log('Index incremented to:', currentPhotoIndex);
                    
                }, 500);
            } else {
                console.error(`Frame with ID ${frameId} not found`);
                currentPhotoIndex++;
            }
            
        } else {
            console.log('=== ALL PHOTOS COMPLETED ===');
            clearInterval(captureInterval);
            
            if (scrollIndicator) {
                scrollIndicator.style.display = 'none';
            }
            
            setTimeout(() => {
                if (framesContainer) {
                    try {
                        framesContainer.scrollTo({ top: 0, behavior: 'smooth' });
                    } catch (error) {
                        framesContainer.scrollTop = 0;
                    }
                }
            }, 1000);
            
            setTimeout(() => {
                progressDiv.textContent = '🎉 PHOTO STRIP COMPLETE! 🎉';
                photoBtn.textContent = 'CETAK LAGI';
                photoBtn.disabled = false;
                
                photoBtn.removeEventListener('click', startPhotoShow);
                photoBtn.addEventListener('click', startNewSession);
            }, 2000);
        }
    }, 2500);
}

function startNewSession() {
    const photoBtn = document.querySelector('.photo-btn');
    const progressDiv = document.querySelector('.photobox-progress');
    
    console.log('=== STARTING NEW SESSION ===');
    
    progressDiv.textContent = 'READY TO PRINT';
    photoBtn.textContent = 'MULAI CETAK';
    
    photoBtn.removeEventListener('click', startNewSession);
    photoBtn.addEventListener('click', startPhotoShow);
    
    const photoDisplay = document.querySelector('.photo-display');
    if (photoDisplay) {
        photoDisplay.innerHTML = '<div class="photo-placeholder">Press MULAI CETAK to start photo session</div>';
    }
    
    currentPhotoIndex = 0;
    
    console.log('Session reset. Photo index:', currentPhotoIndex);
}


function initializeMusicPlayer() {
    const musicContent = document.querySelector('.music-content');
    if (!musicContent) return;
    
    musicContent.innerHTML = `
        <div class="spotify-container">
            <div class="spotify-header">
                <div class="spotify-logo">♪ Spotify Playlists</div>
            </div>
            <div class="spotify-embed-container">
                <iframe id="spotify-iframe" 
                        style="border-radius:12px" 
                        src="" 
                        width="100%" 
                        height="200" 
                        frameBorder="0" 
                        allowfullscreen="" 
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                        loading="lazy">
                </iframe>
            </div>
            <div class="playlist-controls">
                <button class="playlist-btn active" data-playlist="1">Playlist 1</button>
                <button class="playlist-btn" data-playlist="2">Playlist 2</button>
                <button class="playlist-btn" data-playlist="3">Playlist 3</button>
            </div>
            <div class="music-info">
                <div class="current-playlist">Now Playing: Birthday Special Mix</div>
                <div class="playlist-description">Lagu-lagu spesial untuk hari istimewa kamu ✨</div>
            </div>
        </div>
    `;
    
    addSpotifyPlayerListeners();
    
    loadSpotifyPlaylist(1);
}

function addSpotifyPlayerListeners() {
    const playlistBtns = document.querySelectorAll('.playlist-btn');
    
    playlistBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            playlistBtns.forEach(b => b.classList.remove('active'));
            
            this.classList.add('active');
            
            const playlistNum = parseInt(this.getAttribute('data-playlist'));
            
            loadSpotifyPlaylist(playlistNum);
        });
    });
}

function loadSpotifyPlaylist(playlistNumber) {
    const iframe = document.getElementById('spotify-iframe');
    const currentPlaylist = document.querySelector('.current-playlist');
    const playlistDescription = document.querySelector('.playlist-description');
    
    if (!iframe) return;
    
    const playlists = {
        1: {
            embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWYtQSOiZF6hj?si=0b945793c2934ba1',
            name: 'Birthday Special Mix',
            description: 'Lagu-lagu spesial untuk hari istimewa kamu ✨'
        },
        2: {
            embedUrl: 'https://open.spotify.com/embed/playlist/3gPSenyxZMdB3A54HeEruz?si=6b4dec830d4f4a48',
            name: 'Love Songs Collection',
            description: 'Koleksi lagu cinta terbaik untuk kita ❤️'
        },
        3: {
            embedUrl: 'https://open.spotify.com/embed/playlist/4dlQ4JHE6abxv38aae2HL1?si=95730613199e4dad',
            name: 'Happy Memories',
            description: 'Lagu-lagu yang mengingatkan kenangan indah 🌟'
        }
    };
    
    const selectedPlaylist = playlists[playlistNumber];
    
    if (selectedPlaylist) {
        iframe.src = selectedPlaylist.embedUrl;
        
        if (currentPlaylist) {
            currentPlaylist.textContent = `Now Playing: ${selectedPlaylist.name}`;
        }
        
        if (playlistDescription) {
            playlistDescription.textContent = selectedPlaylist.description;
        }
        
        iframe.style.opacity = '0.5';
        
        iframe.onload = function() {
            this.style.opacity = '1';
        };
    }
}


function initializeTetris() {
    const canvas = document.getElementById('tetris-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    

    const gameContainer = document.querySelector('.tetris-game');
    if (gameContainer) {
        const containerRect = gameContainer.getBoundingClientRect();
        
        const maxWidth = containerRect.width - 15; 
        const maxHeight = containerRect.height - 15; 
        
        const aspectRatio = 1 / 2;
        let canvasWidth = Math.min(maxWidth, maxHeight * aspectRatio);
        let canvasHeight = canvasWidth / aspectRatio;
        
        if (canvasHeight > maxHeight) {
            canvasHeight = maxHeight;
            canvasWidth = canvasHeight * aspectRatio;
        }
        
        canvasWidth = Math.max(canvasWidth, 500);
        canvasHeight = Math.max(canvasHeight, 600);
        
        canvas.width = Math.floor(canvasWidth);
        canvas.height = Math.floor(canvasHeight);
        
        console.log('Container size:', containerRect.width, 'x', containerRect.height);
        console.log('Canvas size:', canvas.width, 'x', canvas.height);
    } else {
        canvas.width = 500; 
        canvas.height = 600; 
    }
    const blockSize = Math.max(Math.floor(canvas.width / 10), 25); 
    const boardHeight = Math.floor(canvas.height / blockSize);
    
    tetrisGame = {
        canvas: canvas,
        ctx: ctx,
        board: createEmptyBoard(10, boardHeight),
        currentPiece: null,
        gameRunning: false,
        dropTime: 0,
        lastTime: 0,
        dropInterval: 1000,
        blockSize: blockSize,
        boardWidth: 10,
        boardHeight: boardHeight
    };
    
    console.log('Block size:', blockSize, 'Board:', tetrisGame.boardWidth, 'x', tetrisGame.boardHeight);
    
    updateTetrisStats();
    drawTetrisBoard();
    addTetrisListeners();
}

function createEmptyBoard(width, height) {
    const board = [];
    for (let y = 0; y < height; y++) {
        board[y] = [];
        for (let x = 0; x < width; x++) {
            board[y][x] = 0;
        }
    }
    return board;
}

function drawTetrisBoard() {
    if (!tetrisGame) return;
    
    const { ctx, canvas, board, blockSize } = tetrisGame;

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;    
    for (let x = 0; x <= tetrisGame.boardWidth; x++) {
        ctx.beginPath();
        ctx.moveTo(x * blockSize, 0);
        ctx.lineTo(x * blockSize, canvas.height);
        ctx.stroke();
    }
    
    for (let y = 0; y <= board.length; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * blockSize);
        ctx.lineTo(canvas.width, y * blockSize);
        ctx.stroke();
    }
    
    for (let y = 0; y < board.length; y++) {
        for (let x = 0; x < board[y].length; x++) {
            if (board[y][x] !== 0) {
                drawBlock(x, y, getBlockColor(board[y][x]));
            }
        }
    }
    
    if (tetrisGame.currentPiece) {
        drawPiece(tetrisGame.currentPiece);
    }
    
    ctx.strokeStyle = '#9bbc0f';
    ctx.lineWidth = 4; 
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
}

function drawBlock(x, y, color) {
    if (!tetrisGame) return;
    
    const { ctx, blockSize } = tetrisGame;
    const padding = Math.max(2, Math.floor(blockSize * 0.08));
    
    ctx.fillStyle = color;
    ctx.fillRect(
        x * blockSize + padding, 
        y * blockSize + padding, 
        blockSize - padding * 2, 
        blockSize - padding * 2
    );
    
    if (blockSize > 20) {
        const effectSize = Math.max(2, Math.floor(blockSize * 0.12));
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(x * blockSize + padding, y * blockSize + padding, blockSize - padding * 2, effectSize);
        ctx.fillRect(x * blockSize + padding, y * blockSize + padding, effectSize, blockSize - padding * 2);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x * blockSize + padding, y * blockSize + blockSize - padding - effectSize, blockSize - padding * 2, effectSize);
        ctx.fillRect(x * blockSize + blockSize - padding - effectSize, y * blockSize + padding, effectSize, blockSize - padding * 2);
        
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(
            x * blockSize + padding, 
            y * blockSize + padding, 
            blockSize - padding * 2, 
            blockSize - padding * 2
        );
    }
}

function drawPiece(piece) {
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                drawBlock(piece.x + x, piece.y + y, getBlockColor(value));
            }
        });
    });
}

function getBlockColor(type) {
    const colors = {
        1: '#ff4757', 
        2: '#2ed573', 
        3: '#3742fa', 
        4: '#ff6b35', 
        5: '#ffa502', 
        6: '#a55eea', 
        7: '#26d0ce'  
    };
    return colors[type] || '#ffffff';
}

function createTetrisPiece() {
    const pieces = [
        { shape: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], x: 3, y: 0 }, // I
        { shape: [[2,2],[2,2]], x: 4, y: 0 }, // O
        { shape: [[0,3,0],[3,3,3],[0,0,0]], x: 3, y: 0 }, // T
        { shape: [[0,4,4],[4,4,0],[0,0,0]], x: 3, y: 0 }, // S
        { shape: [[5,5,0],[0,5,5],[0,0,0]], x: 3, y: 0 }, // Z
        { shape: [[6,0,0],[6,6,6],[0,0,0]], x: 3, y: 0 }, // J
        { shape: [[0,0,7],[7,7,7],[0,0,0]], x: 3, y: 0 }  // L
    ];
    
    return pieces[Math.floor(Math.random() * pieces.length)];
}

function startTetrisGame() {
    if (!tetrisGame) return;
    
    tetrisGame.gameRunning = true;
    tetrisGame.currentPiece = createTetrisPiece();
    gameScore = 0;
    gameLevel = 1;
    gameLines = 0;
    updateTetrisStats();
    
    tetrisGameLoop();
}

function tetrisGameLoop(time = 0) {
    if (!tetrisGame || !tetrisGame.gameRunning) return;
    
    const deltaTime = time - tetrisGame.lastTime;
    tetrisGame.lastTime = time;
    tetrisGame.dropTime += deltaTime;
    
    if (tetrisGame.dropTime > tetrisGame.dropInterval) {
        moveTetrisPiece('down');
        tetrisGame.dropTime = 0;
    }
    
    drawTetrisBoard();
    requestAnimationFrame(tetrisGameLoop);
}

function moveTetrisPiece(direction) {
    if (!tetrisGame || !tetrisGame.currentPiece) return;
    
    const piece = tetrisGame.currentPiece;
    let newX = piece.x;
    let newY = piece.y;
    
    switch(direction) {
        case 'left':
            newX = piece.x - 1;
            break;
        case 'right':
            newX = piece.x + 1;
            break;
        case 'down':
            newY = piece.y + 1;
            break;
    }
    
    if (isValidMove(piece.shape, newX, newY)) {
        piece.x = newX;
        piece.y = newY;
    } else if (direction === 'down') {
        placePiece();
        clearLines();
        tetrisGame.currentPiece = createTetrisPiece();
        
        if (!isValidMove(tetrisGame.currentPiece.shape, tetrisGame.currentPiece.x, tetrisGame.currentPiece.y)) {
            gameOver();
        }
    }
}

function rotateTetrisPiece() {
    if (!tetrisGame || !tetrisGame.currentPiece) return;
    
    const piece = tetrisGame.currentPiece;
    const rotatedShape = rotateMatrix(piece.shape);
    
    if (isValidMove(rotatedShape, piece.x, piece.y)) {
        piece.shape = rotatedShape;
    }
}

function isValidMove(shape, x, y) {
    if (!tetrisGame) return false;
    
    for (let py = 0; py < shape.length; py++) {
        for (let px = 0; px < shape[py].length; px++) {
            if (shape[py][px] !== 0) {
                const newX = x + px;
                const newY = y + py;
                
                // Check boundaries
                if (newX < 0 || newX >= tetrisGame.boardWidth || newY >= tetrisGame.boardHeight) {
                    return false;
                }
                
                // Check collision with placed blocks
                if (newY >= 0 && tetrisGame.board[newY] && tetrisGame.board[newY][newX] !== 0) {
                    return false;
                }
            }
        }
    }
    
    return true;
}

function placePiece() {
    if (!tetrisGame || !tetrisGame.currentPiece) return;
    
    const piece = tetrisGame.currentPiece;
    
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                const boardX = piece.x + x;
                const boardY = piece.y + y;
                if (boardY >= 0 && boardY < tetrisGame.board.length && boardX >= 0 && boardX < 10) {
                    tetrisGame.board[boardY][boardX] = value;
                }
            }
        });
    });
}

function clearLines() {
    if (!tetrisGame) return;
    
    let linesCleared = 0;
    
    for (let y = tetrisGame.board.length - 1; y >= 0; y--) {
        if (tetrisGame.board[y].every(cell => cell !== 0)) {
            tetrisGame.board.splice(y, 1);
            tetrisGame.board.unshift(new Array(tetrisGame.boardWidth).fill(0));
            linesCleared++;
            y++; // Check the same line again
        }
    }
    
    if (linesCleared > 0) {
        gameLines += linesCleared;
        
        // Scoring system
        const lineScores = [0, 40, 100, 300, 1200];
        gameScore += (lineScores[linesCleared] || 0) * gameLevel;
        
        // Level progression
        gameLevel = Math.floor(gameLines / 10) + 1;
        tetrisGame.dropInterval = Math.max(50, 1000 - (gameLevel - 1) * 50);
        
        updateTetrisStats();
    }
}

function rotateMatrix(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const rotated = [];
    
    for (let i = 0; i < cols; i++) {
        rotated[i] = [];
        for (let j = 0; j < rows; j++) {
            rotated[i][j] = matrix[rows - 1 - j][i];
        }
    }
    
    return rotated;
}

function updateTetrisStats() {
    const scoreEl = document.getElementById('score');
    const levelEl = document.getElementById('level');
    const linesEl = document.getElementById('lines');
    
    if (scoreEl) scoreEl.textContent = gameScore;
    if (levelEl) levelEl.textContent = gameLevel;
    if (linesEl) linesEl.textContent = gameLines;
}

function gameOver() {
    if (tetrisGame) {
        tetrisGame.gameRunning = false;
    }
    document.getElementById('game-over-modal').classList.add('active');
}

function resetTetrisGame() {
    if (tetrisGame) {
        tetrisGame.board = createEmptyBoard(tetrisGame.boardWidth, tetrisGame.boardHeight);
        tetrisGame.currentPiece = null;
        tetrisGame.gameRunning = false;
        gameScore = 0;
        gameLevel = 1;
        gameLines = 0;
        updateTetrisStats();
        drawTetrisBoard();
    }
}

window.addEventListener('resize', function() {
    if (currentScreen === 'tetris' && tetrisGame) {
        setTimeout(() => {
            initializeTetris();
        }, 100);
    }
});

function addEventListeners() {
    // Menu buttons
    const menuButtons = document.querySelectorAll('.menu-btn');
    menuButtons.forEach(button => {
        button.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            if (page) {
                showScreen(page);
            }
        });
    });
    
    const backButtons = document.querySelectorAll('.back-btn');
    backButtons.forEach(button => {
        button.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            if (page) {
                showScreen(page);
            }
        });
    });
    
    const startBtn = document.querySelector('.start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            if (currentScreen === 'main') {
                showScreen('message');
            }
        });
    }
    
    const continueButtons = document.querySelectorAll('.continue-btn');
    continueButtons.forEach(button => {
        button.addEventListener('click', function() {
            handleContinueNavigation();
        });
    });
    
    const skipBtn = document.querySelector('.skip-btn');
    if (skipBtn) {
        skipBtn.addEventListener('click', function() {
            skipTypewriter();
        });
    }
    
    const confirmBtn = document.getElementById('confirm-btn');
    const okBtn = document.getElementById('ok-btn');
    
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            document.getElementById('game-over-modal').classList.remove('active');
            document.getElementById('final-message-modal').classList.add('active');
        });
    }
    
    if (okBtn) {
        okBtn.addEventListener('click', function() {
            document.getElementById('final-message-modal').classList.remove('active');
            showScreen('main');
            resetTetrisGame();
        });
    }
    
    document.addEventListener('keydown', function(event) {
        if (currentScreen === 'tetris' && tetrisGame && tetrisGame.gameRunning) {
            switch(event.key) {
                case 'ArrowLeft':
                    event.preventDefault();
                    moveTetrisPiece('left');
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    moveTetrisPiece('right');
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    moveTetrisPiece('down');
                    break;
                case 'ArrowUp':
                case ' ':
                    event.preventDefault();
                    rotateTetrisPiece();
                    break;
            }
        }
    });
}

function addTetrisListeners() {
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');
    const rotateBtn = document.getElementById('rotate-btn');
    
    if (leftBtn) {
        leftBtn.addEventListener('click', function() {
            moveTetrisPiece('left');
        });
    }
    
    if (rightBtn) {
        rightBtn.addEventListener('click', function() {
            moveTetrisPiece('right');
        });
    }
    
    if (rotateBtn) {
        rotateBtn.addEventListener('click', function() {
            rotateTetrisPiece();
        });
    }
}

function handleContinueNavigation() {
    switch(currentScreen) {
        case 'message':
            showScreen('gallery');
            break;
        case 'gallery':
            showScreen('music');
            break;
        default:
            showScreen('main');
    }
}