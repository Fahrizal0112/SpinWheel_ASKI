class SpinWheel {
    constructor() {
        this.canvas = document.getElementById('wheelCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.spinBtn = document.getElementById('spinBtn');
        this.resultDiv = document.getElementById('result');
        this.prizeInput = document.getElementById('prizeInput');
        this.addPrizeBtn = document.getElementById('addPrizeBtn');
        this.prizeListContainer = document.getElementById('prizeListContainer');
        this.resetBtn = document.getElementById('resetBtn');
        this.defaultBtn = document.getElementById('defaultBtn');
        this.clearStorageBtn = document.getElementById('clearStorageBtn');
        this.modal = document.getElementById('winnerModal');
        this.winnerPrize = document.getElementById('winnerPrize');
        this.closeModalBtn = document.getElementById('closeModalBtn');
        this.takeOutBtn = document.getElementById('takeOutBtn');
        this.closeSpan = document.querySelector('.close');
        
        // Store current winning prize for take out functionality
        this.currentWinningPrize = null;

        // Default prizes
        this.defaultPrizes = [
            'HELM GRIN',
            'HELM GRIN',
            'HELM GRIN',
            'HELM GRIN',
            'HELM GRIN',
            'HELM GRIN',
            'HELM GRIN',
            'CAR AIR PURIFIER',
            'CAR AIR PURIFIER',
            'CAR AIR PURIFIER'
        ];

        this.storageKey = 'askiSpinWheelPrizes';
        
        this.prizes = [...this.defaultPrizes];
        this.isSpinning = false;
        this.currentRotation = 0;

        this.init();
    }

    init() {
        this.loadPrizesFromStorage();
        this.drawWheel();
        this.updatePrizeList();
        this.bindEvents();
        this.resultDiv.textContent = 'Klik tombol "PUTAR RODA!" untuk memulai undian';
    }

    bindEvents() {
        this.spinBtn.addEventListener('click', () => this.spin());
        this.addPrizeBtn.addEventListener('click', () => this.addPrize());
        this.prizeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addPrize();
        });
        this.resetBtn.addEventListener('click', () => this.resetPrizes());
        this.defaultBtn.addEventListener('click', () => this.loadDefaultPrizes());
        this.clearStorageBtn.addEventListener('click', () => this.clearStorageAndReset());
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.takeOutBtn.addEventListener('click', () => this.takeOutPrize());
        this.closeSpan.addEventListener('click', () => this.closeModal());
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
    }

    drawWheel() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = 200;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.prizes.length === 0) {
            // Draw empty wheel
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            this.ctx.fillStyle = '#f0f0f0';
            this.ctx.fill();
            this.ctx.strokeStyle = '#cc0000';
            this.ctx.lineWidth = 4;
            this.ctx.stroke();

            // Draw "No Prizes" text
            this.ctx.fillStyle = '#666';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Tidak Ada Hadiah', centerX, centerY);
            return;
        }

        const anglePerPrize = (2 * Math.PI) / this.prizes.length;
        const colors = this.generateColors(this.prizes.length);

        // Draw wheel segments (start from top, under the pointer)
        for (let i = 0; i < this.prizes.length; i++) {
            const startAngle = (i * anglePerPrize) - (Math.PI / 2); // Start from top
            const endAngle = ((i + 1) * anglePerPrize) - (Math.PI / 2);

            // Draw segment
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            this.ctx.closePath();
            this.ctx.fillStyle = colors[i];
            this.ctx.fill();
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();

            // Draw text
            this.ctx.save();
            this.ctx.translate(centerX, centerY);
            this.ctx.rotate(startAngle + anglePerPrize / 2);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.textBaseline = 'middle';
            
            // Wrap text if too long
            const text = this.prizes[i];
            const maxWidth = radius - 20;
            this.wrapText(text, 20, 0, maxWidth, 16);
            
            this.ctx.restore();
        }

        // Draw center circle
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#cc0000';
        this.ctx.fill();
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
    }

    wrapText(text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let lines = [];

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = this.ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && n > 0) {
                lines.push(line);
                line = words[n] + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line);

        // Draw lines
        const startY = y - (lines.length - 1) * lineHeight / 2;
        for (let i = 0; i < lines.length; i++) {
            this.ctx.fillText(lines[i], x, startY + i * lineHeight);
        }
    }

    generateColors(count) {
        const colors = [];
        const baseColors = [
            '#ff4444', '#cc0000', '#ff6666', '#aa0000',
            '#ff8888', '#880000', '#ffaaaa', '#660000'
        ];
        
        for (let i = 0; i < count; i++) {
            colors.push(baseColors[i % baseColors.length]);
        }
        return colors;
    }

    spin() {
        if (this.isSpinning || this.prizes.length === 0) return;

        this.isSpinning = true;
        this.spinBtn.disabled = true;
        this.spinBtn.textContent = 'BERPUTAR...';
        this.resultDiv.textContent = 'Roda sedang berputar...';

        // Calculate random rotation (multiple full rotations + random angle)
        const minRotation = 1440; // 4 full rotations
        const maxRotation = 2160; // 6 full rotations
        const randomRotation = Math.random() * (maxRotation - minRotation) + minRotation;
        
        this.currentRotation += randomRotation;

        // Apply rotation with CSS animation
        this.canvas.style.setProperty('--spin-rotation', `${this.currentRotation}deg`);
        this.canvas.classList.add('spinning');

        // Calculate winner after animation
        setTimeout(() => {
            this.calculateWinner();
            this.canvas.classList.remove('spinning');
            this.isSpinning = false;
            this.spinBtn.disabled = false;
            this.spinBtn.textContent = 'PUTAR RODA!';
        }, 3000);
    }

    calculateWinner() {
        const normalizedRotation = this.currentRotation % 360;
        const anglePerPrize = 360 / this.prizes.length;
        
        // Since wheel rotates clockwise but we want to find which segment is under the pointer,
        // we need to calculate in reverse direction
        // The wheel starts from top (index 0), so we reverse the calculation
        let winnerIndex = Math.floor((360 - normalizedRotation) / anglePerPrize);
        
        // Ensure index is within bounds
        winnerIndex = winnerIndex % this.prizes.length;
        
        // Debug info to help troubleshoot
        console.log(`🎯 Winner Calculation (FIXED):
        - Current rotation: ${this.currentRotation}°
        - Normalized: ${normalizedRotation}°
        - Reversed angle: ${360 - normalizedRotation}°
        - Angle per prize: ${anglePerPrize.toFixed(2)}°
        - Winner index: ${winnerIndex}
        - Winner: "${this.prizes[winnerIndex]}"
        - All prizes: [${this.prizes.map((p, i) => `${i}:"${p}"`).join(', ')}]`);
        
        const winner = this.prizes[winnerIndex];
        this.showWinner(winner);
    }

    showWinner(prize) {
        this.currentWinningPrize = prize;
        this.resultDiv.innerHTML = `🎉 <strong>Pemenang:</strong> ${prize}`;
        this.winnerPrize.textContent = prize;
        this.modal.style.display = 'block';
    }

    takeOutPrize() {
        if (this.currentWinningPrize) {
            // Find and remove the first occurrence of the winning prize
            const prizeIndex = this.prizes.indexOf(this.currentWinningPrize);
            if (prizeIndex !== -1) {
                this.prizes.splice(prizeIndex, 1);
                this.savePrizesToStorage();
                this.updatePrizeList();
                this.drawWheel();
                
                // Update result display
                this.resultDiv.innerHTML = `✅ <strong>Hadiah "${this.currentWinningPrize}" telah diambil!</strong>`;
                
                // Close modal
                this.closeModal();
                
                // Reset current winning prize
                this.currentWinningPrize = null;
            }
        }
    }

    closeModal() {
        this.modal.style.display = 'none';
    }

    addPrize() {
        const prizeName = this.prizeInput.value.trim();
        if (prizeName) {
            this.prizes.push(prizeName);
            this.prizeInput.value = '';
            this.savePrizesToStorage();
            this.updatePrizeList();
            this.drawWheel();
        }
    }

    deletePrize(index) {
        this.prizes.splice(index, 1);
        this.savePrizesToStorage();
        this.updatePrizeList();
        this.drawWheel();
        
        if (this.prizes.length === 0) {
            this.resultDiv.textContent = 'Tambahkan hadiah untuk memulai undian';
        }
    }

    updatePrizeList() {
        this.prizeListContainer.innerHTML = '';
        
        if (this.prizes.length === 0) {
            this.prizeListContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Belum ada hadiah. Tambahkan hadiah untuk memulai.</p>';
            return;
        }

        this.prizes.forEach((prize, index) => {
            const prizeItem = document.createElement('div');
            prizeItem.className = 'prize-item';
            prizeItem.innerHTML = `
                <span class="prize-name">${prize}</span>
                <button class="delete-btn" onclick="spinWheel.deletePrize(${index})">Hapus</button>
            `;
            this.prizeListContainer.appendChild(prizeItem);
        });
    }

    resetPrizes() {
        if (confirm('Apakah Anda yakin ingin menghapus semua hadiah?')) {
            this.prizes = [];
            this.savePrizesToStorage();
            this.updatePrizeList();
            this.drawWheel();
            this.resultDiv.textContent = 'Semua hadiah telah dihapus. Tambahkan hadiah baru untuk memulai.';
        }
    }

    loadDefaultPrizes() {
        if (confirm('Apakah Anda yakin ingin memuat hadiah default? Ini akan mengganti semua hadiah yang ada.')) {
            this.prizes = [...this.defaultPrizes];
            this.savePrizesToStorage();
            this.updatePrizeList();
            this.drawWheel();
            this.resultDiv.textContent = 'Hadiah default telah dimuat. Klik "PUTAR RODA!" untuk memulai undian.';
        }
    }

    // localStorage functions
    savePrizesToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.prizes));
        } catch (error) {
            console.warn('Tidak dapat menyimpan data ke localStorage:', error);
        }
    }

    loadPrizesFromStorage() {
        try {
            const savedPrizes = localStorage.getItem(this.storageKey);
            if (savedPrizes) {
                const parsedPrizes = JSON.parse(savedPrizes);
                if (Array.isArray(parsedPrizes) && parsedPrizes.length > 0) {
                    this.prizes = parsedPrizes;
                }
            }
        } catch (error) {
            console.warn('Tidak dapat memuat data dari localStorage:', error);
            // Fallback to default prizes if loading fails
            this.prizes = [...this.defaultPrizes];
        }
    }

    clearStorage() {
        try {
            localStorage.removeItem(this.storageKey);
        } catch (error) {
            console.warn('Tidak dapat menghapus data dari localStorage:', error);
        }
    }

    clearStorageAndReset() {
        if (confirm('Apakah Anda yakin ingin menghapus semua data tersimpan dan kembali ke hadiah default?')) {
            this.clearStorage();
            this.prizes = [...this.defaultPrizes];
            this.savePrizesToStorage();
            this.updatePrizeList();
            this.drawWheel();
            this.resultDiv.textContent = 'Data tersimpan telah dihapus dan hadiah default dimuat ulang.';
        }
    }
}

// Initialize the spin wheel when page loads
let spinWheel;
document.addEventListener('DOMContentLoaded', () => {
    spinWheel = new SpinWheel();
});

// Add some visual feedback for better UX
document.addEventListener('DOMContentLoaded', () => {
    // Add loading animation
    const style = document.createElement('style');
    style.textContent = `
        .loading {
            opacity: 0.7;
            pointer-events: none;
        }
        
        .prize-item {
            transition: all 0.3s ease;
        }
        
        .prize-item:hover {
            transform: translateX(5px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        
        .form-group input:focus {
            transform: scale(1.02);
        }
        
        .spin-button:hover {
            animation: pulse 1s infinite;
        }
        
        @keyframes pulse {
            0% { transform: scale(1) translateY(-2px); }
            50% { transform: scale(1.05) translateY(-2px); }
            100% { transform: scale(1) translateY(-2px); }
        }
    `;
    document.head.appendChild(style);
});