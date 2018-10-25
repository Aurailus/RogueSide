module RogueSide {
	export class Enemy extends Phaser.Sprite {
		facingRight: boolean;
		state: Dungeon;
		health: number;
		active: boolean;
		raw: {x: number, y: number};
		vel: {x: number, y: number};
		hitbox: Phaser.Rectangle;
		invulnerabilityTimer: number;

		constructor(room: DungeonRoom, x: number, y: number, sprite: string) {
			super(room.game, room.x + x, room.y + y, sprite);
			this.state = room.state;
			
			this.scale.set(6, 6);
			this.anchor.set(0.5, 0);
			this.active = false;
			this.invulnerabilityTimer = -1;

			this.raw = {x: this.x, y: this.y};
			this.vel = {x: 0, y: 0};

			this.facingRight = Math.random() > 0.5;
			this.game.add.existing(this);
		}

		alert() {
			this.active = true;
			this.state.lightEmitters.push(this);
		}

		updateEnemy() {
			this.position.set(Math.round(this.raw.x/6)*6, Math.round(this.raw.y/6)*6);
			
			if (this.health <= 0) {
				this.destroy();
			}

			if (this.invulnerabilityTimer >= 0) {
				if (this.invulnerabilityTimer < 5) this.tint = 0xff0000;
				else this.tint = 0xffffff;

				this.invulnerabilityTimer++;
				if (this.invulnerabilityTimer >= 15) this.invulnerabilityTimer = -1;
			}
		}

		getHitbox(): Phaser.Rectangle {
			return new Phaser.Rectangle(this.hitbox.x*6 + this.world.x, this.hitbox.y*6  + this.world.y, this.hitbox.width*6, this.hitbox.height*6);
		}

		tryHitPlayer() {
			//@ts-ignore
			if (Phaser.Rectangle.intersects(this.getHitbox(), this.state.player.getHitbox())) {
				this.state.player.attackedBy(this);
				return true;
			}
			return false;
		}

		playerAttack(bounds: Phaser.Rectangle, damage: number) {
			// if (this.y - this.state.player.y < 100) console.log(bounds, this.getHitbox());
			if (Phaser.Rectangle.intersects(bounds, this.getHitbox()) && this.invulnerabilityTimer == -1) {
				console.log('attacked for ' + damage);
				this.health -= damage;
				this.invulnerabilityTimer = 0;
			}
		}

		checkIfFree(x: number, y: number) {
			if (y % (96*6) > 50*6) return false;

			let roomY = Math.floor(this.raw.y / (96*6));
			let roomX;

			roomX = Math.floor((x - 9*6) / (192*6));
			if (this.state.roomsMap[roomY][roomX] == null || !this.state.roomsMap[roomY][roomX].accessed) return false;
			roomX = Math.floor((x + 9*6) / (192*6));
			if (this.state.roomsMap[roomY][roomX] == null || !this.state.roomsMap[roomY][roomX].accessed) return false;

			if ((x % (192*6) <= 8*6 || x % (192*6) >= 192*6 - 8*6) && y % (96*6) < 36*6) return false;

			return true;
		}
	}
}
