module RogueSide {
	export class DungeonTorch extends Phaser.Sprite {
		room: DungeonRoom;
		light_opacity: number = 0.5;
		light_scale: number = 0.7;

		constructor(room: DungeonRoom, x: number, y: number) {
			super(room.game, x, y, "dungeon_torch");
			this.room = room;
			this.anchor.x = 0.5;

			this.room.state.lightEmitters.push(this);
			this.game.add.existing(this);
			this.room.addChild(this);
		}

		activate() {
			this.light_opacity = 1;
			this.light_scale = 1;
		}
	}
}