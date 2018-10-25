module RogueSide {
	export class DungeonDoor extends Phaser.Sprite {
		parent: DungeonRoom;
		open: boolean;

		constructor(parent: DungeonRoom, x: number, y: number) {
			super(parent.game, x, y, "room_door");
			this.parent = parent;
			this.open = false;
			this.animations.add('open', [0, 1, 2, 3, 4, 5, 3, 5], 28, false);
			this.game.add.existing(this);
		}

		update() {
			let player = this.parent.state.player;

			if (this.world.x - 32 < player.x && this.world.x + this.width + 32 > player.x - 40 && Math.abs(this.world.y - player.y) < 100 && !this.open) {
				if (player.x > this.world.x + this.width) {
					this.scale.x = -1;
					this.x -= Math.round(this.width/2) + 1;
				}
				this.animations.play('open');
				this.open = true;

				this.parent.doorOpened();
			}
		}
	}
}
