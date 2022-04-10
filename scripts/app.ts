class SimpleGame {
    game: Phaser.Game;
    constructor() {
        this.game = new Phaser.Game(
            {
                width: 800,
                height: 600,
                type: Phaser.AUTO,

                scene: [Main]
            });
    }
}

class Main extends Phaser.Scene {
    preload() {
        this.load.image('logo', 'content/sky.png');
    }

    create() {
        var logo = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'logo');
    }
}

window.onload = () => {

    var game = new SimpleGame();

};