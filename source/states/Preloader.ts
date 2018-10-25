module RogueSide {
	export class Preloader extends Phaser.State {

		preloadBarBG: Phaser.Sprite;
		preloadBarFG: Phaser.Sprite;

		preload() {
			this.preloadBarBG = this.add.sprite(this.world.centerX - this.game.cache.getImage('preloader_bar').width/2, 
				this.world.centerY - this.game.cache.getImage('preloader_bar').height/2, 'preloader_bar');
			this.preloadBarBG.frame = 0;

			this.preloadBarFG = this.add.sprite(this.world.centerX - this.game.cache.getImage('preloader_bar').width/2, 
				this.world.centerY - this.game.cache.getImage('preloader_bar').height/2, 'preloader_bar');
			this.preloadBarFG.frame = 1;

			this.load.setPreloadSprite(this.preloadBarFG);
			this.load.image('dungeon_room', 'assets/room.png');

			this.load.image('room_door_cover', 'assets/door_cover.png');
			this.load.spritesheet('room_door', 'assets/door.png', 32, 32);
			this.load.image('room_ladder_top', 'assets/ladder_top.png');
			this.load.image('room_ladder_bottom', 'assets/ladder_bottom.png');
			this.load.spritesheet('room_start_end', 'assets/start_end.png', 16, 16);
			this.load.spritesheet('rogue_dog', 'assets/rogue_dog_spritesheet.png', 16, 16);
			this.load.spritesheet('rogue_dog_shadow', 'assets/rogue_dog_spritesheet_shadow.png', 16, 16);
			this.load.spritesheet('enemy_rat', 'assets/rat.png', 16, 16);
			this.load.spritesheet('enemy_slime', 'assets/slime.png', 16, 16);
			this.load.image('room_shadow_overlay', 'assets/room_shadow_overlay.png');
			this.load.image('glow_overlay', 'assets/glow_overlay.png');
			this.load.image('dungeon_torch', 'assets/torch.png');
			this.load.image('debug', 'assets/debug.png');
		}

		create() {
			this.game.state.start('Dungeon', true, false);
		}
	}
}
