module RogueSide {
	export class DungeonLadder extends Phaser.Sprite {
		parent: DungeonRoom;
		state: Dungeon;
		climbed: boolean;

		constructor(parent: DungeonRoom, x: number, y: number) {
			super(parent.state.game, x, y, "room_ladder_top");
			this.parent = parent;
			this.state = parent.state;
			this.climbed = false;

			this.addChild(new Phaser.Sprite(this.state.game, 0, y + 95, "room_ladder_bottom"));
			
			this.state.game.add.existing(this);
		}

		update() {
			let player = this.state.player;

			if (this.world.x - 32 < player.x - 10 && this.world.x + this.width + 32 > player.x - 100) {

				if (this.world.y - player.y < 40 && this.world.y - player.y > 0 && player.keys[3].isDown && !player.climbingLadder) {
					player.climbingLadder = true;
					this.game.tweens.create(player).to({x: this.world.x + this.width*6/2}, 100, Phaser.Easing.Quartic.Out, true);
					this.game.tweens.create(player).to({y: player.y + (96*6)}, 500, Phaser.Easing.Quartic.Out, true, 50).onComplete.add(() => {
						player.raw.x = player.x;
						player.raw.y = player.y;
						player.climbingLadder = false;
					});

					if (!this.climbed) {
						this.climbed = true;
						this.parent.ladderTravelled();
					}
				}

				if (this.world.y - player.y < -400 && this.world.y - player.y > -600 && player.keys[2].isDown && !player.climbingLadder) {
					player.climbingLadder = true;
					this.game.tweens.create(player).to({x: this.world.x + this.width*6/2}, 100, Phaser.Easing.Quartic.Out, true);
					this.game.tweens.create(player).to({y: this.world.y - 18}, 500, Phaser.Easing.Quartic.Out, true, 50).onComplete.add(() => {
						player.raw.x = player.x;
						player.raw.y = player.y;
						player.climbingLadder = false;
					});

					if (!this.climbed) {
						this.climbed = true;
						this.parent.ladderTravelled();
					}
				}
			}
		}
	}
}
