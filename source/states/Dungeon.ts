module RogueSide {
	export class Dungeon extends Phaser.State {
		debug: boolean;

		roomsGroup: Phaser.Group;
		worldObjectsGroup: Phaser.Group;
		playersGroup: Phaser.Group;
		enemiesGroup: Phaser.Group;
		itemsGroup: Phaser.Group;
		particleGroup: Phaser.Group;
		guiGroup: Phaser.Group;

		roomsMap: DungeonRoom[][];
		roomsList: DungeonRoom[];

		lightEmitters: Phaser.Sprite[];

		player: Player;
		lighting: Lighting;

		create() {
			this.stage.backgroundColor = "#263643";
			this.lightEmitters = [];

			this.input.keyboard.addKey(Phaser.Keyboard.BACKWARD_SLASH).onDown.add(function() {
				this.debug = !this.debug;
			}, this);

			this.roomsGroup = this.game.add.group();
			this.worldObjectsGroup = this.game.add.group();
			this.playersGroup = this.game.add.group();
			this.enemiesGroup = this.game.add.group();
			this.itemsGroup = this.game.add.group();
			this.particleGroup = this.game.add.group();
			this.guiGroup = this.game.add.group(null, 'gui_group', true);

			let generator = new DungeonGenerator();
			this.world.setBounds(-10000, -10000, Number.MAX_VALUE, Number.MAX_VALUE);

			let map = generator.generate();

			this.roomsList = [];
			this.roomsMap = [];

			for (var i = 0; i < map.length; i++) {
				this.roomsMap[i] = [];
				for (var j = 0; j < map[i].length; j++) {
					if (map[i][j] != null) {
						let room = new DungeonRoom(this, map[i][j]);
						this.roomsList.push(room);
						this.roomsMap[i][j] = room;
					}
					else {
						this.roomsMap[i][j] = null;
					}
				}
			}

			for (var i = 0; i < this.roomsList.length; i++) {
				if (this.roomsList[i].config.start) {
					this.player = new Player(this, this.roomsList[i]);
					this.playersGroup.add(this.player);
					this.player.bringToTop();
				}
			}

			this.lightEmitters.push(this.player);
			this.lighting = new Lighting(this.game, this);
		}

		update() {
			for (let i of this.playersGroup.children) {
				//@ts-ignore
				i.update();
			}
			for (let i of this.roomsGroup.children) {
				//@ts-ignore
				i.update();
			}

			this.camera.x = this.player.x - this.camera.width/2;
			this.camera.y = this.player.y - this.camera.height/2;
			this.lighting.update();
		}

		postRender() {
    	if (this.debug) {

    		this.game.debug.cameraInfo(this.camera, 64, 16);
	      this.game.debug.bodyInfo(this.player, 64, 150);
	      this.game.debug.spriteBounds(this.player);

		    this.game.debug.pointer(this.game.input.mousePointer);
		    this.game.debug.pointer(this.game.input.pointer1);
		    this.game.debug.pointer(this.game.input.pointer2);
		    this.game.debug.pointer(this.game.input.pointer3);
		    this.game.debug.pointer(this.game.input.pointer4);
		    this.game.debug.pointer(this.game.input.pointer5);
		  }

      this.game.debug.text(this.game.time.fps+"" || '--', 2, 14, "#00ff00");   
			for (let i of this.enemiesGroup.children) {
				this.game.debug.spriteBounds(i);
			}
		}

		playerAttack(x: number, y: number, width: number, height: number, facing: boolean, damage: number) {
			if (this.debug) {
				let attack = new Phaser.Sprite(this.game, x, y, "debug");
				attack.scale.set(width, height);
				attack.alpha = 0.5;
				this.game.add.existing(attack);
				setTimeout(() => attack.destroy(), 100);
			}

			let bound = new Phaser.Rectangle(x, y, width, height);
			for (let i of this.enemiesGroup.children) {
				//@ts-ignore
				i.playerAttack(bound, 5);
			}
		}
	}
}
