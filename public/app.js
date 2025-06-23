let names = [];
let availableNames = [];
let allTimeWinners = [];
let currentRoundWinners = [];
let isSpinning = false;
let spinInterval;
let fileName = '';

// Audio variables
let audioContext;
let audioElements = {};
let currentBackgroundMusic = null;
let musicInitialized = false;

const fileInput = document.getElementById('file-input');
const fileStatus = document.getElementById('file-status');
const winnersCount = document.getElementById('winners-count');
const nameDisplay = document.getElementById('name-display');
const mainResultCard = document.getElementById('main-result-card');
const winnerCardsContainer = document.getElementById('winner-cards-container');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const resetBtn = document.getElementById('reset-btn');
const statusInfo = document.getElementById('status-info');

// Initialize audio system
function initializeAudio() {
    if (musicInitialized) return;
    
    try {
        // Create audio context
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create audio elements for different sounds
        audioElements = {
            background: createAudioElement(),
            spinning: createAudioElement(),
            victory: createAudioElement(),
            buttonClick: createAudioElement(),
            notification: createAudioElement()
        };
        
        // Generate background music (ambient/tense)
        generateBackgroundMusic();
        
        // Generate spinning music (fast-paced)
        generateSpinningMusic();
        
        // Generate victory music (triumphant)
        generateVictoryMusic();
        
        // Generate sound effects
        generateSoundEffects();
        
        musicInitialized = true;
        
        // Start background music
        playBackgroundMusic();
        
    } catch (error) {
        console.log('Audio initialization failed, continuing without sound:', error);
    }
}

function createAudioElement() {
    const audio = document.createElement('audio');
    audio.preload = 'auto';
    return audio;
}

function generateBackgroundMusic() {
    // Create a tense, ambient background track
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1024;
    canvas.height = 1024;
    
    // Generate audio using Web Audio API
    if (audioContext) {
        const duration = 30; // 30 seconds loop
        const sampleRate = audioContext.sampleRate;
        const buffer = audioContext.createBuffer(2, sampleRate * duration, sampleRate);
        
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
            const channelData = buffer.getChannelData(channel);
            
            for (let i = 0; i < channelData.length; i++) {
                const time = i / sampleRate;
                
                // Create ambient drone with multiple frequencies
                let sample = 0;
                sample += Math.sin(2 * Math.PI * 55 * time) * 0.1; // Low bass
                sample += Math.sin(2 * Math.PI * 110 * time) * 0.05; // Bass harmonic
                sample += Math.sin(2 * Math.PI * 220 * time) * 0.03; // Mid
                
                // Add some tension with dissonant intervals
                sample += Math.sin(2 * Math.PI * 233 * time) * 0.02; // Slightly off
                
                // Add subtle rhythmic pulse
                const pulse = Math.sin(2 * Math.PI * 0.5 * time) * 0.5 + 0.5;
                sample *= (0.7 + pulse * 0.3);
                
                // Add some noise for texture
                sample += (Math.random() - 0.5) * 0.01;
                
                // Apply envelope to avoid clicks
                const fadeTime = 0.1;
                if (time < fadeTime) {
                    sample *= time / fadeTime;
                } else if (time > duration - fadeTime) {
                    sample *= (duration - time) / fadeTime;
                }
                
                channelData[i] = sample * 0.3; // Overall volume
            }
        }
        
        // Convert buffer to blob URL
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        audioElements.background.src = bufferToWav(buffer);
        audioElements.background.loop = true;
        audioElements.background.volume = 0.4;
    }
}

