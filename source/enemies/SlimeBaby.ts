module RogueSide {
	export class SlimeBaby extends Enemy {
		speed: number;
		jumping: boolean;
		jumpTimeout: number;
		hitInJump: boolean;
		light_scale: number = 0.75;
		light_opacity: number = 0.5;

		constructor(room: DungeonRoom, x: number, y: number) {
			super(room, x, y, "enemy_slime");
			this.speed = 0.85 + Math.random()*0.15;
			this.jumping = false;
			this.hitInJump = false;

			this.health = 10;
			
			this.hitbox = new Phaser.Rectangle(2, 8, 12, 8);

			this.animations.add("move", [4, 5, 6, 7], 12);
			this.animations.add("idle", [4, 5, 6, 7], 4);
		}

		jump() {
			this.jumping = true;
			this.hitInJump = false;
			this.vel.y = -10;
		}

		alert() {
			this.frame = 1;
			setTimeout(() => this.active = true, 50);
			this.state.lightEmitters.push(this);
		}

		update() {
			if (this.active) {
				if (!this.jumping) {
					this.vel.x = Math.max(Math.abs(this.vel.x) - 0.75, 0)*(this.vel.x > 0 ? 1 : -1);
					this.vel.y += 0.5;

					let dist = this.state.player.x - this.x;
					let mod = dist > 0 ? 1 : -1;
					
					dist = Math.abs(dist);

					if (this.jumpTimeout > 0) {
						this.jumpTimeout --;
						this.vel.x = this.facingRight ? 6 + (this.jumpTimeout/5) : -6 - (this.jumpTimeout/5);
					}
					else {
						if (dist > 36 * 6 || (mod < 0) == this.facingRight) this.vel.x = Math.min(Math.abs(this.vel.x) + 1 * this.speed, 6)*mod;
						else this.jump();
					}

					if (this.checkIfFree(this.raw.x + this.vel.x, this.raw.y)) {
						this.raw.x += this.vel.x;
					}

					if (!this.checkIfFree(this.raw.x, this.raw.y + 1)) {
						this.vel.y = -3;
					}

					let sign = (this.vel.y > 0 ? 1 : -1);
					for (let i = 0; i < Math.abs(this.vel.y); i++) {
						if (this.checkIfFree(this.raw.x, this.raw.y + sign)) {
							this.raw.y += sign;
						}
						else {
							this.vel.y = 0;
						}
					}
				}
				else {
					this.raw.x += 12 * (this.facingRight ? 1 : -1);
					this.vel.y ++;

					let sign = (this.vel.y > 0 ? 1 : -1);
					for (let i = 0; i < Math.abs(this.vel.y); i++) {
						if (this.checkIfFree(this.raw.x, this.raw.y + sign)) {
							this.raw.y += sign;
						}
						else {
							this.vel.y = 0;
							this.jumping = false;
							this.jumpTimeout = 20;
							break;
						}
					}

					if (!this.hitInJump) {
						this.hitInJump = this.tryHitKamikazi();
						if (this.hitInJump) {
							this.facingRight = !this.facingRight;
						}
					}
				}
				
				if (this.vel.x != 0 && this.jumpTimeout == 0) {
					if (this.jumping) {
						this.frame = 4;
					}
					else {
						this.facingRight = this.vel.x > 0;
						this.scale.x = (this.facingRight ? 6 : -6);
						this.animations.play('move');
					}
				}
				else {
					this.animations.play('move');
				}
			}
			else {
				this.animations.play('idle');
			}

			this.updateEnemy();
		}

		tryHitKamikazi(): boolean {
			let hit = this.tryHitPlayer();
			if (hit && Math.random() > 0.70) {
				this.health -= 5;
				this.invulnerabilityTimer = 0;
			}
			return hit;
		}
	}
}
