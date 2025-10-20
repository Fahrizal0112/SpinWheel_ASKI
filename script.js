class SpinWheel {
    constructor() {
        this.wheel = document.getElementById('wheel');
        this.spinBtn = document.getElementById('spinBtn');
        this.modal = document.getElementById('prizeModal');
        this.closeModal = document.getElementById('closeModal');
        
        this.isSpinning = false;
        this.currentRotation = 0;
        
        // Data hadiah dan pertanyaan
        this.prizes = [
            {
                name: "Smartphone",
                icon: "📱",
                question: "Apa kepanjangan dari 'RAM' dalam komputer?",
                options: ["Random Access Memory", "Read Access Memory", "Rapid Access Memory", "Real Access Memory"],
                correct: 0
            },
            {
                name: "Voucher Belanja 100k",
                icon: "🛍️",
                question: "Siapa presiden pertama Indonesia?",
                options: ["Soekarno", "Soeharto", "B.J. Habibie", "Megawati"],
                correct: 0
            },
            {
                name: "Headphone Wireless",
                icon: "🎧",
                question: "Planet terdekat dengan matahari adalah?",
                options: ["Venus", "Mars", "Merkurius", "Bumi"],
                correct: 2
            },
            {
                name: "Tas Branded",
                icon: "👜",
                question: "Berapa jumlah provinsi di Indonesia saat ini?",
                options: ["32", "33", "34", "38"],
                correct: 3
            },
            {
                name: "Sepatu Sneakers",
                icon: "👟",
                question: "Apa ibu kota Australia?",
                options: ["Sydney", "Melbourne", "Canberra", "Perth"],
                correct: 2
            },
            {
                name: "Jam Tangan",
                icon: "⌚",
                question: "Siapa penemu lampu pijar?",
                options: ["Thomas Edison", "Nikola Tesla", "Alexander Bell", "Albert Einstein"],
                correct: 0
            },
            {
                name: "Kamera Digital",
                icon: "📷",
                question: "Apa gas yang paling banyak di atmosfer bumi?",
                options: ["Oksigen", "Karbon Dioksida", "Nitrogen", "Hidrogen"],
                correct: 2
            },
            {
                name: "Laptop Gaming",
                icon: "💻",
                isBigPrize: true,
                question: "Siapa yang menciptakan World Wide Web (WWW)?",
                options: ["Bill Gates", "Steve Jobs", "Tim Berners-Lee", "Mark Zuckerberg"],
                correct: 2
            },
            {
                name: "Power Bank",
                icon: "🔋",
                question: "Apa nama mata uang Jepang?",
                options: ["Won", "Yuan", "Yen", "Ringgit"],
                correct: 2
            },
            {
                name: "Speaker Bluetooth",
                icon: "🔊",
                question: "Berapa jumlah benua di dunia?",
                options: ["5", "6", "7", "8"],
                correct: 2
            }
        ];
        
        this.init();
    }
    
    init() {
        this.spinBtn.addEventListener('click', () => this.spin());
        this.closeModal.addEventListener('click', () => this.hideModal());
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideModal();
            }
        });
        
        // Submit answer button
        document.getElementById('submitAnswer').addEventListener('click', () => this.submitAnswer());
        
        // Claim prize button
        document.getElementById('claimPrize').addEventListener('click', () => this.claimPrize());
    }
    
    spin() {
        if (this.isSpinning) return;
        
        this.isSpinning = true;
        this.spinBtn.disabled = true;
        this.spinBtn.innerHTML = '<span>BERPUTAR...</span>';
        
        // Random rotation (multiple full rotations + random angle)
        const minRotation = 1440; // 4 full rotations
        const maxRotation = 2160; // 6 full rotations
        const randomRotation = Math.random() * (maxRotation - minRotation) + minRotation;
        
        this.currentRotation += randomRotation;
        this.wheel.style.transform = `rotate(${this.currentRotation}deg)`;
        
        // Calculate which segment was selected
        setTimeout(() => {
            const normalizedRotation = this.currentRotation % 360;
            const segmentAngle = 360 / 10; // 10 segments
            const selectedSegment = Math.floor((360 - normalizedRotation + segmentAngle/2) / segmentAngle) % 10;
            
            this.showPrize(selectedSegment);
            this.resetSpinButton();
        }, 4000);
    }
    
    resetSpinButton() {
        this.isSpinning = false;
        this.spinBtn.disabled = false;
        this.spinBtn.innerHTML = '<span>PUTAR</span>';
    }
    
    showPrize(segmentIndex) {
        const prize = this.prizes[segmentIndex];
        
        // Update modal content
        document.getElementById('prizeIcon').textContent = prize.icon;
        document.getElementById('prizeName').textContent = prize.name;
        
        if (prize.isBigPrize) {
            document.getElementById('prizeTitle').textContent = '🎉 HADIAH BESAR! 🎉';
            document.getElementById('prizeText').textContent = 'Selamat! Anda mendapatkan HADIAH BESAR:';
            document.getElementById('prizeName').style.color = '#FFD700';
            document.getElementById('prizeName').style.fontSize = '28px';
        } else {
            document.getElementById('prizeTitle').textContent = 'Selamat!';
            document.getElementById('prizeText').textContent = 'Anda mendapatkan hadiah:';
            document.getElementById('prizeName').style.color = '#667eea';
            document.getElementById('prizeName').style.fontSize = '24px';
        }
        
        // Setup question
        this.setupQuestion(prize);
        
        // Show modal
        this.showModal();
    }
    
    setupQuestion(prize) {
        document.getElementById('question').textContent = prize.question;
        
        const optionsContainer = document.getElementById('answerOptions');
        optionsContainer.innerHTML = '';
        
        prize.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'answer-option';
            optionElement.textContent = option;
            optionElement.dataset.index = index;
            
            optionElement.addEventListener('click', () => {
                // Remove previous selection
                document.querySelectorAll('.answer-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                // Add selection to clicked option
                optionElement.classList.add('selected');
            });
            
            optionsContainer.appendChild(optionElement);
        });
        
        // Store current prize for answer checking
        this.currentPrize = prize;
        
        // Reset sections
        document.querySelector('.question-section').style.display = 'block';
        document.getElementById('resultSection').style.display = 'none';
    }
    
    submitAnswer() {
        const selectedOption = document.querySelector('.answer-option.selected');
        
        if (!selectedOption) {
            alert('Silakan pilih jawaban terlebih dahulu!');
            return;
        }
        
        const selectedIndex = parseInt(selectedOption.dataset.index);
        const isCorrect = selectedIndex === this.currentPrize.correct;
        
        // Hide question section
        document.querySelector('.question-section').style.display = 'none';
        
        // Show result section
        const resultSection = document.getElementById('resultSection');
        const resultText = document.getElementById('resultText');
        
        resultSection.style.display = 'block';
        
        if (isCorrect) {
            resultSection.className = 'result-section correct';
            resultText.textContent = '🎉 Jawaban Benar! Anda berhak mendapatkan hadiah ini!';
            document.getElementById('claimPrize').style.display = 'inline-block';
        } else {
            resultSection.className = 'result-section incorrect';
            resultText.textContent = `❌ Jawaban Salah! Jawaban yang benar adalah: ${this.currentPrize.options[this.currentPrize.correct]}. Silakan coba lagi!`;
            document.getElementById('claimPrize').style.display = 'none';
        }
    }
    
    claimPrize() {
        alert(`🎁 Selamat! Hadiah "${this.currentPrize.name}" akan segera diproses. Tim kami akan menghubungi Anda!`);
        this.hideModal();
    }
    
    showModal() {
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    hideModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Initialize the spin wheel when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SpinWheel();
});

// Add some fun animations
document.addEventListener('DOMContentLoaded', () => {
    // Add floating animation to title
    const title = document.querySelector('h1');
    title.style.animation = 'float 3s ease-in-out infinite';
    
    // Add CSS for floating animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
    `;
    document.head.appendChild(style);
});