function generateSpinningMusic() {
    if (audioContext) {
        const duration = 10; // 10 seconds loop
        const sampleRate = audioContext.sampleRate;
        const buffer = audioContext.createBuffer(2, sampleRate * duration, sampleRate);
        
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
            const channelData = buffer.getChannelData(channel);
            
            for (let i = 0; i < channelData.length; i++) {
                const time = i / sampleRate;
                
                // Create energetic spinning sound
                let sample = 0;
                
                // Fast arpeggiated pattern
                const noteFreq = 440 * Math.pow(2, Math.floor((time * 8) % 4) / 12);
                sample += Math.sin(2 * Math.PI * noteFreq * time) * 0.2;
                
                // Add harmonics
                sample += Math.sin(2 * Math.PI * noteFreq * 1.5 * time) * 0.1;
                sample += Math.sin(2 * Math.PI * noteFreq * 2 * time) * 0.05;
                
                // Add driving rhythm
                const beat = Math.sin(2 * Math.PI * 4 * time);
                sample += beat * beat * 0.1;
                
                // Add some spinning effect with frequency modulation
                const spinRate = 2 + Math.sin(time * 0.5) * 0.5;
                sample += Math.sin(2 * Math.PI * 880 * time + Math.sin(2 * Math.PI * spinRate * time) * 2) * 0.15;
                
                // Apply envelope
                const fadeTime = 0.1;
                if (time < fadeTime) {
                    sample *= time / fadeTime;
                } else if (time > duration - fadeTime) {
                    sample *= (duration - time) / fadeTime;
                }
                
                channelData[i] = sample * 0.6;
            }
        }
        
        audioElements.spinning.src = bufferToWav(buffer);
        audioElements.spinning.loop = true;
        audioElements.spinning.volume = 0.7;
    }
}

function generateVictoryMusic() {
    if (audioContext) {
        const duration = 5; // 5 seconds
        const sampleRate = audioContext.sampleRate;
        const buffer = audioContext.createBuffer(2, sampleRate * duration, sampleRate);
        
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
            const channelData = buffer.getChannelData(channel);
            
            for (let i = 0; i < channelData.length; i++) {
                const time = i / sampleRate;
                
                // Create triumphant fanfare
                let sample = 0;
                
                // Major chord progression
                const chordTime = Math.floor(time * 2); // 2 chords per second
                const baseFreq = chordTime % 2 === 0 ? 261.63 : 329.63; // C to E
                
                sample += Math.sin(2 * Math.PI * baseFreq * time) * 0.3;
                sample += Math.sin(2 * Math.PI * baseFreq * 1.25 * time) * 0.2; // Third
                sample += Math.sin(2 * Math.PI * baseFreq * 1.5 * time) * 0.2; // Fifth
                
                // Add trumpet-like harmonics
                sample += Math.sin(2 * Math.PI * baseFreq * 2 * time) * 0.1;
                sample += Math.sin(2 * Math.PI * baseFreq * 3 * time) * 0.05;
                
                // Add celebration bells
                if (Math.floor(time * 4) % 2 === 0) {
                    sample += Math.sin(2 * Math.PI * 1047 * time) * 0.1 * Math.exp(-time * 2);
                }
                
                // Apply envelope
                const envelope = Math.min(1, Math.max(0, 1 - time / duration));
                sample *= envelope;
                
                channelData[i] = sample * 0.8;
            }
        }
        
        audioElements.victory.src = bufferToWav(buffer);
        audioElements.victory.volume = 0.8;
    }
}

function generateSoundEffects() {
    // Generate button click sound
    if (audioContext) {
        const duration = 0.1;
        const sampleRate = audioContext.sampleRate;
        const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const channelData = buffer.getChannelData(0);
        
        for (let i = 0; i < channelData.length; i++) {
            const time = i / sampleRate;
            let sample = Math.sin(2 * Math.PI * 800 * time) * Math.exp(-time * 50);
            sample += Math.sin(2 * Math.PI * 400 * time) * Math.exp(-time * 30) * 0.5;
            channelData[i] = sample * 0.3;
        }
        
        audioElements.buttonClick.src = bufferToWav(buffer);
        audioElements.buttonClick.volume = 0.5;
        
        // Generate notification sound
        const notifBuffer = audioContext.createBuffer(1, sampleRate * 0.5, sampleRate);
        const notifData = notifBuffer.getChannelData(0);
        
        for (let i = 0; i < notifData.length; i++) {
            const time = i / sampleRate;
            let sample = Math.sin(2 * Math.PI * 523 * time) * Math.exp(-time * 3); // C5
            sample += Math.sin(2 * Math.PI * 659 * time) * Math.exp(-time * 3) * 0.7; // E5
            notifData[i] = sample * 0.4;
        }
        
        audioElements.notification.src = bufferToWav(notifBuffer);
        audioElements.notification.volume = 0.6;
    }
}

