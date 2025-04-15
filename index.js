function random(minX, maxX) {
        minX = +minX;
        maxX = +maxX;
        if (isNaN(minX) || isNaN(maxX)) throw new TypeError(`Parameters \'minX\' and \'maxX\' must be numbers.`);
        if (minX > maxX) throw new RangeError('Parameters \'minX\' must be less than parameter \'maxX\'.');
        return Math.floor(minX + Math.random() * (maxX + 1 - minX));
}

const screen = document.getElementById('screen'),
        screenCtx = screen.getContext('2d');

const player = {
        position: { x: screen.width / 2, y: screen.height / 2 },
        size: 25,
        speed: 1,
        color: 'lime',
        getDistanceToPoint(x, y) {
                return Math.hypot(x - this.position.x, y - this.position.y);
        }
}

function getTimeFixedString(minutes, seconds) {
        return `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
}

const game = {
        isStarted: false,
        timeOnStart: 0,
        timeNow: {
                minutes: 0,
                seconds: 0,
                string: ''
        },
        timerID: 0,
        scores: 0,
        scoresPositions: [],
        start() {
                this.isStarted = true;
                this.timeNow.minutes = Math.trunc(this.timeOnStart / 60);
                this.timeNow.seconds = this.timeOnStart % 60;
                this.timeNow.string = getTimeFixedString(this.timeNow.minutes, this.timeNow.seconds);
                this.timerID = setInterval(()=> {
                        if (this.timeNow.minutes === 0 && this.timeNow.seconds === 0) {
                                this.end();
                                return;
                        }
                        this.scoresPositions.push({ x: random(5, screen.width), y: random(5, screen.height) });
                        this.timeNow.seconds--;
                        if (this.timeNow.seconds < 0) {
                                if (this.timeNow.minutes > 0) {
                                        this.timeNow.minutes--;
                                        this.timeNow.seconds = 59;
                                } else {
                                        this.end();
                                        return;
                                }
                        }
                        this.timeNow.string = getTimeFixedString(this.timeNow.minutes, this.timeNow.seconds);
                }, 1000);
        },
        end() {
                this.isStarted = false;
                clearInterval(this.timerID);
                this.timeNow.minutes = 0;
                this.timeNow.seconds = 0;
                this.timeNow.string = '';
                this.timeOnStart = 0;
                alert(`Result: ${this.scores} score(s).`);
                this.scores = 0;
                this.scoresPositions = [];
        }
}

function initGame() {
        screenCtx.clearRect(0, 0, screen.width, screen.height);
        if (!game.isStarted) {
                screenCtx.font = '20px Arial';
                screenCtx.fillStyle = 'black';
                screenCtx.fillText('Mini game: To start press Enter.', 10, 25);
                screenCtx.fillText('Use WASD or arrows to move and collect points.', 10, 50);
                return;
        }
        const halfPlayerSize = player.size / 2;
        if ((keyboard.w || keyboard.arrowUp) && player.position.y - halfPlayerSize > 0) player.position.y -= player.speed;
        if ((keyboard.s || keyboard.arrowDown) && player.position.y + halfPlayerSize < screen.height) player.position.y += player.speed;
        if ((keyboard.a || keyboard.arrowLeft) && player.position.x - halfPlayerSize > 0) player.position.x -= player.speed;
        if ((keyboard.d || keyboard.arrowRight) && player.position.x + halfPlayerSize < screen.width) player.position.x += player.speed;
        for (let i = 0; i < game.scoresPositions.length; i++) {
                const score = game.scoresPositions[i];
                if (player.getDistanceToPoint(score.x, score.y) < player.size) {
                        game.scoresPositions.splice(i, 1);
                        game.scores++;
                        i--;
                }
        }
        screenCtx.fillStyle = player.color;
        screenCtx.fillRect(player.position.x - halfPlayerSize, player.position.y - halfPlayerSize, player.size, player.size);
        for (const score of game.scoresPositions) {
            screenCtx.fillStyle = 'yellow';
            screenCtx.fillRect(score.x - 2.5, score.y - 2.5, 25, 25);
        }
        screenCtx.font = '20px Arial';
        screenCtx.fillStyle = 'black';
        screenCtx.fillText(`Time: ${game.timeNow.string}`, 10, screen.height - 10);
        screenCtx.fillText(`Scores: ${game.scores}`, screen.width - 100, screen.height - 10);
    }

const keyboard = {
        w: false,
        a: false,
        s: false,
        d: false,
        arrowUp: false,
        arrowDown: false,
        arrowRight: false,
        arrowLeft: false
}

addEventListener('keydown', e => {
        if (e.code === 'Enter') {
                if (game.isStarted) game.end();
                else {
                        let newGameTime = 0;
                        do newGameTime = prompt('Please enter a time for new game in seconds (minimum - 10, maximum - 3599):');
                        while (+newGameTime === 0 || isNaN(+newGameTime) || +newGameTime < 10 || +newGameTime > 3599);
                        game.timeOnStart = newGameTime;
                        game.start();
                }
                return;
        }
        if (e.code === 'KeyW') keyboard.w = true;
        if (e.code === 'KeyA') keyboard.a = true;
        if (e.code === 'KeyS') keyboard.s = true;
        if (e.code === 'KeyD') keyboard.d = true;
        if (e.code === 'ArrowUp') keyboard.arrowUp = true;
        if (e.code === 'ArrowDown') keyboard.arrowDown = true;
        if (e.code === 'ArrowLeft') keyboard.arrowLeft = true;
        if (e.code === 'ArrowRight') keyboard.arrowRight = true;
});
addEventListener('keyup', e => {
        if (e.code === 'KeyW') keyboard.w = false;
        if (e.code === 'KeyA') keyboard.a = false;
        if (e.code === 'KeyS') keyboard.s = false;
        if (e.code === 'KeyD') keyboard.d = false;
        if (e.code === 'ArrowUp') keyboard.arrowUp = false;
        if (e.code === 'ArrowDown') keyboard.arrowDown = false;
        if (e.code === 'ArrowLeft') keyboard.arrowLeft = false;
        if (e.code === 'ArrowRight') keyboard.arrowRight = false;
});

setInterval(initGame, 1000 / 60);
