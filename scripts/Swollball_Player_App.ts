class Swollball_Player_Game {
    game: Phaser.Game;
    constructor() {
        this.game = new Phaser.Game(
            {
                width: "100%",
                height: "100%",
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
                    parent: "phaserapp",
                    autoCenter: Phaser.Scale.Center.CENTER_BOTH,
                    //mode: Phaser.Scale.FIT,
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
        this.graphics.fillRect(this.scale.canvas.width * 0.1, this.scale.canvas.height * 0.1, this.scale.canvas.width * 0.8, this.scale.canvas.height * 0.65);

        // Totally temporary leaderboard drawing
        var totalPlayers = 0;
        var yourPlacing = 0;
        var playerName = (this.scene.get("BallStats") as BallStats).playerBall.NameText.text;
        for (let scoreData of RoundScoreData.sort((a: ServerRoundScoreData, b: ServerRoundScoreData) => {
            return b.RoundNumber - a.RoundNumber; // Sort in descending order of round number eliminated
        })) {
            totalPlayers++;
            if (playerName != null
                && scoreData.PlayerName == playerName) {
                yourPlacing = totalPlayers;
            }
        }

        this.add.text(this.scale.canvas.width * 0.25, this.scale.canvas.height * 0.15, "GAME\nOVER", { color: 'Black' }).setScale(boundingDimension * 0.01);
        if (yourPlacing > 0) {
            var placingText = "LAST";
            switch (yourPlacing) {
                case 1:
                    placingText = "1st";
                    break;
                case 2:
                    placingText = "2nd";
                    break;
                case 3:
                    placingText = "3rd";
                    break;
                default:
                    placingText = yourPlacing + "th";
                    break;
            }
            this.add.text(this.scale.canvas.width * 0.1, this.scale.canvas.height * 0.5, placingText + " place\n(Out of " + totalPlayers + ")", { color: 'Black' }).setScale(boundingDimension * 0.0075);
        }

        this.time.addEvent(new Phaser.Time.TimerEvent({ delay: FINALSCOREDISPLAYDURATION * 1000, callback: this.EndGame, callbackScope: this }));
    }

    EndGame() {
        window.location.reload();
    }
}

function LoadCardImages(scene: Phaser.Scene) {
    // Note that the key is the same as the upgrade name
    scene.load.image('Tofu', '/content/cards/Tofu.png');
    scene.load.image('Apple', '/content/cards/Apple.png');
    scene.load.image('Brocolli', '/content/cards/Brocolli2.png');
    scene.load.image('BROcolli', '/content/cards/Brocolli.png');
    scene.load.image('Milk', '/content/cards/Milk.png');
    scene.load.image('Bread', '/content/cards/Bread.png');
    scene.load.image('Bacon', '/content/cards/Bacon.png');
    scene.load.image('Banana', '/content/cards/Banana.png');
    scene.load.image('Buffet', '/content/cards/Buffet.png');
    scene.load.image('Soy Milk', '/content/cards/SoyMilk.png');
    scene.load.image('Rice', '/content/cards/Rice.png');
    scene.load.image('Yoga', '/content/cards/Yoga.png');
    scene.load.image('GET SWOLL', '/content/cards/Swoll.png');
    scene.load.image('Ketones', '/content/cards/Bike.png');
    scene.load.image('Wagyu', '/content/cards/Steak.png');
}

class BallUpgrades extends Phaser.Scene {
    graphics: Phaser.GameObjects.Graphics;
    readyToUpdateUpgrades: boolean;
    upgradeCards: UpgradeCard[];

    creditsLeft: Phaser.GameObjects.Text;
    creditsLeftButton: Phaser.GameObjects.Sprite;
    creditNextIncrementTime: number;
    refreshButton: Phaser.GameObjects.Sprite;

    upgradeTierCost: Phaser.GameObjects.Text;
    upgradeTierButton: Phaser.GameObjects.Sprite;

    preload() {
        // Loading progress updates
        this.load.on('progress', function (value) {
            console.log("LOADING:" + value);
            document.getElementById("loadingbar").textContent = "Loading: " + Math.floor(value * 100) + "%";
        });
        this.load.on('complete', function () {
            var sessionRoomId = sessionStorage.getItem("roomid");
            document.getElementById("loadingbar").textContent = "ROOMID: " + sessionRoomId;
        });

        this.load.image('refreshimage', '/content/ui/refreshimage.png');
        this.load.image('uparrow', '/content/ui/uparrowoverlay.png');
        this.load.image('credit', '/content/ui/creditoverlay.png');

        LoadCardImages(this);
    }

    constructor() {
        super({ key: 'BallUpgrades', active: true, visible: true });
        this.readyToUpdateUpgrades = true;
        this.upgradeCards = [];
    }

    create() {
        this.graphics = this.add.graphics({ x: 0, y: 0 });
        this.input.on('gameobjectdown', this.onObjectClicked);
        var boundingDimension = Math.min(this.scale.canvas.width, this.scale.canvas.height);

        // Paint the CreditsLeft display
        this.creditNextIncrementTime = this.time.now;
        this.creditsLeftButton = this.add.sprite(this.scale.canvas.width * 0.86 + boundingDimension * 0.004 * 7, this.scale.canvas.height * 0.08 + boundingDimension * 0.004 * 8, 'credit');
        this.creditsLeftButton.scale = boundingDimension * 0.0012;
        this.creditsLeft = this.add.text(this.scale.canvas.width * 0.86, this.scale.canvas.height * 0.08, "0", { color: 'Black' });
        this.creditsLeft.scale = boundingDimension * 0.004;
        this.creditsLeft.setDepth(2);

        // Paint the Refresh Button
        this.refreshButton = this.add.sprite(this.scale.canvas.width * 0.9, this.scale.canvas.height * 0.36, 'refreshimage');
        this.refreshButton.scale = boundingDimension * 0.0012;
        this.refreshButton.setInteractive(
            new Phaser.Geom.Circle(this.refreshButton.x, this.refreshButton.y, this.refreshButton.width * this.refreshButton.scale / 2),
            CircleDetection);

        // Paint the UpgradeShop button - both the text and the button
        this.upgradeTierButton = this.add.sprite(this.scale.canvas.width * 0.75, this.scale.canvas.height * 0.36, 'uparrow');
        this.upgradeTierButton.scale = boundingDimension * 0.0012;
        this.upgradeTierButton.setInteractive(
            new Phaser.Geom.Circle(this.upgradeTierButton.x, this.upgradeTierButton.y, this.upgradeTierButton.width * this.upgradeTierButton.scale / 2),
            CircleDetection);
        this.upgradeTierCost = this.add.text(
            this.upgradeTierButton.x - this.upgradeTierButton.width * this.upgradeTierButton.scale / 2 + boundingDimension * 0.02,
            this.upgradeTierButton.y - this.upgradeTierButton.height * this.upgradeTierButton.scale / 2 + boundingDimension * 0.035, "0", { color: 'Black' });
        this.upgradeTierCost.scale = boundingDimension * 0.004;
        this.upgradeTierCost.setDepth(2);

        /* Stuff for debugging hit area
        this.upgradeTierButton.on('pointerover', function (pointer) {
            this.setTint(0xff0000);
        })
        this.upgradeTierButton.on('pointerout', function (pointer) {
            this.clearTint();
        })
        this.refreshButton.on('pointerover', function (pointer) {
            this.setTint(0xff0000);
        })
        this.refreshButton.on('pointerout', function (pointer) {
            this.clearTint();
        })*/
    }

    update() {
        this.graphics.clear();
        this.updateUpgrades();
        this.drawUpgradeCards();
    }

    updateUpgrades() {
        const CREDITINCREMENTINTERVAL = 30; // Interval to update credits
        var creditsDisplayed = parseInt(this.creditsLeft.text);
        if (creditsDisplayed != EconomyData.CreditsLeft
            && this.creditNextIncrementTime <= this.time.now) {

            if (creditsDisplayed < EconomyData.CreditsLeft) {
                creditsDisplayed = creditsDisplayed + Math.round(Math.max(1, (EconomyData.CreditsLeft - creditsDisplayed) * 0.3));
                this.creditNextIncrementTime = this.time.now + CREDITINCREMENTINTERVAL * 2;
            }
            else if (creditsDisplayed > EconomyData.CreditsLeft) {
                creditsDisplayed = creditsDisplayed - Math.round(Math.max(1, (creditsDisplayed - EconomyData.CreditsLeft) * 0.4));
                this.creditNextIncrementTime = this.time.now + CREDITINCREMENTINTERVAL;
            }

            this.creditsLeft.text = creditsDisplayed.toString();
            this.creditsLeft.setX(this.scale.canvas.width * (0.89 - 0.0175 * this.creditsLeft.text.length)) // Adjust the x-position based on how long the string is
        }

        const MaxUpgradeTierDisplay = "XX";
        if (this.upgradeTierCost.text != MaxUpgradeTierDisplay) {
            var upgradeCostDisplayed = parseInt(this.upgradeTierCost.text);
            if (upgradeCostDisplayed != EconomyData.UpgradeTierCost) {
                // Upgrade Tier Cost can be maxed out - indicated by -1 to upgrade cost
                if (EconomyData.UpgradeTierCost < 0) {
                    this.upgradeTierCost.text = MaxUpgradeTierDisplay;
                    this.upgradeTierButton.disableInteractive();
                }
                else {
                    this.upgradeTierCost.text = EconomyData.UpgradeTierCost.toString();
                }
            }
        }

        if (this.readyToUpdateUpgrades == true
            && UpgradeData.length > 0) {
            this.readyToUpdateUpgrades = false;
            for (let upgradeCard of this.upgradeCards) {
                DestroyCard(upgradeCard);
            }

            this.upgradeCards = [];
            var hasActionableCards = false;
            this.createUpgradeCards();

            for (let upgradeCard of this.upgradeCards) {
                // Don't set interactive unless the card isn't blank. Blank cards are just for filling space
                if (upgradeCard.Title.text.length > 0) {
                    upgradeCard.setInteractive(new Phaser.Geom.Rectangle(upgradeCard.x, upgradeCard.y, upgradeCard.width, upgradeCard.height),
                        RectDetection);
                    hasActionableCards = true;
                }
            }

            // If there are no actionable cards, clear the card list
            if (!hasActionableCards) {
                this.upgradeCards = [];
                this.readyToUpdateUpgrades = true;
            }

        }
    }
    // Creates the upgrade cards with a variable arrangement depending on how many cards there are
    createUpgradeCards() {
        switch (UpgradeData.length) {
            case 1:
            case 2:
            case 3:
                this.createUpgradeCardsInLineWithFixedWidth(UpgradeData, 20, 0);
                break;
            case 4:
                this.createUpgradeCardsInLineWithFixedWidth([UpgradeData[0], UpgradeData[1]], 15, 0);
                this.createUpgradeCardsInLineWithFixedWidth([UpgradeData[2], UpgradeData[3]], 25, 2);
                break;
            case 5:
                this.createUpgradeCardsInLineWithFixedWidth([UpgradeData[0], UpgradeData[1], UpgradeData[2]], 15, 0);
                this.createUpgradeCardsInLineWithFixedWidth([UpgradeData[3], UpgradeData[4]], 25, 3);
                break;
            case 6:
                this.createUpgradeCardsInLineWithFixedWidth([UpgradeData[0], UpgradeData[1], UpgradeData[2]], 15, 0);
                this.createUpgradeCardsInLineWithFixedWidth([UpgradeData[3], UpgradeData[4], UpgradeData[5]], 25, 3);
                break;
            default: // This arrangement can't handle anything more than 6 cards
                this.createUpgradeCardsInLineWithDynamicWidth();
                return;
        }
    }

    // Creates the upgrade cards in a single line with specific width
    createUpgradeCardsInLineWithFixedWidth(upgradeData: ServerUpgradeData[], yPos: integer, indexOffset: integer) {
        var unitWidth = this.scale.canvas.width / 31;
        var unitHeight = this.scale.canvas.height / 35;
        for (var i = 0; i < upgradeData.length; i++) {
            let upgradeCard = new UpgradeCard(this,
                (16 - upgradeData.length * 5 + i * 10) * unitWidth, //XPos
                yPos * unitHeight, //YPos
                null,
                upgradeData[i],
                unitHeight * 9, //Height
                unitWidth * 9); //Width

            this.upgradeCards[i + indexOffset] = upgradeCard;
        }
    }

    // Creates the upgrade cards in a single line, with just enough space for each card
    createUpgradeCardsInLineWithDynamicWidth() {
        // Partition the width into N units of 9 and N+1 units of 1
        var unitWidth = (this.scale.canvas.width / (UpgradeData.length * 9 + UpgradeData.length + 1));
        if (UpgradeData.length <= 1) {
            unitWidth = (this.scale.canvas.width / (2 * 9 + 2 + 1));
        }
        for (var i = 0; i < UpgradeData.length; i++) {
            let upgradeCard = new UpgradeCard(this,
                (10 * i * unitWidth) + unitWidth, //XPos
                this.scale.canvas.height / 2, //YPos
                null,
                UpgradeData[i],
                this.scale.canvas.height * 0.4, //Height
                unitWidth * 9); //Width

            this.upgradeCards[i] = upgradeCard;
        }
    }

    drawUpgradeCards() {
        for (let card of this.upgradeCards) {
            DrawUpgradeCardBorder(card, this.graphics);
        }
    }

    onObjectClicked(pointer, gameObject: Phaser.GameObjects.GameObject) {
        var upgrade = gameObject as UpgradeCard;
        var ballScene = gameObject.scene as BallUpgrades;

        // Check for clicking upgrade cards
        if (upgrade.Upgrade != undefined && ballScene.readyToUpdateUpgrades != undefined) {
            ballScene.onUpgradeClicked(upgrade);
            return;
        }

        // Check for clicking refresh button
        var sprite = gameObject as Phaser.GameObjects.Sprite;
        if (sprite.texture.key == 'refreshimage') {
            ballScene.onRefreshClicked(sprite)
            return;
        }

        // Check for clicking on upgrading shop tier
        if (sprite.texture.key == 'uparrow') {
            ballScene.onTierUpClicked(sprite)
            return;
        }
    }

    onRefreshClicked(sprite: Phaser.GameObjects.Sprite) {
        // Disallow refreshes if not enough credits
        if (EconomyData.CreditsLeft <= 0) {
            return;
        }

        var sessionRoomId = sessionStorage.getItem("roomid");
        var sessionUserId = sessionStorage.getItem("userid");

        // Prepare for the next update of upgrades - clear the update list
        EconomyData.CreditsWereSpent = true;
        UpgradeData = [];
        this.readyToUpdateUpgrades = true;

        connection.invoke("RefreshShop", sessionUserId, sessionRoomId).catch(function (err) {
            return console.error(err.toString());
        });
    }

    onTierUpClicked(sprite: Phaser.GameObjects.Sprite) {
        // Don't allow for upgrades if short of credits
        if (EconomyData.CreditsLeft < EconomyData.UpgradeTierCost) {
            return;
        }

        EconomyData.CreditsWereSpent = true;
        var sessionRoomId = sessionStorage.getItem("roomid");
        var sessionUserId = sessionStorage.getItem("userid");

        // Prepare for the next update of upgrades - clear the update list
        UpgradeData = [];
        this.readyToUpdateUpgrades = true;

        connection.invoke("TierUp", sessionUserId, sessionRoomId).catch(function (err) {
            return console.error(err.toString());
        });
    }

    onUpgradeClicked(upgrade: UpgradeCard) {
        /* Currently, allow for buying of the last upgrade regardless of cost
        if (upgrade.Upgrade.Cost > CreditsLeft) {
            return;
        } */

        EconomyData.CreditsWereSpent = true;
        var sessionRoomId = sessionStorage.getItem("roomid");
        var sessionUserId = sessionStorage.getItem("userid");

        // Prepare for the next update of upgrades - clear the update list
        UpgradeData = [];
        this.readyToUpdateUpgrades = true;

        connection.invoke("ChooseUpgrade", upgrade.Upgrade.ServerId, sessionUserId, sessionRoomId).catch(function (err) {
            return console.error(err.toString());
        });
    }
}

class UpgradeCard extends Phaser.Physics.Arcade.Sprite {
    Upgrade: ServerUpgradeData;
    Title: Phaser.GameObjects.Text;
    Description: Phaser.GameObjects.Text;
    Cost: Phaser.GameObjects.Text;
    CardBackground: Phaser.GameObjects.Sprite;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, upgradeData: ServerUpgradeData, height: number, width: number) {
        super(scene, x, y, texture);
        this.Upgrade = upgradeData;

        this.height = height;
        this.width = width;

        var displayTitle = upgradeData.UpgradeName;
        if (upgradeData.UpgradeName.length == 0) { displayTitle = "" }; // Represent the blank upgrade card

        if (scene.textures.exists(displayTitle)) {
            this.CardBackground = scene.add.sprite(x + this.width * 0.5, y + this.height * 0.65, displayTitle);
            // Scale to either 0.8 * width or 0.6 * height
            var scaleValue = Math.min(this.width * 0.8 / this.CardBackground.displayWidth, this.height * 0.6 / this.CardBackground.displayHeight);
            this.CardBackground.setDisplaySize(this.CardBackground.displayWidth * scaleValue, this.CardBackground.displayHeight * scaleValue);
            this.CardBackground.setAlpha(0.4);
        }

        this.Title = scene.add.text(x + this.width * (0.5 - displayTitle.length * 0.04), y + this.height * 0.05, displayTitle, { color: 'Black' });
        this.Title.scale = width * 0.008;

        this.Description = scene.add.text(x + this.width * 0.05, y + this.height * 0.3, upgradeData.Description, { color: 'Black' });
        var heightRatio = this.height / this.width;
        this.Description.scale = width * Math.min(0.0065, 0.5 * heightRatio / this.Description.text.length);
        this.Description.setWordWrapWidth(this.width * 0.92 / this.Description.scale);

        if (upgradeData.Cost > 0) {
            // Shift text to the left when it's longer - and move the box to the right
            var upgradeCost = upgradeData.Cost.toString();
            this.Cost = scene.add.text(x + this.width * (0.915 - 0.015 * upgradeCost.length), y + this.height * 0.01, upgradeCost, { color: 'Black' });
            this.Cost.scale = width * 0.0065;
        }
    }
}

function ShiftText(card: UpgradeCard) {
    if (card.CardBackground != undefined) {
        card.CardBackground.x = card.x + card.width * 0.5;
        card.CardBackground.y = card.y + card.height * 0.65;
    }

    card.Title.x = card.x + card.width * (0.5 * card.Title.text.length * 0.04);
    card.Title.y = card.y + card.height * 0.05;

    card.Description.x = card.x + card.width * 0.05;
    card.Description.y = card.y + card.height * 0.3;

    if (card.Cost != undefined) {
        card.Cost.x = card.x + card.width * (0.915 - 0.015 * card.Cost.text.length);
        card.Cost.y = card.y + card.height * 0.01;
    }
}

class BallStats extends Phaser.Scene {
    graphics: Phaser.GameObjects.Graphics;
    playerBall: PlayerBall;
    statsDisplay: Record<string, Phaser.GameObjects.Text>;
    persistentUpgradeCards: UpgradeCard[];
    displayedCard: UpgradeCard;
    displayedCardId: string;
    lastUpdate: number;
    sellButton: Phaser.GameObjects.Sprite;

    constructor() {
        super({ key: 'BallStats', active: true, visible: true });
        this.lastUpdate = 0;
    }

    preload() {
        this.load.image('dummyimage', '/content/dummyimage.png');
        this.load.image('background', '/content/ui/wooden.jpg');
        this.load.image('sellbutton', '/content/ui/sellbutton.png');

        LoadCardImages(this);
    }

    create() {
        this.graphics = this.add.graphics({ x: 0, y: 0 });
        this.input.on('gameobjectdown', this.onObjectClicked);
        this.statsDisplay = {};
        this.persistentUpgradeCards = [];

        var playerBalls = InitializeBalls(this.physics.add.group({
            defaultKey: 'dummyimage',
            bounceX: 1,
            bounceY: 1,
        }), this, 0.18 /*Area taken by the balls*/);

        this.playerBall = playerBalls[0];
        this.playerBall.setPosition(this.scale.canvas.width * 0.25, this.scale.canvas.height * 0.225); // Set the ball position relative to the screen
        this.playerBall.NameText.setVisible(false);
        this.playerBall.HpText.setVisible(false);

        this.statsDisplay["points"] = this.add.text(0, 0, "", { color: 'Black' });
        this.statsDisplay["hp"] = this.add.text(0, 0, "", { color: 'Black' });
        this.statsDisplay["dmg"] = this.add.text(0, 0, "", { color: 'Black' });
        this.statsDisplay["armor"] = this.add.text(0, 0, "", { color: 'Black' });
        this.statsDisplay["velocity"] = this.add.text(0, 0, "", { color: 'Black' });
        this.statsDisplay["size"] = this.add.text(0, 0, "", { color: 'Black' });

        this.updateText();

        // Get the scale multiplier, so we know where to put things and scale text
        var boundingDimension = Math.min(this.scale.canvas.width, this.scale.canvas.height);
        var scaleMultiplier = GetScale(this);
        const STATFONTSCALE = 0.002;
        var textArray = [];
        for (let key in this.statsDisplay) {
            var stat = this.statsDisplay[key];
            stat.scale = boundingDimension * STATFONTSCALE;
            textArray.push(stat);
        }
        Phaser.Actions.PlaceOnCircle(textArray, new Phaser.Geom.Circle(this.playerBall.x, this.playerBall.y - 15 * scaleMultiplier, this.playerBall.Size + 15 * scaleMultiplier), -0.7, 1.2);

        var backgroundImage = this.add.sprite(this.scale.canvas.width / 2, this.scale.canvas.height / 2, 'background');
        backgroundImage.alpha = 0.55;
        backgroundImage.setDepth(-1);
        backgroundImage.setDisplaySize(this.scale.canvas.width, this.scale.canvas.height);

        // Paint the Sell Button
        this.sellButton = this.add.sprite(this.playerBall.x + this.playerBall.Size + this.scale.canvas.width * 0.1, this.playerBall.y - this.scale.canvas.height * 5 / 31, 'sellbutton');
        this.sellButton.setDisplaySize(this.scale.canvas.width * 7 / 35, this.scale.canvas.height * 2 / 31);
        this.sellButton.setInteractive(new Phaser.Geom.Rectangle(this.sellButton.x, this.sellButton.y, this.sellButton.displayWidth, this.sellButton.displayHeight),
            RectDetection);
        this.sellButton.active = false;
        this.sellButton.visible = false;
    }

    update() {
        if (this.lastUpdate == BallUpdateTime) {
            return;
        }

        this.lastUpdate = BallUpdateTime;

        this.graphics.clear();
        this.updateText();
        DrawBalls(this.graphics, [this.playerBall]);
        this.drawUpgradeCards();
    }

    drawUpgradeCards() {
        for (let card of this.persistentUpgradeCards) {
            DrawUpgradeCardBorder(card, this.graphics);
        }

        if (this.displayedCard != undefined
            && this.displayedCard.active) {
            DrawUpgradeCardBorder(this.displayedCard, this.graphics);
        }
    }

    updateText() {
        for (let data of BallData) {
            CopyBallData(this.playerBall, data);
        }

        var playerScore = RoundScoreData[0];
        this.statsDisplay["points"].text = "POINTS:" + playerScore.PointsLeft;
        this.statsDisplay["hp"].text = "HP:" + this.playerBall.Hp;
        this.statsDisplay["dmg"].text = "DMG:" + this.playerBall.Damage.toString();
        this.statsDisplay["armor"].text = "ARMOR:" + this.playerBall.Armor.toString();
        this.statsDisplay["velocity"].text = "SPEED:" + this.playerBall.VelocityMultiplier.toString();
        this.statsDisplay["size"].text = "SIZE:" + this.playerBall.SizeMultiplier.toString();

        for (let card of this.persistentUpgradeCards) {
            DestroyCard(card);
        }

        this.persistentUpgradeCards = [];
        var cardWidth = this.playerBall.Size * 0.5;
        var cardHeight = this.playerBall.Size * 0.5;
        for (var i = 0; i < this.playerBall.PersistentUpgradeData.length; i++) {
            let upgradeCard = new UpgradeCard(this,
                0, 0,
                null,
                this.playerBall.PersistentUpgradeData[i],
                cardWidth,
                cardHeight);

            this.persistentUpgradeCards[i] = upgradeCard;
        }

        Phaser.Actions.PlaceOnCircle(this.persistentUpgradeCards, new Phaser.Geom.Circle(this.playerBall.x - cardWidth*0.5, this.playerBall.y-cardHeight*0.5, this.playerBall.Size * 0.65));

        // Re-position text in the card
        for (let card of this.persistentUpgradeCards) {
            ShiftText(card);
            card.Title.y = card.y + 0.3 * card.height;
            card.setInteractive(new Phaser.Geom.Rectangle(card.x, card.y, card.width, card.height),
                RectDetection);
            card.Description.setVisible(false);
        }

        // Check whether the selected persistent upgrade card is still valid
        this.destroyDisplayedCard();
        if (this.displayedCardId != undefined) {
            for (let persistentUpgrade of this.playerBall.PersistentUpgradeData) {
                if (persistentUpgrade.ServerId == this.displayedCardId)
                    this.updateDisplayedCard(persistentUpgrade);
            }
        }
    }

    destroyDisplayedCard() {
        if (this.displayedCard != undefined) {
            this.sellButton.active = false;
            this.sellButton.visible = false;
            DestroyCard(this.displayedCard);
        }

        // Make the other text visible
        for (let key in this.statsDisplay) {
            this.statsDisplay[key].setVisible(true);
        }
        return;
    }

    updateDisplayedCard(upgradeData: ServerUpgradeData) {
        var height = this.scale.canvas.height * 9 / 31;
        var width = this.scale.canvas.width * 9 / 35
        this.displayedCard = new UpgradeCard(this,
            this.playerBall.x + this.playerBall.Size,
            this.playerBall.y - height * 0.5,
            null,
            upgradeData,
            height,
            width);

        // Make the other text invisible
        this.sellButton.active = true;
        this.sellButton.visible = true;
        for (let key in this.statsDisplay) {
            this.statsDisplay[key].setVisible(false);
        }
    }

    onObjectClicked(pointer, gameObject: Phaser.GameObjects.GameObject) {
        var scene = gameObject.scene as BallStats;

        // Check for clicking on a card
        var card = gameObject as UpgradeCard;
        if (card.Upgrade != undefined && scene.statsDisplay != undefined) {
            // Case 1 - Already selected, unselect
            if (scene.displayedCardId != undefined
                && scene.displayedCardId == card.Upgrade.ServerId) {
                scene.displayedCardId = null;
                scene.lastUpdate = Date.now();
                return;
            }

            // Case 2 - Not selected, display info
            scene.displayedCardId = card.Upgrade.ServerId;
            scene.lastUpdate = Date.now(); // Update to draw borders
            return;
        }
    }
}

function DrawUpgradeCardBorder(card: UpgradeCard, graphics: Phaser.GameObjects.Graphics) {
    graphics.fillStyle(card.Upgrade.FillColor);
    graphics.fillRoundedRect(card.x, card.y, card.width, card.height);

    var lineWidth = Math.min(10, Math.min(card.width, card.height) * 0.05);

    graphics.lineStyle(lineWidth, card.Upgrade.BorderColor);
    graphics.strokeRoundedRect(card.x, card.y, card.width, card.height);

    // Draw the cost of the card - Draw to the right for more expensive cards to offset the text being on the left
    if (card.Cost != undefined) {
        var xPos = card.Cost.x + card.Cost.scale * 4 + (card.width * 0.015 * card.Cost.text.length);
        graphics.fillStyle(0xFFC90E);
        graphics.fillCircle(xPos, card.Cost.y + card.Cost.scale * 8, card.Cost.scale * 12);
        graphics.lineStyle(lineWidth * 0.3, 0x222222);
        graphics.strokeCircle(xPos, card.Cost.y + card.Cost.scale * 8, card.Cost.scale * 12);
    }
}

function DestroyCard(card: UpgradeCard) {
    card.Title?.destroy(true);
    card.Description?.destroy(true);
    card.Cost?.destroy(true);
    card.CardBackground?.destroy(true);
    card.destroy(true);
}