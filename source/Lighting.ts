module RogueSide {
	export class Lighting {
		game: Phaser.Game;
		state: Dungeon;
		bmd: Phaser.BitmapData;
		spr: Phaser.Image;

		roomSprite: Phaser.Sprite;
		glowSprite: Phaser.Sprite;

		constructor(game: Phaser.Game, state: Dungeon) {
			this.game = game;
			this.state = state;
			this.bmd = game.add.bitmapData(Math.ceil(game.camera.width/6)+1, Math.ceil(game.camera.width/6)+1);
			this.spr = game.add.image(-5, -3, this.bmd);
			this.state.guiGroup.add(this.spr);
			this.spr.blendMode = Phaser.blendModes.MULTIPLY;
			this.spr.scale.set(6, 6);

			this.roomSprite = new Phaser.Sprite(this.game, -10000, -10000, 'room_shadow_overlay');
			this.glowSprite = new Phaser.Sprite(this.game, -10000, -1000, 'glow_overlay');
			this.glowSprite.anchor.set(0.5, 0.5);
		}

		update() {
			this.bmd.fill(0, 0, 0, 1);

			let baseX = Math.floor(this.game.camera.x/6);
			let baseY = Math.floor(this.game.camera.y/6);

			for (let i of this.state.roomsList) {
				if (i.accessed) {
					this.drawRoomRegion(i, baseX, baseY);
				}
			}

			for (let i of this.state.lightEmitters) {
				if (i.exists) {
					this.drawGlow(i, baseX, baseY);
				}
			}
		}

		drawGlow(spr: Phaser.Sprite, baseX: number, baseY: number) {
			//@ts-ignore
			let scale = spr.light_scale || 1;
			//@ts-ignore
			let alpha = spr.light_opacity || 1;

			if (alpha != 0) {
				this.glowSprite.scale.set(scale, scale);
				this.glowSprite.alpha = alpha;

				this.bmd.draw(this.glowSprite,
					(spr.world.x/6) - baseX, 
					(spr.world.y/6) + (spr.getBounds().halfHeight/6) - baseY, 
					this.glowSprite.width, this.glowSprite.height);

				this.glowSprite.scale.set(1.2, 1.2);
				this.glowSprite.alpha = 0.2;

				this.bmd.draw(this.glowSprite,
					(spr.world.x/6) - baseX, 
					(spr.world.y/6) + (spr.getBounds().halfHeight/6) - baseY, 
					this.glowSprite.width, this.glowSprite.height);
			}
		}

		drawRoomRegion(room: DungeonRoom, baseX: number, baseY: number) {
			if (room.accessed) {
				let alpha = Math.min(1, room.accessedTime/20) * 0.2;

				this.roomSprite.alpha = alpha;
				this.bmd.draw(this.roomSprite, (room.x/6) - baseX - 4, (room.y/6) - baseY - 4, 200, 88);
			}
		}
	}
}
