// Jass Game Client JavaScript

class JassGame {
    constructor() {
        this.ws = null;
        this.gameId = null;
        this.playerId = null;
        this.playerData = {
            name: '',
            character: 1
        };
        this.gameState = null;
        this.selectedCards = [];
        
        // Character data
        this.characters = [
            { id: 1, name: 'Character 1', img: 'character1.png' },
            { id: 2, name: 'Character 2', img: 'character2.png' },
            { id: 3, name: 'Character 3', img: 'character3.png' },
            { id: 4, name: 'Character 4', img: 'character4.png' },
            { id: 5, name: 'Character 5', img: 'character5.png' },
            { id: 6, name: 'Character 6', img: 'character6.png' }
        ];
        
        this.currentCharacterIndex = 0;
        this.init();
    }
    
    init() {
        // Connect to WebSocket server
        this.connectWebSocket();
        
        // Initialize UI event listeners
        this.setupEventListeners();
        
        // Update character display
        this.updateCharacterDisplay();
    }
    
    connectWebSocket() {
        // For GitHub Pages, we'll use a free WebSocket service or your Raspberry Pi
        // Replace with your actual WebSocket server URL
        const wsUrl = 'wss://your-websocket-server.com/jass';
        
        try {
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = () => {
                console.log('Connected to game server');
                this.showToast('Verbunden mit Server', 'success');
            };
            
            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleServerMessage(data);
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.showToast('Verbindungsfehler', 'error');
            };
            
            this.ws.onclose = () => {
                console.log('Disconnected from server');
                this.showToast('Verbindung verloren', 'error');
                // Try to reconnect after 3 seconds
                setTimeout(() => this.connectWebSocket(), 3000);
            };
        } catch (error) {
            console.error('Failed to connect:', error);
            this.showToast('Keine Verbindung zum Server', 'error');
        }
    }
    
    setupEventListeners() {
        // Character selection
        document.getElementById('prev-character').addEventListener('click', () => {
            this.currentCharacterIndex = (this.currentCharacterIndex - 1 + this.characters.length) % this.characters.length;
            this.updateCharacterDisplay();
        });
        
        document.getElementById('next-character').addEventListener('click', () => {
            this.currentCharacterIndex = (this.currentCharacterIndex + 1) % this.characters.length;
            this.updateCharacterDisplay();
        });
        
        // Lobby actions
        document.getElementById('create-party-btn').addEventListener('click', () => this.createParty());
        document.getElementById('join-party-btn').addEventListener('click', () => this.joinParty());
        document.getElementById('join-lobby-btn').addEventListener('click', () => this.joinPublicLobby());
        document.getElementById('leave-lobby-btn').addEventListener('click', () => this.leaveLobby());
        
        // Game actions
        document.getElementById('leave-game-btn').addEventListener('click', () => this.leaveGame());
        document.getElementById('back-to-lobby-btn').addEventListener('click', () => this.backToLobby());
        
        // Trump selection
        document.querySelectorAll('.trump-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const trump = e.currentTarget.dataset.trump;
                this.selectTrump(trump);
            });
        });
        
        // Enter key for inputs
        document.getElementById('player-name-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('join-lobby-btn').click();
            }
        });
        
        document.getElementById('party-code-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('join-party-btn').click();
            }
        });
    }
    
    updateCharacterDisplay() {
        const character = this.characters[this.currentCharacterIndex];
        document.getElementById('character-img').src = `assets/img/jass/${character.img}`;
        document.getElementById('character-name').textContent = character.name;
        this.playerData.character = character.id;
    }
    
    createParty() {
        const name = document.getElementById('player-name-input').value.trim();
        if (!name) {
            this.showToast('Bitte gib deinen Namen ein', 'error');
            return;
        }
        
        this.playerData.name = name;
        this.sendMessage({
            type: 'CREATE_PARTY',
            playerData: this.playerData
        });
    }
    
    joinParty() {
        const name = document.getElementById('player-name-input').value.trim();
        const code = document.getElementById('party-code-input').value.trim().toUpperCase();
        
        if (!name) {
            this.showToast('Bitte gib deinen Namen ein', 'error');
            return;
        }
        
        if (!code) {
            this.showToast('Bitte gib den Party-Code ein', 'error');
            return;
        }
        
        this.playerData.name = name;
        this.sendMessage({
            type: 'JOIN_PARTY',
            partyCode: code,
            playerData: this.playerData
        });
    }
    
    joinPublicLobby() {
        const name = document.getElementById('player-name-input').value.trim();
        if (!name) {
            this.showToast('Bitte gib deinen Namen ein', 'error');
            return;
        }
        
        this.playerData.name = name;
        this.sendMessage({
            type: 'JOIN_PUBLIC_LOBBY',
            playerData: this.playerData
        });
    }
    
    leaveLobby() {
        this.sendMessage({
            type: 'LEAVE_LOBBY',
            playerId: this.playerId,
            gameId: this.gameId
        });
        
        this.showScreen('lobby-screen');
        document.getElementById('waiting-room').style.display = 'none';
        document.querySelector('.player-setup').style.display = 'block';
    }
    
    leaveGame() {
        if (confirm('Willst du das Spiel wirklich verlassen?')) {
            this.sendMessage({
                type: 'LEAVE_GAME',
                playerId: this.playerId,
                gameId: this.gameId
            });
        }
    }
    
    backToLobby() {
        this.showScreen('lobby-screen');
        document.getElementById('game-over-modal').classList.remove('show');
        document.getElementById('waiting-room').style.display = 'none';
        document.querySelector('.player-setup').style.display = 'block';
        this.gameId = null;
        this.gameState = null;
    }
    
    handleServerMessage(data) {
        switch (data.type) {
            case 'PARTY_CREATED':
                this.playerId = data.playerId;
                this.gameId = data.gameId;
                this.showWaitingRoom(data.partyCode);
                break;
                
            case 'JOINED_LOBBY':
                this.playerId = data.playerId;
                this.gameId = data.gameId;
                this.showWaitingRoom(data.partyCode);
                this.updatePlayersList(data.players);
                break;
                
            case 'PLAYER_JOINED':
                this.updatePlayersList(data.players);
                this.showToast(`${data.playerName} ist beigetreten`, 'info');
                break;
                
            case 'PLAYER_LEFT':
                this.updatePlayersList(data.players);
                this.showToast(`${data.playerName} hat verlassen`, 'info');
                break;
                
            case 'GAME_START':
                this.gameState = data.gameState;
                this.startGame();
                break;
                
            case 'GAME_UPDATE':
                this.gameState = data.gameState;
                this.updateGameUI();
                break;
                
            case 'TRUMP_REQUEST':
                if (data.playerId === this.playerId) {
                    this.showTrumpModal();
                }
                break;
                
            case 'TRICK_COMPLETE':
                this.handleTrickComplete(data);
                break;
                
            case 'GAME_OVER':
                this.handleGameOver(data);
                break;
                
            case 'PLAYER_DISCONNECTED':
                this.showToast(`${data.playerName} hat das Spiel verlassen`, 'error');
                this.showScreen('lobby-screen');
                break;
                
            case 'ERROR':
                this.showToast(data.message, 'error');
                break;
        }
    }
    
    showWaitingRoom(partyCode = null) {
        document.querySelector('.player-setup').style.display = 'none';
        document.getElementById('waiting-room').style.display = 'block';
        
        if (partyCode) {
            document.getElementById('party-code-display').style.display = 'block';
            document.getElementById('party-code-value').textContent = partyCode;
        }
    }
    
    updatePlayersList(players) {
        for (let i = 1; i <= 4; i++) {
            const slot = document.getElementById(`player-slot-${i}`);
            
            if (players[i - 1]) {
                const player = players[i - 1];
                slot.classList.add('filled');
                slot.innerHTML = `
                    <div class="player-card">
                        <img src="assets/img/jass/character${player.character}.png" alt="${player.name}">
                        <p>${player.name}</p>
                    </div>
                `;
            } else {
                slot.classList.remove('filled');
                slot.innerHTML = `
                    <div class="empty-slot">
                        <i class="fas fa-user-plus"></i>
                        <p>Wartet...</p>
                    </div>
                `;
            }
        }
    }
    
    startGame() {
        this.showScreen('game-screen');
        this.updateGameUI();
    }
    
    updateGameUI() {
        if (!this.gameState) return;
        
        // Update player positions
        const positions = ['bottom', 'left', 'top', 'right'];
        const myIndex = this.gameState.players.findIndex(p => p.id === this.playerId);
        
        for (let i = 0; i < 4; i++) {
            const playerIndex = (myIndex + i) % 4;
            const player = this.gameState.players[playerIndex];
            const position = positions[i];
            
            // Update player info
            document.getElementById(`${position}-player-name`).textContent = player.name;
            document.getElementById(`${position}-player-avatar`).src = `assets/img/jass/character${player.character}.png`;
            document.getElementById(`${position}-player-score`).textContent = player.score;
            
            // Update player cards
            const cardsContainer = document.getElementById(`${position}-player-cards`);
            cardsContainer.innerHTML = '';
            
            if (position === 'bottom') {
                // Show own cards
                player.hand.forEach((card, index) => {
                    const cardEl = this.createCardElement(card, true);
                    cardEl.addEventListener('click', () => this.playCard(card));
                    cardsContainer.appendChild(cardEl);
                });
            } else {
                // Show hidden cards for other players
                for (let j = 0; j < player.handSize; j++) {
                    const cardEl = this.createCardElement(null, false);
                    cardsContainer.appendChild(cardEl);
                }
            }
            
            // Highlight active player
            const playerInfo = document.querySelector(`#${position}-player-name`).parentElement;
            if (this.gameState.currentPlayer === player.id) {
                playerInfo.classList.add('active');
            } else {
                playerInfo.classList.remove('active');
            }
        }
        
        // Update trump display
        if (this.gameState.trump) {
            document.getElementById('trump-suit').textContent = this.getTrumpDisplayName(this.gameState.trump);
        }
        
        // Update round info
        document.getElementById('round-number').textContent = this.gameState.round;
        document.getElementById('trick-number').textContent = this.gameState.trick;
        
        // Update team scores
        document.getElementById('team1-score').textContent = this.gameState.teamScores[0];
        document.getElementById('team2-score').textContent = this.gameState.teamScores[1];
        
        // Update played cards
        this.updatePlayedCards();
        
        // Highlight playable cards
        if (this.gameState.currentPlayer === this.playerId) {
            this.highlightPlayableCards();
        }
    }
    
    createCardElement(card, isVisible) {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        
        if (isVisible && card) {
            cardEl.dataset.suit = card.suit;
            cardEl.dataset.rank = card.rank;
            // You'll need to add card images
            cardEl.style.backgroundImage = `url('assets/img/jass/cards/${card.suit}_${card.rank}.png')`;
            cardEl.style.backgroundSize = 'cover';
        } else {
            cardEl.classList.add('hidden');
            cardEl.style.backgroundImage = `url('assets/img/jass/cards/back.png')`;
            cardEl.style.backgroundSize = 'cover';
        }
        
        return cardEl;
    }
    
    playCard(card) {
        if (this.gameState.currentPlayer !== this.playerId) {
            this.showToast('Du bist nicht am Zug', 'error');
            return;
        }
        
        if (!this.isCardPlayable(card)) {
            this.showToast('Diese Karte darfst du nicht spielen', 'error');
            return;
        }
        
        this.sendMessage({
            type: 'PLAY_CARD',
            playerId: this.playerId,
            gameId: this.gameId,
            card: card
        });
    }
    
    isCardPlayable(card) {
        // Implement Jass rules here
        const currentTrick = this.gameState.currentTrick;
        
        if (currentTrick.length === 0) {
            // First card of trick - any card is playable
            return true;
        }
        
        const leadSuit = currentTrick[0].card.suit;
        const myCards = this.gameState.players.find(p => p.id === this.playerId).hand;
        const hasSuit = myCards.some(c => c.suit === leadSuit);
        
        // Must follow suit if possible
        if (hasSuit && card.suit !== leadSuit) {
            return false;
        }
        
        // Additional Jass rules would go here
        return true;
    }
    
    highlightPlayableCards() {
        const cards = document.querySelectorAll('#bottom-player-cards .card');
        cards.forEach(cardEl => {
            const suit = cardEl.dataset.suit;
            const rank = cardEl.dataset.rank;
            const card = { suit, rank };
            
            if (this.isCardPlayable(card)) {
                cardEl.classList.add('playable');
            } else {
                cardEl.classList.remove('playable');
            }
        });
    }
    
    updatePlayedCards() {
        const positions = ['bottom', 'left', 'top', 'right'];
        const myIndex = this.gameState.players.findIndex(p => p.id === this.playerId);
        
        // Clear all played cards
        positions.forEach(pos => {
            document.getElementById(`played-${pos}`).innerHTML = '';
        });
        
        // Show current trick cards
        this.gameState.currentTrick.forEach(play => {
            const playerIndex = this.gameState.players.findIndex(p => p.id === play.playerId);
            const relativeIndex = (playerIndex - myIndex + 4) % 4;
            const position = positions[relativeIndex];
            
            const cardEl = this.createCardElement(play.card, true);
            document.getElementById(`played-${position}`).appendChild(cardEl);
        });
    }
    
    showTrumpModal() {
        document.getElementById('trump-modal').classList.add('show');
    }
    
    selectTrump(trump) {
        document.getElementById('trump-modal').classList.remove('show');
        this.sendMessage({
            type: 'SELECT_TRUMP',
            playerId: this.playerId,
            gameId: this.gameId,
            trump: trump
        });
    }
    
    handleTrickComplete(data) {
        // Show trick winner
        const winner = this.gameState.players.find(p => p.id === data.winnerId);
        this.showToast(`${winner.name} gewinnt den Stich!`, 'info');
        
        // Clear played cards after delay
        setTimeout(() => {
            this.updatePlayedCards();
        }, 2000);
    }
    
    handleGameOver(data) {
        const modal = document.getElementById('game-over-modal');
        
        // Determine winners and losers
        const team1 = [data.players[0], data.players[2]];
        const team2 = [data.players[1], data.players[3]];
        
        if (data.teamScores[0] > data.teamScores[1]) {
            document.getElementById('winner-names').textContent = `${team1[0].name} & ${team1[1].name}`;
            document.getElementById('winner-score').textContent = data.teamScores[0];
            document.getElementById('loser-names').textContent = `${team2[0].name} & ${team2[1].name}`;
            document.getElementById('loser-score').textContent = data.teamScores[1];
        } else {
            document.getElementById('winner-names').textContent = `${team2[0].name} & ${team2[1].name}`;
            document.getElementById('winner-score').textContent = data.teamScores[1];
            document.getElementById('loser-names').textContent = `${team1[0].name} & ${team1[1].name}`;
            document.getElementById('loser-score').textContent = data.teamScores[0];
        }
        
        modal.classList.add('show');
    }
    
    getTrumpDisplayName(trump) {
        const names = {
            hearts: '♥ Herz',
            diamonds: '♦ Karo',
            clubs: '♣ Kreuz',
            spades: '♠ Pik',
            oben: '↑ Oben',
            unten: '↓ Unten'
        };
        return names[trump] || trump;
    }
    
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        const container = document.getElementById('toast-container');
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    sendMessage(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            this.showToast('Keine Verbindung zum Server', 'error');
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.jassGame = new JassGame();
});