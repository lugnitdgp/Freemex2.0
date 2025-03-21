let canvas, ctx, w, h, units;
let unitCount = 100;
let hue = 0;

function init() {
	canvas = document.querySelector("#canvas");
	ctx = canvas.getContext("2d");

	resizeReset();
	createUnits();
	animationLoop();
}

function resizeReset() {
	w = canvas.width = window.innerWidth;
	h = canvas.height = window.innerHeight;
	
	ctx.fillStyle = "#222";
	ctx.fillRect(0, 0, w, h);
}

function createUnits() {
	units = [];
	for (let i = 0; i < unitCount; i++) {
		setTimeout(() => {
			units.push(new Unit());
		}, i * 200);
	}
}

function animationLoop() {
	ctx.fillStyle = "rgba(0, 0, 0, .05)";
	ctx.fillRect(0, 0, w, h);

	drawScene();	
	requestAnimationFrame(animationLoop);
}

function drawScene() {
	for (let i = 0; i < units.length; i++) {
		units[i].update();
		units[i].draw();
	}
}

function getRandomInt(min, max) {
	return Math.round(Math.random() * (max - min)) + min;
}

class Unit {
	constructor() {
		this.reset();
		this.constructed = true;
	}
	reset() {
		// this.x = Math.round(w / 2);
		// this.y = Math.round(h / 2);
        this.x = getRandomInt(0, w); // Random initial x position
        this.y = getRandomInt(0, h); // Random initial y position
		this.sx = this.x;
		this.sy = this.y;
		this.angle = 60 * getRandomInt(0, 5);
		this.size = 2;
		this.radian = (Math.PI / 180) * (this.angle + 90);
		this.speed = 2;
		this.maxDistance = 60;
		this.time = 0;
		this.ttl = getRandomInt(180, 300);
		this.hue = hue;
		hue += 0.8;
	}
	draw() {
		ctx.save();
		ctx.beginPath();		
		ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
		ctx.fillStyle = `hsl(${this.hue}, 100%, 50%)`;
		ctx.shadowColor = `hsl(${this.hue}, 100%, 50%)`;
		ctx.shadowBlur = 5;
		ctx.fill();
		ctx.closePath();
		ctx.restore();
	}
	update() {
		let dx = this.sx - this.x;
		let dy = this.sy - this.y;
		let distance = Math.sqrt(dx * dx + dy * dy);

		if (distance >= this.maxDistance) {
			if (getRandomInt(0, 1)) {
				this.angle += 60;
			} else {
				this.angle -= 60;
			}

			this.radian = (Math.PI / 180) * (this.angle + 90);
			this.sx = this.x;
			this.sy = this.y; 
		}

		this.x += this.speed * Math.sin(this.radian);
		this.y += this.speed * Math.cos(this.radian);
		
		if (this.time >= this.ttl || this.x < 0 || this.x > w || this.y < 0 || this.y > h) {
			this.reset();
		}

		this.time++;
	}
} 

window.addEventListener("DOMContentLoaded", init);
window.addEventListener("resize", resizeReset);