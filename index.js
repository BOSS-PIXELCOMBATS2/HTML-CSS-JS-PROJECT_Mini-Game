function Random(MinX, MaxX) {
        MinX = +MinX;
        MaxX = +MaxX;
        if (isNaN(MinX) || isNaN(MaxX)) throw new TypeError(`Parameters \'MinX\' and \'MaxX\' must be numbers.`);
        if (MinX > MaxX) throw new RangeError('Parameters \'MinX\' must be less than parameter \'MaxX\'.');
        return Math.floor(MinX + Math.random() * (MaxX + 1 - MinX));
}

function AreObjectsEqual(Object1, Object2) {
        if (typeof(Object1) !== 'object' || typeof(Object2) !== 'object') throw new TypeError(`Parameters \'Object1\' and \'Object2\' must be objects.`);
        if (Object1 === null || Object2 === null) throw new TypeError(`Parameters \'Object1\' and \'Object2\' must be objects.`);
        for (const Key in Object1) {
                if (Object1[Key] !== Object2[Key]) return false;
        }
        return true;
}

const GameScreen = document.getElementById('game-screen'),
GameScreenContext = GameScreen.getContext('2d');

function ClearCanvas(Canvas) {
        Canvas.width = Canvas.width;
        Canvas.height = Canvas.height;
}

class Position {
        constructor(X, Y) {
                this.X = X;
                this.Y = Y;
        }
}

const Game = {
        Player: {
                Position: null,
                IsSpawned: false
        },
        Id: 0,
        IsStarted: false,
        Time: {
                Seconds: 0,
                Minutes: 0,
                GetString() {
                        return `${this.Minutes > 9 ? this.Minutes : '0' + this.Minutes}:${this.Seconds > 9 ? this.Seconds : '0' + this.Seconds}`;
                },
                OnStart: 0
        },
        Properties: {
                Scores: 0,
                ScoresPositions: []        
        },
        Start(Time) {
                if (this.IsStarted) this.Stop();
                this.Time.Seconds = Time;
                this.Time.Minutes = 0;
                this.Time.Minutes += Math.trunc(this.Time.Seconds / 60);
                this.Time.Seconds %= 60;
                this.Id = setInterval(() => {
                        do X = Random(25, 475); while (!Number.isInteger(X / 10));
                        do Y = Random(25, 275); while (!Number.isInteger(Y / 10));
                        this.Properties.ScoresPositions.push(new Position(X, Y));
                        if (this.Time.Seconds <= 0) {
                                if (this.Time.Minutes >= 1) {
                                        this.Time.Seconds = 60;
                                        this.Time.Minutes--;
                                } else this.End();
                        }
                        this.Time.Seconds--;
                }, 1000);
                this.IsStarted = true;
                this.Player.Position = new Position(250, 150);
                this.Player.IsSpawned = true;
        },
        Stop() {
                this.Time.Seconds = 0;
                this.Time.Minutes = 0;
                this.Properties.Scores = 0;
                this.Properties.ScoresPositions = [];
                clearInterval(this.Id);
                this.IsStarted = false;
                this.Player.Position = null;
                this.Player.IsSpawned = false;
        },
        End() {
                this.Player.Position = null;
                this.Player.IsSpawned = false;
                alert(`Game (time: ${this.Time.OnStart}) ended with result: ${this.Properties.Scores} score(s).`);
                this.Stop();
        }
}

function Init() {
        ClearCanvas(GameScreen);
        if (!Game.IsStarted) {
                GameScreenContext.font = 'normal 900 15px Arial';
                GameScreenContext.fillText('Press enter to start/end game.', 25, 25);
                GameScreenContext.fillText('To move use arrows. You need to collect points.', 25, 50);
                return;
        }
        const p = Game.Player;
        if (!p.IsSpawned) return;
        GameScreenContext.fillText(Game.Time.GetString(), p.Position.X <= 85 ? 450 : 25, 25);
        GameScreenContext.fillText(Game.Properties.Scores, p.Position.X <= 85 ? 475 : 25, 275);
        GameScreenContext.fillRect(p.Position.X, p.Position.Y, 10, 10);
        GameScreenContext.fillStyle = 'yellow';
        Game.Properties.ScoresPositions.forEach(pos => {
                GameScreenContext.fillRect(pos.X, pos.Y, 10, 10);
                if (AreObjectsEqual(p.Position, pos)) {
                        let posi = (()=> {
                                for (let i = 0; i < Game.Properties.ScoresPositions.length; i++) {
                                        if (AreObjectsEqual(Game.Properties.ScoresPositions[i], pos)) return i;
                                }
                                return 0;
                        })();
                        Game.Properties.ScoresPositions.splice(posi, 1);
                        Game.Properties.Scores++;
                }
        });
}

addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
                if (Game.IsStarted) Game.End();
                else {
                        let SelectedTime;
                        while (isNaN(+SelectedTime) || +SelectedTime <= 0 || +SelectedTime > 3599) {
                                SelectedTime = prompt('Enter a game time in seconds (maximum time: 3599):');
                                if (SelectedTime === '' || SelectedTime === null) return;
                        }
                        Game.Start(SelectedTime);
                        Game.Time.OnStart = Game.Time.GetString();
                }
                return;
        }
        const p = Game.Player;
        if (!Game.IsStarted) return;
        if (!p.IsSpawned) return;
        if (e.key === 'ArrowUp') p.Position.Y -= 10;
        if (e.key === 'ArrowDown') p.Position.Y += 10;
        if (e.key === 'ArrowLeft') p.Position.X -= 10;
        if (e.key === 'ArrowRight') p.Position.X += 10;
        if (p.Position.X > GameScreen.width - 5) p.Position.X -= 10;
        if (p.Position.X < -5) p.Position.X += 10;
        if (p.Position.Y > GameScreen.height - 5) p.Position.Y -= 10;
        if (p.Position.Y < -5) p.Position.Y += 10;
});

setInterval(Init, 1 / 60);
