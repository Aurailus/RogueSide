/// <reference path="../libraries/phaser-ce-2.10.3/typescript/phaser.d.ts"/>
/// <reference path="./types/socket.io.d.ts"/>
/// <reference path="./types/jquery.d.ts"/>
/// <reference path="./types/jscookie.d.ts"/>
var RogueSide;
(function (RogueSide) {
    class Game extends Phaser.Game {
        constructor() {
            let width = window.innerWidth;
            let height = window.innerHeight;
            let DEF_RENDERER = Phaser.AUTO;
            if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1)
                DEF_RENDERER = Phaser.CANVAS;
            super(width, height, DEF_RENDERER, document.getElementById("game"), null, false, false, false);
            this.antialias = false;
            this.global = {
                socket: null
            };
            this.state.add('Boot', RogueSide.Boot, false);
            this.state.add('Preloader', RogueSide.Preloader, false);
            this.state.add('Dungeon', RogueSide.Dungeon, false);
            // this.state.add('MainMenu', MainMenu, false);
            this.state.start('Boot');
        }
    }
    RogueSide.Game = Game;
    window.onload = () => {
        var game = new Game();
    };
})(RogueSide || (RogueSide = {}));
var RogueSide;
(function (RogueSide) {
    class Lighting {
        constructor(game, state) {
            this.game = game;
            this.state = state;
            this.bmd = game.add.bitmapData(Math.ceil(game.camera.width / 6) + 1, Math.ceil(game.camera.width / 6) + 1);
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
            let baseX = Math.floor(this.game.camera.x / 6);
            let baseY = Math.floor(this.game.camera.y / 6);
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
        drawGlow(spr, baseX, baseY) {
            //@ts-ignore
            let scale = spr.light_scale || 1;
            //@ts-ignore
            let alpha = spr.light_opacity || 1;
            if (alpha != 0) {
                this.glowSprite.scale.set(scale, scale);
                this.glowSprite.alpha = alpha;
                this.bmd.draw(this.glowSprite, (spr.world.x / 6) - baseX, (spr.world.y / 6) + (spr.getBounds().halfHeight / 6) - baseY, this.glowSprite.width, this.glowSprite.height);
                this.glowSprite.scale.set(1.2, 1.2);
                this.glowSprite.alpha = 0.2;
                this.bmd.draw(this.glowSprite, (spr.world.x / 6) - baseX, (spr.world.y / 6) + (spr.getBounds().halfHeight / 6) - baseY, this.glowSprite.width, this.glowSprite.height);
            }
        }
        drawRoomRegion(room, baseX, baseY) {
            if (room.accessed) {
                let alpha = Math.min(1, room.accessedTime / 20) * 0.2;
                this.roomSprite.alpha = alpha;
                this.bmd.draw(this.roomSprite, (room.x / 6) - baseX - 4, (room.y / 6) - baseY - 4, 200, 88);
            }
        }
    }
    RogueSide.Lighting = Lighting;
})(RogueSide || (RogueSide = {}));
var RogueSide;
(function (RogueSide) {
    class Player extends Phaser.Sprite {
        constructor(state, startingRoom) {
            super(state.game, startingRoom.x + 258, startingRoom.y + 300, "rogue_dog", 0);
            this.INVISIBLE_TIME = 600;
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
            this.velocity = { x: 0, y: 0 };
            this.raw = { x: this.x, y: this.y };
            this.game.add.existing(this);
            this.animations.play('stand');
        }
        handleInput() {
            let [left, right, up, down, space] = this.keys;
            if (this.attackTime >= 0) {
                let int = 0;
                if (this.attackTime < 4)
                    int = 12;
                if (this.attackTime < 10)
                    int = 6;
                else if (this.attackTime < 24)
                    int = 3;
                else if (this.attackWasMoving && this.attackTime < 36)
                    int = 1.5;
                if (this.attackWasMoving)
                    int *= 2;
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
                else
                    this.velocity.x = 0;
            }
            if (this.checkIfFree(this.raw.x, this.raw.y + 1)) {
                if (this.velocity.y < 5)
                    this.velocity.y += 1;
                else if (this.velocity.y < 3)
                    this.velocity.y += 0.05;
                else
                    this.velocity.y += 0.25;
            }
            else
                this.velocity.y = 0;
            if (space.downDuration(50) && !this.checkIfFree(this.raw.x, this.raw.y + 1))
                this.velocity.y = -17;
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
                    this.attackTime++;
                    if (this.attackTime > 46)
                        this.attackTime = -1;
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
                this.position.set(Math.round(this.raw.x / 6) * 6, Math.round(this.raw.y / 6) * 6);
            }
            if (this.attackTime >= 0 && this.attackTime < 10) {
                this.state.playerAttack(this.x + this.width * 0.3 - (this.facingRight ? 0 : 80), this.y, 80, 100, this.facingRight, 5);
            }
        }
        getHitbox() {
            return new Phaser.Rectangle(this.hitbox.x * 6 + this.world.x, this.hitbox.y * 6 + this.world.y, this.hitbox.width * 6, this.hitbox.height * 6);
        }
        checkIfFree(x, y) {
            if (y % (96 * 6) > 50 * 6)
                return false;
            let roomY = Math.floor(this.raw.y / (96 * 6));
            let roomX;
            roomX = Math.floor((x - 9 * 6) / (192 * 6));
            if (this.state.roomsMap[roomY][roomX] == null)
                return false;
            roomX = Math.floor((x + 9 * 6) / (192 * 6));
            if (this.state.roomsMap[roomY][roomX] == null)
                return false;
            if ((x % (192 * 6) <= 8 * 6 || x % (192 * 6) >= 192 * 6 - 8 * 6) && y % (96 * 6) < 36 * 6)
                return false;
            return true;
        }
        attackedBy(enemy) {
            console.log('attacked by ' + enemy);
        }
    }
    RogueSide.Player = Player;
})(RogueSide || (RogueSide = {}));
var RogueSide;
(function (RogueSide) {
    class DungeonDoor extends Phaser.Sprite {
        constructor(parent, x, y) {
            super(parent.game, x, y, "room_door");
            this.parent = parent;
            this.open = false;
            this.animations.add('open', [0, 1, 2, 3, 4, 5, 3, 5], 28, false);
            this.game.add.existing(this);
        }
        update() {
            let player = this.parent.state.player;
            if (this.world.x - 32 < player.x && this.world.x + this.width + 32 > player.x - 40 && Math.abs(this.world.y - player.y) < 100 && !this.open) {
                if (player.x > this.world.x + this.width) {
                    this.scale.x = -1;
                    this.x -= Math.round(this.width / 2) + 1;
                }
                this.animations.play('open');
                this.open = true;
                this.parent.doorOpened();
            }
        }
    }
    RogueSide.DungeonDoor = DungeonDoor;
})(RogueSide || (RogueSide = {}));
var RogueSide;
(function (RogueSide) {
    class DungeonGenerator {
        constructor() {
            this.ROOM_X_BOUNDS = 10;
            this.ROOM_Y_BOUNDS = 6;
            this.ROOMS_SPREAD = 3;
        }
        generateRow(startX, endX, yLevel) {
            let originX = startX + Math.round(Math.random() * (endX - startX));
            let left = Math.max(originX - Math.round(Math.random() * this.ROOMS_SPREAD), 0);
            let right = Math.min(originX + Math.round(Math.random() * this.ROOMS_SPREAD), this.ROOM_X_BOUNDS - 1);
            for (var i = left; i <= right; i++) {
                let room = new RogueSide.RoomConfig(i, yLevel);
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
        generate() {
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
            let room0 = new RogueSide.RoomConfig(4, 0);
            this.addRoom(room0);
            let room1 = new RogueSide.RoomConfig(5, 0);
            room1.start = true;
            room1.hasDoorLeft = true;
            this.addRoom(room1);
            let room2 = new RogueSide.RoomConfig(6, 0);
            room2.end = true;
            room2.hasDoorLeft = true;
            this.addRoom(room2);
            let room3 = new RogueSide.RoomConfig(5, 1);
            room3.ladderUp = true;
            this.addRoom(room3);
            return this.rooms;
        }
        addRoom(room) {
            this.rooms[room.roomY][room.roomX] = room;
        }
    }
    RogueSide.DungeonGenerator = DungeonGenerator;
})(RogueSide || (RogueSide = {}));
var RogueSide;
(function (RogueSide) {
    class DungeonLadder extends Phaser.Sprite {
        constructor(parent, x, y) {
            super(parent.state.game, x, y, "room_ladder_top");
            this.parent = parent;
            this.state = parent.state;
            this.climbed = false;
            this.addChild(new Phaser.Sprite(this.state.game, 0, y + 95, "room_ladder_bottom"));
            this.state.game.add.existing(this);
        }
        update() {
            let player = this.state.player;
            if (this.world.x - 32 < player.x - 10 && this.world.x + this.width + 32 > player.x - 100) {
                if (this.world.y - player.y < 40 && this.world.y - player.y > 0 && player.keys[3].isDown && !player.climbingLadder) {
                    player.climbingLadder = true;
                    this.game.tweens.create(player).to({ x: this.world.x + this.width * 6 / 2 }, 100, Phaser.Easing.Quartic.Out, true);
                    this.game.tweens.create(player).to({ y: player.y + (96 * 6) }, 500, Phaser.Easing.Quartic.Out, true, 50).onComplete.add(() => {
                        player.raw.x = player.x;
                        player.raw.y = player.y;
                        player.climbingLadder = false;
                    });
                    if (!this.climbed) {
                        this.climbed = true;
                        this.parent.ladderTravelled();
                    }
                }
                if (this.world.y - player.y < -400 && this.world.y - player.y > -600 && player.keys[2].isDown && !player.climbingLadder) {
                    player.climbingLadder = true;
                    this.game.tweens.create(player).to({ x: this.world.x + this.width * 6 / 2 }, 100, Phaser.Easing.Quartic.Out, true);
                    this.game.tweens.create(player).to({ y: this.world.y - 18 }, 500, Phaser.Easing.Quartic.Out, true, 50).onComplete.add(() => {
                        player.raw.x = player.x;
                        player.raw.y = player.y;
                        player.climbingLadder = false;
                    });
                    if (!this.climbed) {
                        this.climbed = true;
                        this.parent.ladderTravelled();
                    }
                }
            }
        }
    }
    RogueSide.DungeonLadder = DungeonLadder;
})(RogueSide || (RogueSide = {}));
var RogueSide;
(function (RogueSide) {
    class DungeonRoom extends Phaser.Sprite {
        constructor(state, config) {
            super(state.game, config.roomX * 192 * 6, config.roomY * 96 * 6, "dungeon_room");
            this.accessedTime = 0;
            this.scale.set(6, 6);
            this.state = state;
            this.enemies = [];
            this.config = config;
            this.accessed = this.config.start;
            this.addDecorations();
            if (!this.accessed) {
                this.populate();
            }
            if (config.start) {
                this.addChild(new Phaser.Sprite(this.game, 48, 48, "room_start_end", 0));
            }
            if (config.end) {
                this.addChild(new Phaser.Sprite(this.game, 48, 48, "room_start_end", 1));
            }
            if (config.ladderUp) {
                this.ladder = new RogueSide.DungeonLadder(this, 100, -43);
                this.addChild(this.ladder);
            }
            if (config.hasDoorLeft) {
                this.addChild(new Phaser.Sprite(this.game, -9, 39, "room_door_cover"));
                this.door = new RogueSide.DungeonDoor(this, -8, 40);
                this.addChild(this.door);
            }
            this.game.add.existing(this);
            state.roomsGroup.add(this);
            if (this.accessed)
                this.activate();
        }
        enableEnemies() {
            for (let i of this.enemies) {
                setTimeout(() => i.alert(), Math.random() * 300 + 50);
            }
        }
        addEnemy(enemy) {
            this.enemies.push(enemy);
            this.state.enemiesGroup.add(enemy);
        }
        addDecorations() {
            new RogueSide.DungeonTorch(this, 40, 25);
            new RogueSide.DungeonTorch(this, 150, 25);
        }
        populate() {
            for (let i = 0; i < 1 + Math.round(Math.random() * 3); i++) {
                let enemy = Math.random();
                if (enemy < 0.6)
                    this.addEnemy(new RogueSide.Rat(this, 20 * 6 + Math.round(Math.random() * 80) * 6, 50 * 6));
                else if (enemy < 0.8)
                    this.addEnemy(new RogueSide.Slime(this, 20 * 6 + Math.round(Math.random() * 80) * 6, 50 * 6));
                else
                    this.addEnemy(new RogueSide.SlimeBaby(this, 20 * 6 + Math.round(Math.random() * 80) * 6, 50 * 6));
            }
        }
        activate() {
            this.accessed = true;
            this.enableEnemies();
            this.enableTorches();
        }
        enableTorches() {
            for (let i of this.children) {
                if (i.constructor == RogueSide.DungeonTorch) {
                    //@ts-ignore
                    i.activate();
                }
            }
        }
        doorOpened() {
            this.activate();
            let room = this.state.roomsMap[this.config.roomY][this.config.roomX - 1];
            if (room != null) {
                room.activate();
            }
        }
        ladderTravelled() {
            this.activate();
            let room = this.state.roomsMap[this.config.roomY - 1][this.config.roomY];
            if (room != null) {
                room.activate();
            }
        }
        update() {
            if (this.door != null)
                this.door.update();
            if (this.ladder != null)
                this.ladder.update();
            if (this.accessed)
                this.accessedTime++;
        }
    }
    RogueSide.DungeonRoom = DungeonRoom;
})(RogueSide || (RogueSide = {}));
var RogueSide;
(function (RogueSide) {
    class DungeonTorch extends Phaser.Sprite {
        constructor(room, x, y) {
            super(room.game, x, y, "dungeon_torch");
            this.light_opacity = 0.5;
            this.light_scale = 0.7;
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
    RogueSide.DungeonTorch = DungeonTorch;
})(RogueSide || (RogueSide = {}));
var RogueSide;
(function (RogueSide) {
    class RoomConfig {
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
    RogueSide.RoomConfig = RoomConfig;
})(RogueSide || (RogueSide = {}));
var RogueSide;
(function (RogueSide) {
    class Enemy extends Phaser.Sprite {
        constructor(room, x, y, sprite) {
            super(room.game, room.x + x, room.y + y, sprite);
            this.state = room.state;
            this.scale.set(6, 6);
            this.anchor.set(0.5, 0);
            this.active = false;
            this.invulnerabilityTimer = -1;
            this.raw = { x: this.x, y: this.y };
            this.vel = { x: 0, y: 0 };
            this.facingRight = Math.random() > 0.5;
            this.game.add.existing(this);
        }
        alert() {
            this.active = true;
            this.state.lightEmitters.push(this);
        }
        updateEnemy() {
            this.position.set(Math.round(this.raw.x / 6) * 6, Math.round(this.raw.y / 6) * 6);
            if (this.health <= 0) {
                this.destroy();
            }
            if (this.invulnerabilityTimer >= 0) {
                if (this.invulnerabilityTimer < 5)
                    this.tint = 0xff0000;
                else
                    this.tint = 0xffffff;
                this.invulnerabilityTimer++;
                if (this.invulnerabilityTimer >= 15)
                    this.invulnerabilityTimer = -1;
            }
        }
        getHitbox() {
            return new Phaser.Rectangle(this.hitbox.x * 6 + this.world.x, this.hitbox.y * 6 + this.world.y, this.hitbox.width * 6, this.hitbox.height * 6);
        }
        tryHitPlayer() {
            //@ts-ignore
            if (Phaser.Rectangle.intersects(this.getHitbox(), this.state.player.getHitbox())) {
                this.state.player.attackedBy(this);
                return true;
            }
            return false;
        }
        playerAttack(bounds, damage) {
            // if (this.y - this.state.player.y < 100) console.log(bounds, this.getHitbox());
            if (Phaser.Rectangle.intersects(bounds, this.getHitbox()) && this.invulnerabilityTimer == -1) {
                console.log('attacked for ' + damage);
                this.health -= damage;
                this.invulnerabilityTimer = 0;
            }
        }
        checkIfFree(x, y) {
            if (y % (96 * 6) > 50 * 6)
                return false;
            let roomY = Math.floor(this.raw.y / (96 * 6));
            let roomX;
            roomX = Math.floor((x - 9 * 6) / (192 * 6));
            if (this.state.roomsMap[roomY][roomX] == null || !this.state.roomsMap[roomY][roomX].accessed)
                return false;
            roomX = Math.floor((x + 9 * 6) / (192 * 6));
            if (this.state.roomsMap[roomY][roomX] == null || !this.state.roomsMap[roomY][roomX].accessed)
                return false;
            if ((x % (192 * 6) <= 8 * 6 || x % (192 * 6) >= 192 * 6 - 8 * 6) && y % (96 * 6) < 36 * 6)
                return false;
            return true;
        }
    }
    RogueSide.Enemy = Enemy;
})(RogueSide || (RogueSide = {}));
var RogueSide;
(function (RogueSide) {
    class Rat extends RogueSide.Enemy {
        constructor(room, x, y) {
            super(room, x, y, "enemy_rat");
            this.light_scale = 0.75;
            this.light_opacity = 0.5;
            this.speed = 0.85 + Math.random() * 0.15;
            this.jumping = false;
            this.hitInJump = false;
            this.health = 15;
            this.hitbox = new Phaser.Rectangle(2, 10, 12, 6);
            this.animations.add("move", [2, 3], 12);
        }
        jump() {
            this.jumping = true;
            this.hitInJump = false;
            this.vel.y = -8;
        }
        alert() {
            this.frame = 1;
            setTimeout(() => this.active = true, 50);
            this.state.lightEmitters.push(this);
        }
        update() {
            if (this.active) {
                if (!this.jumping) {
                    this.vel.x = Math.max(Math.abs(this.vel.x) - 0.75, 0) * (this.vel.x > 0 ? 1 : -1);
                    let dist = this.state.player.x - this.x;
                    let mod = dist > 0 ? 1 : -1;
                    dist = Math.abs(dist);
                    if (this.jumpTimeout > 0) {
                        this.jumpTimeout--;
                        this.vel.x = this.facingRight ? 6 + (this.jumpTimeout / 5) : -6 - (this.jumpTimeout / 5);
                    }
                    else {
                        if (dist > 36 * 6 || (mod < 0) == this.facingRight)
                            this.vel.x += 1 * mod * this.speed;
                        else
                            this.jump();
                    }
                    if (this.checkIfFree(this.raw.x + this.vel.x, this.raw.y)) {
                        this.raw.x += this.vel.x;
                    }
                }
                else {
                    this.raw.x += 12 * (this.facingRight ? 1 : -1);
                    this.vel.y++;
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
                    this.frame = 1;
                }
            }
            this.updateEnemy();
        }
        tryHitKamikazi() {
            let hit = this.tryHitPlayer();
            if (hit && Math.random() > 0.70) {
                this.health -= 5;
                this.invulnerabilityTimer = 0;
            }
            return hit;
        }
    }
    RogueSide.Rat = Rat;
})(RogueSide || (RogueSide = {}));
var RogueSide;
(function (RogueSide) {
    class Slime extends RogueSide.Enemy {
        constructor(room, x, y) {
            super(room, x, y, "enemy_slime");
            this.light_scale = 0.75;
            this.light_opacity = 0.5;
            this.speed = 0.85 + Math.random() * 0.15;
            this.jumping = false;
            this.hitInJump = false;
            this.health = 15;
            this.hitbox = new Phaser.Rectangle(2, 8, 12, 8);
            this.animations.add("move", [0, 1, 2, 3], 8);
            this.animations.add("idle", [0, 1, 2, 3], 4);
        }
        jump() {
            this.jumping = true;
            this.hitInJump = false;
            this.vel.y = -12;
        }
        alert() {
            this.frame = 1;
            setTimeout(() => this.active = true, 50);
            this.state.lightEmitters.push(this);
        }
        update() {
            if (this.active) {
                if (!this.jumping) {
                    this.vel.x = Math.max(Math.abs(this.vel.x) - 0.75, 0) * (this.vel.x > 0 ? 1 : -1);
                    this.vel.y += 0.5;
                    let dist = this.state.player.x - this.x;
                    let mod = dist > 0 ? 1 : -1;
                    dist = Math.abs(dist);
                    if (this.jumpTimeout > 0) {
                        this.jumpTimeout--;
                        this.vel.x = this.facingRight ? 6 + (this.jumpTimeout / 5) : -6 - (this.jumpTimeout / 5);
                    }
                    else {
                        if (dist > 36 * 6 || (mod < 0) == this.facingRight)
                            this.vel.x = Math.min(Math.abs(this.vel.x) + 1 * this.speed, 8) * mod;
                        else
                            this.jump();
                    }
                    if (this.checkIfFree(this.raw.x + this.vel.x, this.raw.y)) {
                        this.raw.x += this.vel.x;
                    }
                    if (!this.checkIfFree(this.raw.x, this.raw.y + 1)) {
                        this.vel.y = -4;
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
                    this.vel.y++;
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
        tryHitKamikazi() {
            let hit = this.tryHitPlayer();
            if (hit && Math.random() > 0.70) {
                this.health -= 5;
                this.invulnerabilityTimer = 0;
            }
            return hit;
        }
    }
    RogueSide.Slime = Slime;
})(RogueSide || (RogueSide = {}));
var RogueSide;
(function (RogueSide) {
    class SlimeBaby extends RogueSide.Enemy {
        constructor(room, x, y) {
            super(room, x, y, "enemy_slime");
            this.light_scale = 0.75;
            this.light_opacity = 0.5;
            this.speed = 0.85 + Math.random() * 0.15;
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
                    this.vel.x = Math.max(Math.abs(this.vel.x) - 0.75, 0) * (this.vel.x > 0 ? 1 : -1);
                    this.vel.y += 0.5;
                    let dist = this.state.player.x - this.x;
                    let mod = dist > 0 ? 1 : -1;
                    dist = Math.abs(dist);
                    if (this.jumpTimeout > 0) {
                        this.jumpTimeout--;
                        this.vel.x = this.facingRight ? 6 + (this.jumpTimeout / 5) : -6 - (this.jumpTimeout / 5);
                    }
                    else {
                        if (dist > 36 * 6 || (mod < 0) == this.facingRight)
                            this.vel.x = Math.min(Math.abs(this.vel.x) + 1 * this.speed, 6) * mod;
                        else
                            this.jump();
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
                    this.vel.y++;
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
        tryHitKamikazi() {
            let hit = this.tryHitPlayer();
            if (hit && Math.random() > 0.70) {
                this.health -= 5;
                this.invulnerabilityTimer = 0;
            }
            return hit;
        }
    }
    RogueSide.SlimeBaby = SlimeBaby;
})(RogueSide || (RogueSide = {}));
var RogueSide;
(function (RogueSide) {
    class Boot extends Phaser.State {
        preload() {
            this.stage.backgroundColor = "#001122";
            this.load.spritesheet('preloader_bar', '/assets/loading_bar.png', 48 * 6, 10 * 6, 2);
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
            this.game.canvas.oncontextmenu = function (e) { e.preventDefault(); };
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
    RogueSide.Boot = Boot;
})(RogueSide || (RogueSide = {}));
var RogueSide;
(function (RogueSide) {
    class Dungeon extends Phaser.State {
        create() {
            this.stage.backgroundColor = "#263643";
            this.lightEmitters = [];
            this.input.keyboard.addKey(Phaser.Keyboard.BACKWARD_SLASH).onDown.add(function () {
                this.debug = !this.debug;
            }, this);
            this.roomsGroup = this.game.add.group();
            this.worldObjectsGroup = this.game.add.group();
            this.playersGroup = this.game.add.group();
            this.enemiesGroup = this.game.add.group();
            this.itemsGroup = this.game.add.group();
            this.particleGroup = this.game.add.group();
            this.guiGroup = this.game.add.group(null, 'gui_group', true);
            let generator = new RogueSide.DungeonGenerator();
            this.world.setBounds(-10000, -10000, Number.MAX_VALUE, Number.MAX_VALUE);
            let map = generator.generate();
            this.roomsList = [];
            this.roomsMap = [];
            for (var i = 0; i < map.length; i++) {
                this.roomsMap[i] = [];
                for (var j = 0; j < map[i].length; j++) {
                    if (map[i][j] != null) {
                        let room = new RogueSide.DungeonRoom(this, map[i][j]);
                        this.roomsList.push(room);
                        this.roomsMap[i][j] = room;
                    }
                    else {
                        this.roomsMap[i][j] = null;
                    }
                }
            }
            for (var i = 0; i < this.roomsList.length; i++) {
                if (this.roomsList[i].config.start) {
                    this.player = new RogueSide.Player(this, this.roomsList[i]);
                    this.playersGroup.add(this.player);
                    this.player.bringToTop();
                }
            }
            this.lightEmitters.push(this.player);
            this.lighting = new RogueSide.Lighting(this.game, this);
        }
        update() {
            for (let i of this.playersGroup.children) {
                //@ts-ignore
                i.update();
            }
            for (let i of this.roomsGroup.children) {
                //@ts-ignore
                i.update();
            }
            this.camera.x = this.player.x - this.camera.width / 2;
            this.camera.y = this.player.y - this.camera.height / 2;
            this.lighting.update();
        }
        postRender() {
            if (this.debug) {
                this.game.debug.cameraInfo(this.camera, 64, 16);
                this.game.debug.bodyInfo(this.player, 64, 150);
                this.game.debug.spriteBounds(this.player);
                this.game.debug.pointer(this.game.input.mousePointer);
                this.game.debug.pointer(this.game.input.pointer1);
                this.game.debug.pointer(this.game.input.pointer2);
                this.game.debug.pointer(this.game.input.pointer3);
                this.game.debug.pointer(this.game.input.pointer4);
                this.game.debug.pointer(this.game.input.pointer5);
            }
            this.game.debug.text(this.game.time.fps + "" || '--', 2, 14, "#00ff00");
            for (let i of this.enemiesGroup.children) {
                this.game.debug.spriteBounds(i);
            }
        }
        playerAttack(x, y, width, height, facing, damage) {
            if (this.debug) {
                let attack = new Phaser.Sprite(this.game, x, y, "debug");
                attack.scale.set(width, height);
                attack.alpha = 0.5;
                this.game.add.existing(attack);
                setTimeout(() => attack.destroy(), 100);
            }
            let bound = new Phaser.Rectangle(x, y, width, height);
            for (let i of this.enemiesGroup.children) {
                //@ts-ignore
                i.playerAttack(bound, 5);
            }
        }
    }
    RogueSide.Dungeon = Dungeon;
})(RogueSide || (RogueSide = {}));
var RogueSide;
(function (RogueSide) {
    class Preloader extends Phaser.State {
        preload() {
            this.preloadBarBG = this.add.sprite(this.world.centerX - this.game.cache.getImage('preloader_bar').width / 2, this.world.centerY - this.game.cache.getImage('preloader_bar').height / 2, 'preloader_bar');
            this.preloadBarBG.frame = 0;
            this.preloadBarFG = this.add.sprite(this.world.centerX - this.game.cache.getImage('preloader_bar').width / 2, this.world.centerY - this.game.cache.getImage('preloader_bar').height / 2, 'preloader_bar');
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
    RogueSide.Preloader = Preloader;
})(RogueSide || (RogueSide = {}));
