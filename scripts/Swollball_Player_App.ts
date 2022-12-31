﻿class Swollball_Player_Game {
    game: Phaser.Game;
    constructor() {
        this.game = new Phaser.Game(
            {
                width: "95%",
                height: "95%",
                type: Phaser.AUTO,

                physics: {
                    default: 'arcade',
                    arcade: {
                        //debug: true
                    }
                },

                backgroundColor: '#EEEEEE',
                scene: [BallStats, BallUpgrades, EndScreen],

                scale: {
                    autoCenter: Phaser.Scale.Center.CENTER_BOTH,
                    mode: Phaser.Scale.FIT,
                },
            });
    }
}

class EndScreen extends Phaser.Scene {

    graphics: Phaser.GameObjects.Graphics;

    constructor() {
        super({ key: 'EndScreen', active: false, visible: true });
    }

    create() {
        this.graphics = this.add.graphics({ x: 0, y: 0 });

        var boundingDimension = Math.min(this.scale.canvas.width, this.scale.canvas.height);

        this.graphics.fillStyle(0xDDDDDD, 0.7);
        this.graphics.fillRect(this.scale.canvas.width * 0.1, this.scale.canvas.height * 0.25, this.scale.canvas.width * 0.8, this.scale.canvas.height * 0.5);

        // Totally temporary leaderboard drawing
        var totalPlayers = 0;
        var yourPlacing = 0;
        var playerName = (this.scene.get("BallStats") as BallStats).playerBall.Text.text;
        for (let scoreData of RoundScoreData.sort((a: ServerRoundScoreData, b: ServerRoundScoreData) => {
            return b.TotalScore - a.TotalScore; // Sort in descending order
        })) {
            totalPlayers++;
            if (playerName != null
                    && scoreData.PlayerName == playerName) {
                yourPlacing = totalPlayers;
            }
        }

        this.add.text(this.scale.canvas.width * 0.25, this.scale.canvas.height * 0.25, "GAME OVER", { color: 'Black' }).setScale(boundingDimension * 0.01);
        if (yourPlacing > 0) {
            this.add.text(this.scale.canvas.width * 0.1, this.scale.canvas.height * 0.5, "RESULT:" + yourPlacing + "/" + totalPlayers, { color: 'Black' }).setScale(boundingDimension * 0.0075);
        }

        this.time.addEvent(new Phaser.Time.TimerEvent({ delay: FINALSCOREDISPLAYDURATION * 1000, callback: this.EndGame, callbackScope: this }));
    }

    EndGame() {
        window.location.reload();
    }
}

class BallUpgrades extends Phaser.Scene {
    graphics: Phaser.GameObjects.Graphics;
    readyToUpdateUpgrades: boolean;
    upgradeCards: UpgradeCard[];
    creditsLeft: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'BallUpgrades', active: true, visible: true });
        this.readyToUpdateUpgrades = true;
        this.upgradeCards = [];
    }

    create() {
        this.graphics = this.add.graphics({ x: 0, y: 0 });
        this.input.on('gameobjectdown', this.onObjectClicked);
        this.creditsLeft = this.add.text(this.scale.canvas.width * 0.7, this.scale.canvas.height * 0.25, "0", { color: 'Black' });
        this.creditsLeft.scale = Math.min(this.scale.canvas.width, this.scale.canvas.height) * 0.0052;
    }

    update() {
        this.graphics.clear();

        if (this.upgradeCards.length > 0) {
            // Draw the fade screen
            this.graphics.fillStyle(0xFFFFFF, 0.6);
            this.graphics.fillRect(0, 0, this.scale.canvas.width, this.scale.canvas.height);
            this.creditsLeft.setVisible(true);

            // Draw the number of credits left
            this.graphics.fillStyle(0xFFC90E);
            this.graphics.fillCircle(this.creditsLeft.x + this.creditsLeft.scale*5, this.creditsLeft.y + this.creditsLeft.scale*8, this.creditsLeft.scale * 20);
            this.graphics.lineStyle(10, 0x222222);
            this.graphics.strokeCircle(this.creditsLeft.x + this.creditsLeft.scale*5, this.creditsLeft.y + this.creditsLeft.scale*8, this.creditsLeft.scale * 20);
        }
        else {
            this.creditsLeft.setVisible(false);
        }

        this.updateUpgrades();
        this.drawUpgradeCards();
    }

    updateUpgrades() {
        if (this.readyToUpdateUpgrades == true
                && UpgradeData.length > 0) {
            this.readyToUpdateUpgrades = false;
            for (let upgradeCard of this.upgradeCards) {
                upgradeCard.Title.destroy(true);
                upgradeCard.Description.destroy(true);
                upgradeCard.destroy(true);
            }
            
            this.upgradeCards = [];
            this.creditsLeft.text = CreditsLeft.toString();
            var hasActionableCards = false;

            // Partition the width into N units of 9 and N+1 units of 1
            var unitWidth = (this.scale.canvas.width / (UpgradeData.length * 9 + UpgradeData.length + 1));
            if (UpgradeData.length <= 1) {
                unitWidth = (this.scale.canvas.width / (2 * 9 + 2 + 1));
            }
            for (var i = 0; i < UpgradeData.length; i++) {
                let upgradeCard = new UpgradeCard(this,
                    (10 * i * unitWidth) + unitWidth,
                    this.scale.canvas.height / 2,
                    null,
                    UpgradeData[i],
                    this.scale.canvas.height * 0.4,
                    unitWidth * 9);

                // Don't set interactive unless the card isn't blank. Blank cards are just for filling space
                if (upgradeCard.Title.text.length > 0) {
                    upgradeCard.setInteractive();
                    hasActionableCards = true;
                }

                this.upgradeCards[i] = upgradeCard;
            }

            // If there are no actionable cards, clear the card list
            if (!hasActionableCards) {
                this.upgradeCards = [];
                this.readyToUpdateUpgrades = true;
            }
        }
    }

    drawUpgradeCards() {
        for (let card of this.upgradeCards) {
            this.graphics.fillStyle(0xCCCCCC);
            this.graphics.fillRoundedRect(card.x, card.y, card.width, card.height);
            this.graphics.lineStyle(10, card.Upgrade.BorderColor);
            this.graphics.strokeRoundedRect(card.x, card.y, card.width, card.height);
        }
    }

    onObjectClicked(pointer, gameObject: Phaser.GameObjects.GameObject) {
        var upgrade = gameObject as UpgradeCard;
        var ballScene = gameObject.scene as BallUpgrades;
        if (upgrade.Upgrade == null || ballScene.readyToUpdateUpgrades == null) {
            return;
        }

        var sessionRoomId = sessionStorage.getItem("roomid");
        var sessionUserId = sessionStorage.getItem("userid");

        // Prepare for the next update of upgrades - clear the update list
        UpgradeData = [];
        ballScene.readyToUpdateUpgrades = true;

        connection.invoke("ChooseUpgrade", upgrade.Upgrade.ServerId, sessionUserId, sessionRoomId).catch(function (err) {
            return console.error(err.toString());
        });
    }
}

