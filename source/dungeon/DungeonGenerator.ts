module RogueSide {
	export class DungeonGenerator {
		ROOM_X_BOUNDS: number = 10;
		ROOM_Y_BOUNDS: number = 6;
		ROOMS_SPREAD: number = 3;

		rooms: RoomConfig[][];

		generateRow(startX: number, endX: number, yLevel: number): number[] {
			let originX = startX + Math.round(Math.random() * (endX - startX));
			let left = Math.max(originX - Math.round(Math.random()*this.ROOMS_SPREAD), 0);
			let right = Math.min(originX + Math.round(Math.random()*this.ROOMS_SPREAD), this.ROOM_X_BOUNDS - 1);

			for (var i = left; i <= right; i++) {
				let room = new RoomConfig(i, yLevel);
				if (i != left) {
					room.hasDoorLeft = true;
				}
				if (i == originX) {
					room.ladderUp = true;
					this.rooms[yLevel - 1][i].ladderDown = true;
				}
				this.addRoom(room);
			}

			return [left, right];
		}

		generate(): RoomConfig[][] {
			this.rooms = [];
			for (var i = 0; i < this.ROOM_Y_BOUNDS; i++) {
				let inner = [];
				for (var j = 0; j < this.ROOM_X_BOUNDS; j++) {
					inner[j] = null;
				}
				this.rooms[i] = inner;
			}

			// let startX = Math.round(Math.random()*this.ROOM_X_BOUNDS);
			// let startRoom = new RoomConfig(startX, 0);
			// startRoom.start = true;
			// this.addRoom(startRoom);

			// let endY = this.ROOM_Y_BOUNDS / 2 + Math.round(Math.random()*(this.ROOM_Y_BOUNDS/2-2));
			
			// let xLeft = startX;
			// let xRight = startX;

			// for (var i = 1; i < endY; i++) {
			// 	let coords = this.generateRow(xLeft, xRight, i);
			// 	xLeft = coords[0];
			// 	xRight = coords[1];
			// }

			// let endX = xLeft + Math.round(Math.random() * (xRight - xLeft));
			// let endRoom = new RoomConfig(endX, endY);
			// endRoom.end = true;
			// endRoom.ladderUp = true;
			// this.rooms[endY-1][endX].ladderDown = true;
			// this.addRoom(endRoom);
			
			let room0 = new RoomConfig(4, 0);
			this.addRoom(room0);
			
			let room1 = new RoomConfig(5, 0);
			room1.start = true;
			room1.hasDoorLeft = true;
			this.addRoom(room1);

			let room2 = new RoomConfig(6, 0);
			room2.end = true;
			room2.hasDoorLeft = true;
			this.addRoom(room2);
			
			let room3 = new RoomConfig(5, 1);
			room3.ladderUp = true;
			this.addRoom(room3);

			return this.rooms;
		}

		addRoom(room: RoomConfig) {
			this.rooms[room.roomY][room.roomX] = room;
		}
	}
}
