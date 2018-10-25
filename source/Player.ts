module RogueSide {
	export class Player extends Phaser.Sprite {
		INVISIBLE_TIME = 600;

		state: Dungeon;
		keys: Phaser.Key[];

		facingRight: boolean;
		attackTime: number;
		attackWasMoving: boolean;
		invisibleTime: number;

		climbingLadder: boolean;

		velocity: {x: number, y: number};
		raw: {x: number, y: number};

		hitbox: Phaser.Rectangle;

		constructor(state: Dungeon, startingRoom: DungeonRoom) {
			super(state.game, startingRoom.x + 258, startingRoom.y + 300, "rogue_dog", 0);
			this.scale.set(6, 6);
			this.anchor.set(0.5, 0);

			this.state = state;

			this.animations.add('stand', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 8, true);
			this.animations.add('walk', [10, 11, 12, 13, 14, 15], 16, true);
			this.animations.add('attack', [20, 21, 22, 23, 24, 24, 25], 24, true);

			this.keys = [
				this.game.input.keyboard.addKey(Phaser.Keyboard.A),
				this.game.input.keyboard.addKey(Phaser.Keyboard.D),
				this.game.input.keyboard.addKey(Phaser.Keyboard.W),
				this.game.input.keyboard.addKey(Phaser.Keyboard.S),
				this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
			];

			this.facingRight = true;
			this.attackTime = -1;
			this.attackWasMoving = false;
			this.invisibleTime = -1;

			this.climbingLadder = false;

			this.hitbox = new Phaser.Rectangle(2, 2, 12, 12);

			this.velocity = {x: 0, y: 0};
			this.raw = {x: this.x, y: this.y};

			this.game.add.existing(this);
			this.animations.play('stand');
		}

		handleInput() {
			let [left, right, up, down, space] = this.keys;

			if (this.attackTime >= 0) {
				let int = 0;

				if (this.attackTime < 4) int = 12;
				if (this.attackTime < 10) int = 6;
				else if (this.attackTime < 24) int = 3;
				else if (this.attackWasMoving && this.attackTime < 36) int = 1.5;

				if (this.attackWasMoving) int *= 2;

				this.velocity.x = (this.facingRight ? int : -int);
			}
			else {
				if (left.isDown && !right.isDown) {
					this.facingRight = false;
					this.velocity.x = -6;
				}
				else if (right.isDown && !left.isDown) {
					this.facingRight = true;
					this.velocity.x = 6;
				}
				else this.velocity.x = 0;
			}

			if (this.checkIfFree(this.raw.x, this.raw.y + 1)) {
				if (this.velocity.y < 5) this.velocity.y += 1;
				else if (this.velocity.y < 3) this.velocity.y += 0.05;
				else this.velocity.y += 0.25;
			} 
			else this.velocity.y = 0;

			if (space.downDuration(50) && !this.checkIfFree(this.raw.x, this.raw.y + 1)) this.velocity.y = -17;
			
			// if (up.downDuration(8)) this.raw.y -= 96*6;
			// if (down.downDuration(8)) this.raw.y += 96*6;

			if (this.game.input.activePointer.leftButton.isDown && (this.attackTime == -1 || this.attackTime >= 36)) {
				this.attackTime = 0;
				this.attackWasMoving = this.velocity.x != 0;
			}

			if (this.game.input.activePointer.rightButton.isDown && this.invisibleTime == -1) {
				this.invisibleTime = 0;
				this.loadTexture('rogue_dog_shadow');
			}
		}

		update() {
			this.scale.set((this.facingRight ? 6 : -6), 6);
			
			if (!this.climbingLadder) {
				this.handleInput();

				if (this.invisibleTime >= 0) {
					this.invisibleTime++;
					if (this.invisibleTime > this.INVISIBLE_TIME) {
						this.loadTexture('rogue_dog');
						this.invisibleTime = -1;
					}
				}

				if (this.attackTime >= 0) {
					this.animations.play('attack');

					this.attackTime ++;
					if (this.attackTime > 46) this.attackTime = -1;
				}
				else if (this.velocity.x != 0) {
					this.animations.play('walk');
				}
				else {
					this.animations.play('stand');
				}

				if (this.checkIfFree(this.raw.x + this.velocity.x, this.raw.y)) {
					this.raw.x += this.velocity.x;
				}

				while (!this.checkIfFree(this.raw.x, this.raw.y + this.velocity.y) && this.velocity.y != 0) {
					this.velocity.y -= (this.velocity.y > 0) ? 1 : -1;
				}
				
				this.raw.y += this.velocity.y;

				this.position.set(Math.round(this.raw.x/6)*6, Math.round(this.raw.y/6)*6);
			}

			if (this.attackTime >= 0 && this.attackTime < 10) {
				this.state.playerAttack(this.x + this.width*0.3 - (this.facingRight ? 0 : 80), this.y, 80, 100, this.facingRight, 5);
			}
		}

		getHitbox(): Phaser.Rectangle {
			return new Phaser.Rectangle(this.hitbox.x*6 + this.world.x, this.hitbox.y*6  + this.world.y, this.hitbox.width*6, this.hitbox.height*6);
		}

		checkIfFree(x: number, y: number) {
			if (y % (96*6) > 50*6) return false;

			let roomY = Math.floor(this.raw.y / (96*6));
			let roomX;

			roomX = Math.floor((x - 9*6) / (192*6));
			if (this.state.roomsMap[roomY][roomX] == null) return false;
			roomX = Math.floor((x + 9*6) / (192*6));
			if (this.state.roomsMap[roomY][roomX] == null) return false;

			if ((x % (192*6) <= 8*6 || x % (192*6) >= 192*6 - 8*6) && y % (96*6) < 36*6) return false;

			return true;
		}

		attackedBy(enemy: Enemy) {
			console.log('attacked by ' + enemy);
		}
	}
}