class UpgradeCard extends Phaser.Physics.Arcade.Sprite {
    Upgrade: ServerUpgradeData;
    Title: Phaser.GameObjects.Text;
    Description: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, upgradeData: ServerUpgradeData, height: number, width: number) {
        super(scene, x, y, texture);
        this.Upgrade = upgradeData;

        this.height = height;
        this.width = width;

        this.Title = scene.add.text(x + this.width * 0.15, y + this.height * 0.05, upgradeData.UpgradeName, { color: 'Black' });
        this.Title.scale = width * 0.008;
        this.Description = scene.add.text(x + this.width * 0.05, y + this.height * 0.3, upgradeData.Description, { color: 'Black' });
        this.Description.scale = width * 0.005;
        this.Description.setWordWrapWidth(this.width * 0.92 / this.Description.scale);
    }
}

class BallStats extends Phaser.Scene {
    graphics: Phaser.GameObjects.Graphics;
    playerBall: PlayerBall;
    playerScore: ServerRoundScoreData;
    statsDisplay: Record<string, Phaser.GameObjects.Text>;
    constructor() {
        super({ key: 'BallStats', active: true, visible: true });
    }

    preload() {
        this.load.image('dummyimage', '/content/dummyimage.png');
    }

    create() {
        this.graphics = this.add.graphics({ x: 0, y: 0 });
        this.statsDisplay = {};

        var playerBalls = InitializeBalls(this.physics.add.group({
            defaultKey: 'dummyimage',
            bounceX: 1,
            bounceY: 1,
        }), this);

        this.playerBall = playerBalls[0];

        // Get the scale multiplier, so we know where to put things
        var boundingDimension = Math.min(this.scale.canvas.width, this.scale.canvas.height);
        var scaleMultiplier = GetScale(this);

        this.playerBall.setVelocity(0, 0); // Balls in this display do not move
        this.playerBall.setPosition(300 * scaleMultiplier, 300 * scaleMultiplier); // Set the ball to the top-left of the screen

        this.statsDisplay["hp"] = this.add.text(0, 0, "", { color: 'Black' });
        this.statsDisplay["dmg"] = this.add.text(0, 0, "", { color: 'Black' });
        this.statsDisplay["armor"] = this.add.text(0, 0, "", { color: 'Black' });
        this.statsDisplay["velocity"] = this.add.text(0, 0, "", { color: 'Black' });
        this.statsDisplay["size"] = this.add.text(0, 0, "", { color: 'Black' });
        this.updateText();

        var textArray = [];
        for (let key in this.statsDisplay) {
            var stat = this.statsDisplay[key];
            stat.scale = boundingDimension * 0.004;
            textArray.push(stat);
        }

        Phaser.Actions.PlaceOnCircle(textArray, new Phaser.Geom.Circle(this.playerBall.x, this.playerBall.y - 35 * scaleMultiplier, this.playerBall.Size + 15 * scaleMultiplier), -0.8, 1.1);
    }

    update() {
        this.graphics.clear();
        this.updateText();
        DrawBalls(this.graphics, [this.playerBall]);
    }

    updateText() {
        for (let data of BallData) {
            CopyBallData(this.playerBall, data);
        }

        this.statsDisplay["hp"].text = "HP:" + this.playerBall.MaxHp.toString();
        this.statsDisplay["dmg"].text = "DMG:" + this.playerBall.Damage.toString();
        this.statsDisplay["armor"].text = "ARMOR:" + this.playerBall.Armor.toString();
        this.statsDisplay["velocity"].text = "SPEED:" + Math.floor(this.playerBall.VelocityMultiplier * 100).toString();
        this.statsDisplay["size"].text = "SIZE:" + Math.floor(this.playerBall.SizeMultiplier * 100).toString();
    }
}