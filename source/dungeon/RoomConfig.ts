module RogueSide {
	export class RoomConfig {
		start: boolean;
		end: boolean;

		ladderUp: boolean;
		ladderDown: boolean;
		hasDoorLeft: boolean;

		roomX: number;
		roomY: number;

		constructor(x, y) {
			this.roomX = x;
			this.roomY = y;

			this.start = false;
			this.end = false;

			this.ladderUp = false;
			this.ladderDown = false;
			this.hasDoorLeft = false;
		}
	}
}
