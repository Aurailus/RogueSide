module RogueSide {
	export class DungeonRoom extends Phaser.Sprite {
		config: RoomConfig;
		state: Dungeon;
		accessed: boolean;
		accessedTime: number;

		door: Phaser.Sprite;
		ladder: Phaser.Sprite;

		enemies: Enemy[];

		enableEnemies() {
			for (let i of this.enemies) {
				setTimeout(() => i.alert(), Math.random()*300 + 50);
			}
		}

		addEnemy(enemy: Enemy) {
			this.enemies.push(enemy);
			this.state.enemiesGroup.add(enemy);
		}

		addDecorations() {
			new DungeonTorch(this, 40, 25);
			new DungeonTorch(this, 150, 25);
		}

		populate() {
			for (let i = 0; i < 1 + Math.round(Math.random()*3); i++) {
				let enemy = Math.random();
				if (enemy < 0.6) this.addEnemy(new Rat(this, 20*6 + Math.round(Math.random()*80)*6, 50*6));
				else if (enemy < 0.8) this.addEnemy(new Slime(this, 20*6 + Math.round(Math.random()*80)*6, 50*6));
				else  this.addEnemy(new SlimeBaby(this, 20*6 + Math.round(Math.random()*80)*6, 50*6));
			}
		}

		constructor(state: Dungeon, config: RoomConfig) {
			super(state.game, config.roomX * 192*6, config.roomY * 96*6, "dungeon_room");
			
			this.accessedTime = 0;
			this.scale.set(6, 6);
			this.state = state;

			this.enemies = [];
			this.config = config;
			this.accessed = this.config.start;

			this.addDecorations();

			if (!this.accessed) {
				this.populate();
			}

			if (config.start) {
				this.addChild(new Phaser.Sprite(this.game, 48, 48, "room_start_end", 0));
			}

			if (config.end) {
				this.addChild(new Phaser.Sprite(this.game, 48, 48, "room_start_end", 1));
			}
				
			if (config.ladderUp) {
				this.ladder = new DungeonLadder(this, 100, -43);
				this.addChild(this.ladder);
			}

			if (config.hasDoorLeft) {
				this.addChild(new Phaser.Sprite(this.game, -9, 39, "room_door_cover"));
				this.door = new DungeonDoor(this, -8, 40);
				this.addChild(this.door);
			}

			this.game.add.existing(this);
			state.roomsGroup.add(this);
			
			if (this.accessed) this.activate();
		}

		activate() {
			this.accessed = true;
			this.enableEnemies();
			this.enableTorches();
		}

		enableTorches() {
			for (let i of this.children) {
				if (i.constructor == DungeonTorch) {
					//@ts-ignore
					i.activate();
				}
			}
 		}

		doorOpened() {
			this.activate();
			let room = this.state.roomsMap[this.config.roomY][this.config.roomX - 1];
			if (room != null) {
				room.activate();
			}
		}

		ladderTravelled() {
			this.activate();
			let room = this.state.roomsMap[this.config.roomY - 1][this.config.roomY];
			if (room != null) {
				room.activate();
			}
		}

		update() {
			if (this.door != null) this.door.update();
			if (this.ladder != null) this.ladder.update();

			if (this.accessed) this.accessedTime++;
		}
	}
}
