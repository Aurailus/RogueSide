module RogueSide {
	export class Boot extends Phaser.State {
		preload() {
			this.stage.backgroundColor = "#001122";
			this.load.spritesheet('preloader_bar', '/assets/loading_bar.png', 48*6, 10*6, 2);
		}

		create() {
			// let style = {
			// 	font: "28px DPComic",
			// 	fontWeight: "300",
			// 	fill: "#ffff",
			// 	boundsAlignH: "center",
			// 	boundsAlignV: "center",
			// 	wordWrap: false
			// };
			// this.loadText = this.game.add.text(0, 0, "Loading Loader...", style);
			// this.loadText.setTextBounds(12, this.world.centerY + 60, this.world.width, 200);
			// this.loadText.alpha = 0;

			// setTimeout(function(ctxt) {
			// 	ctxt.add.tween(ctxt.loadText).to({alpha: 1}, 200, Phaser.Easing.Linear.None, true);
			// }, 1000, this)

			//Enable 5 pointers
	    this.input.addPointer();
	    this.input.addPointer();
	    this.input.addPointer();

	    //Disable Right click menu
			this.game.canvas.oncontextmenu = function (e) { e.preventDefault(); }
			
			//Dont pause on lost focus
			this.stage.disableVisibilityChange = true;

			//Enable FPS counting
			this.game.time.advancedTiming = true;

			//Idk
			this.game.config.enableDebug = false;

			this.startPreloader();
		}

		startPreloader() {
			this.game.state.start('Preloader', true, false);
		}
	}
}