// Convert AudioBuffer to WAV blob URL
function bufferToWav(buffer) {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);
    
    // Convert float samples to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < length; i++) {
        for (let channel = 0; channel < numberOfChannels; channel++) {
            const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
            view.setInt16(offset, sample * 0x7FFF, true);
            offset += 2;
        }
    }
    
    const blob = new Blob([arrayBuffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
}

function playBackgroundMusic() {
    if (audioElements.background && musicInitialized) {
        stopAllMusic();
        currentBackgroundMusic = audioElements.background;
        audioElements.background.currentTime = 0;
        audioElements.background.play().catch(e => console.log('Background music play failed:', e));
    }
}

function playSpinningMusic() {
    if (audioElements.spinning && musicInitialized) {
        stopAllMusic();
        currentBackgroundMusic = audioElements.spinning;
        audioElements.spinning.currentTime = 0;
        audioElements.spinning.play().catch(e => console.log('Spinning music play failed:', e));
    }
}

function playVictoryMusic() {
    if (audioElements.victory && musicInitialized) {
        stopAllMusic();
        audioElements.victory.currentTime = 0;
        audioElements.victory.play().catch(e => console.log('Victory music play failed:', e));
        
        // Return to background music after victory sound
        setTimeout(() => {
            playBackgroundMusic();
        }, 5000);
    }
}

function playButtonClick() {
    if (audioElements.buttonClick && musicInitialized) {
        audioElements.buttonClick.currentTime = 0;
        audioElements.buttonClick.play().catch(e => console.log('Button click play failed:', e));
    }
}

function playNotification() {
    if (audioElements.notification && musicInitialized) {
        audioElements.notification.currentTime = 0;
        audioElements.notification.play().catch(e => console.log('Notification play failed:', e));
    }
}

function stopAllMusic() {
    Object.values(audioElements).forEach(audio => {
        if (audio && !audio.paused) {
            audio.pause();
        }
    });
}

// File handling
fileInput.addEventListener('change', handleFileSelect);

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Initialize audio on first user interaction
    if (!musicInitialized) {
        initializeAudio();
    }
    
    playNotification();

    fileName = file.name;
    const reader = new FileReader();

    reader.onload = function(e) {
        const content = e.target.result;
        names = parseFileContent(content, file.name);
        
        if (names.length > 0) {
            availableNames = names.filter(name => !allTimeWinners.includes(name));
            
            fileStatus.textContent = `✅ Loaded ${names.length} names from ${fileName}`;
            fileStatus.classList.add('show');
            
            nameDisplay.textContent = `Ready to spin!`;
            
            statusInfo.textContent = `${availableNames.length} names available • ${allTimeWinners.length} permanently won`;
            
            startBtn.disabled = availableNames.length === 0;
            resetBtn.disabled = false;
            
            updateWinnersCountMax();
            updateDisplay();
        } else {
            fileStatus.textContent = '❌ No valid names found in file';
            fileStatus.classList.add('show');
            statusInfo.textContent = 'Please upload a valid file with names';
        }
    };

    reader.readAsText(file);
}

function parseFileContent(content, filename) {
    const lines = content.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

    if (filename.toLowerCase().endsWith('.csv')) {
        return lines.flatMap(line => {
            const values = line.split(',').map(val => val.trim().replace(/"/g, ''));
            return values.filter(val => val.length > 0);
        });
    } else {
        return lines;
    }
}

function updateWinnersCountMax() {
    winnersCount.max = Math.min(availableNames.length, 50);
    if (parseInt(winnersCount.value) > availableNames.length) {
        winnersCount.value = availableNames.length;
    }
}

function updateDisplay() {
    if (currentRoundWinners.length > 0) {
        mainResultCard.classList.add('hidden');
        updateWinnerCards();
    } else {
        mainResultCard.classList.remove('hidden');
        winnerCardsContainer.innerHTML = '';
    }
}

function updateWinnerCards() {
    winnerCardsContainer.innerHTML = '';
    
    currentRoundWinners.forEach((winner, index) => {
        const winnerCard = document.createElement('div');
        winnerCard.className = 'winner-card';
        winnerCard.style.animationDelay = `${index * 0.2}s`;
        
        winnerCard.innerHTML = `
            <div class="result-label">
                <span>🏆</span>
                <span>Pemenang #${index + 1}</span>
            </div>
            <div class="winner-name">${winner}</div>
        `;
        
        winnerCardsContainer.appendChild(winnerCard);
    });
}

function startSpinning() {
    if (availableNames.length === 0) {
        statusInfo.textContent = 'No more names available!';
        return;
    }

    const targetWinners = parseInt(winnersCount.value);
    if (targetWinners > availableNames.length) {
        statusInfo.textContent = 'Not enough names for the requested winners!';
        return;
    }

    // Initialize audio if not already done
    if (!musicInitialized) {
        initializeAudio();
    }
    
    playButtonClick();
    
    // Start spinning music after a short delay
    setTimeout(() => {
        playSpinningMusic();
    }, 100);

    isSpinning = true;
    currentRoundWinners = [];
    
    mainResultCard.classList.remove('hidden');
    winnerCardsContainer.innerHTML = '';
    nameDisplay.className = 'spinning';
    
    startBtn.disabled = true;
    stopBtn.disabled = false;
    resetBtn.disabled = true;

    spinInterval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * availableNames.length);
        nameDisplay.textContent = availableNames[randomIndex];
    }, 50);

    statusInfo.textContent = `🎵 Spinning for ${targetWinners} winner(s)... Press Stop to pick!`;
}

