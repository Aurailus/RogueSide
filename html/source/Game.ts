/// <reference path="../libraries/phaser-ce-2.10.3/typescript/phaser.d.ts"/>
/// <reference path="./types/socket.io.d.ts"/>
/// <reference path="./types/jquery.d.ts"/>
/// <reference path="./types/jscookie.d.ts"/>

module RogueSide {
	export class Game extends Phaser.Game {

		constructor() {
			let width = window.innerWidth;
			let height = window.innerHeight;

			let DEF_RENDERER = Phaser.AUTO;
			if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) DEF_RENDERER = Phaser.CANVAS;

			super(width, height, DEF_RENDERER, document.getElementById("game"), null, false, false, false);
			
			this.antialias = false;
			this.global = {
				socket: null
			};

			this.state.add('Boot', Boot, false);
			this.state.add('Preloader', Preloader, false);
			this.state.add('Dungeon', Dungeon, false);
			// this.state.add('MainMenu', MainMenu, false);

			this.state.start('Boot');
		}
	}

	window.onload = () => {
		var game = new Game();
	}
}