function stopSpinning() {
    if (!isSpinning) return;

    playButtonClick();
    
    clearInterval(spinInterval);
    isSpinning = false;

    const targetWinners = parseInt(winnersCount.value);
    
    const shuffled = [...availableNames].sort(() => 0.5 - Math.random());
    currentRoundWinners = shuffled.slice(0, targetWinners);
    
    allTimeWinners.push(...currentRoundWinners);
    
    currentRoundWinners.forEach(winner => {
        const index = availableNames.indexOf(winner);
        if (index > -1) {
            availableNames.splice(index, 1);
        }
    });

    nameDisplay.textContent = `${currentRoundWinners.length} Winners Selected!`;
    nameDisplay.className = 'winner';

    // Play victory music
    setTimeout(() => {
        playVictoryMusic();
    }, 200);

    updateDisplay();
    updateStatus();

    startBtn.disabled = availableNames.length === 0;
    stopBtn.disabled = true;
    resetBtn.disabled = false;
}

function updateStatus() {
    if (currentRoundWinners.length > 0) {
        statusInfo.textContent = `🎉 ${currentRoundWinners.length} winner(s) selected! • ${availableNames.length} names remaining • ${allTimeWinners.length} total won`;
    } else if (availableNames.length > 0) {
        statusInfo.textContent = `${availableNames.length} names available • ${allTimeWinners.length} permanently won • Ready to pick!`;
    } else {
        statusInfo.textContent = `All names have been selected as winners! • ${allTimeWinners.length} total winners`;
    }
}

function resetGame() {
    playButtonClick();
    
    clearInterval(spinInterval);
    isSpinning = false;
    currentRoundWinners = [];

    // Return to background music
    setTimeout(() => {
        playBackgroundMusic();
    }, 100);

    if (names.length > 0) {
        availableNames = names.filter(name => !allTimeWinners.includes(name));
        nameDisplay.textContent = `Ready to spin!`;
    } else {
        nameDisplay.textContent = 'Upload a file to get started';
        nameDisplay.className = 'ready';
    }
    
    updateDisplay();
    updateWinnersCountMax();

    startBtn.disabled = availableNames.length === 0 || names.length === 0;
    stopBtn.disabled = true;
    resetBtn.disabled = names.length === 0;

    updateStatus();
}

// Event listeners
startBtn.addEventListener('click', startSpinning);
stopBtn.addEventListener('click', stopSpinning);
resetBtn.addEventListener('click', resetGame);

document.addEventListener('keydown', (e) => {
    if (e.target.tagName.toLowerCase() === 'input') return;
    
    switch(e.key.toLowerCase()) {
        case 'k':
            e.preventDefault();
            if (!startBtn.disabled) startSpinning();
            break;
        case 'l':
            e.preventDefault();
            if (!stopBtn.disabled) stopSpinning();
            break;
        case 'r':
            e.preventDefault();
            if (!resetBtn.disabled) resetGame();
            break;
    }
});

winnersCount.addEventListener('change', () => {
    const value = parseInt(winnersCount.value);
    const maxValue = Math.min(availableNames.length, 50);
    
    if (value > maxValue) {
        winnersCount.value = maxValue;
    } else if (value < 1) {
        winnersCount.value = 1;
    }
    
    updateStatus();
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    resetGame();
});

// Initialize audio on first user interaction
document.addEventListener('click', () => {
    if (!musicInitialized) {
        initializeAudio();
    }
}, { once: true });