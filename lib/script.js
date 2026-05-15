var gc = new GameCanvas();

var particleColors = [
	[255, 50, 50],    // 红
	[255, 150, 50],   // 橙红
	[255, 200, 50],   // 金黄
	[150, 255, 50],   // 荧光绿
	[50, 255, 150],   // 青绿
	[50, 200, 255],   // 天蓝
	[100, 50, 255],   // 紫蓝
	[255, 50, 200],   // 玫红
	[255, 150, 200],  // 粉红
	[255, 255, 255],  // 白
	[255, 215, 0],    // 金色
	[0, 255, 255]     // 青色
];

function getRandomColor() {
	return particleColors[Math.floor(Math.random() * particleColors.length)];
}

// 准备多句不同的祝福语
var username = localStorage.getItem('birthdayUser') || '朋友';
var messages = ['亲爱的' + username,  
'祝你17岁生日快乐🦆！',
	'愿你的每一天都快快乐乐',
	'心想事成,平安喜乐',
];

var currentMessageIndex = 0;
var currentPoints = [];

function updatePointsForText(text) {
	window.points = textToPoints([text], 15, "幼圆");
}
updatePointsForText(messages[0])

var titleParticles = [];
var fireworks = [];
var particles = [];
var fadingLights = [];

var gravity = 0.1;

var fireworksStartTime = Date.now();
// ========== 修改：取消总时长限制，改为无限 ==========
var fireworksDuration = Infinity; // 无限时长

// ========== 从下到上波浪烟花控制变量 ==========
var waveTriggered = false;
var waveStartTime = null;
var waveDuration = 4000;
// ========== 修改：15秒时触发波浪 ==========
var waveTriggerTime = 15000; // 15秒触发

// 波浪参数
var waveRows = 8;
var waveCols = 12;
var waveRowDelay = 400;

// 17光点控制
var seventeenPoints = [];
var seventeenWidth = 0;
var seventeenHeight = 0;
var allLightsLanded = false;
var holdStartTime = null;
// ========== 修改：17光点永久停留 ==========
var holdDuration = Infinity; // 永久停留
var fadeStartTime = null;

// 17区块边界
var seventeenBounds = {
	minX: 0,
	maxX: 0,
	minY: 0,
	maxY: 0
};

setTimeout(function () {
	calculateSeventeenPoints();

	setInterval(function () {
		var elapsed = Date.now() - fireworksStartTime;

		// ========== 修改：只判断时间是否到达15秒，不再判断结束时间 ==========
		if (!waveTriggered && elapsed >= waveTriggerTime) {
			triggerWaveFireworks();
		}

		// ========== 修改：15秒后全局发射烟花（避开17区块） ==========
		if (waveTriggered && !allLightsLanded) {
			for (var i = 0; i < 3; i++) {
				spawnGlobalFireworkAvoiding17();
			}
		}
		// ========== 修改：15秒前发射普通烟花 ==========
		else if (!waveTriggered) {
			var chance = 1;
			if (Math.random() < chance) {
				fireworks.push(new Firework(Math.random() * width, height, Math.random() - 0.5, -(Math.random() * 7 + 5)));
			}
		}
		// ========== 新增：15秒后且17到位，继续全局烟花 ==========
		else if (waveTriggered && allLightsLanded) {
			for (var i = 0; i < 3; i++) {
				spawnGlobalFireworkAvoiding17();
			}
		}
	}, 300);
}, 2000);

// 计算17点阵
function calculateSeventeenPoints() {
	var canvas = document.createElement("canvas");
	var ctx = canvas.getContext("2d");
	var fontSize = 140;
	canvas.width = 320;
	canvas.height = 160;

	ctx.fillStyle = "white";
	ctx.font = "bold " + fontSize + "px Arial";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText("17", canvas.width / 2, canvas.height / 2);

	var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	var data = imageData.data;
	var points = [];

	for (var y = 0; y < canvas.height; y += 4) {
		for (var x = 0; x < canvas.width; x += 4) {
			var i = (x + y * canvas.width) * 4;
			if (data[i + 3] > 100) {
				points.push({ x: x, y: y });
			}
		}
	}

	seventeenPoints = points;
	seventeenWidth = canvas.width;
	seventeenHeight = canvas.height;
}

// 在17区块外发射烟花
function spawnGlobalFireworkAvoiding17() {
	var x, y;
	var maxAttempts = 10;
	var attempts = 0;

	do {
		x = Math.random() * width;
		y = height;
		attempts++;
	} while (isInSeventeenBlock(x, y) && attempts < maxAttempts);

	if (isInSeventeenBlock(x, y)) {
		if (Math.random() < 0.5) {
			x = Math.random() * seventeenBounds.minX;
		} else {
			x = seventeenBounds.maxX + Math.random() * (width - seventeenBounds.maxX);
		}
	}

	var vx = (Math.random() - 0.5) * 2;
	var vy = -(Math.random() * 5 + 6);
	var color = getWaveColor(Math.floor(Math.random() * 8), Math.floor(Math.random() * 3));

	fireworks.push(new Firework(x, y, vx, vy, 5, color));
}

// 检查坐标是否在17区块内
function isInSeventeenBlock(x, y) {
	var margin = 50;
	return x > seventeenBounds.minX - margin &&
		x < seventeenBounds.maxX + margin &&
		y > seventeenBounds.minY - margin &&
		y < seventeenBounds.maxY + margin;
}

// ========== 从下到上波浪烟花（含17特效） ==========
function triggerWaveFireworks() {
	waveTriggered = true;
	waveStartTime = Date.now();
	console.log("🌊 波浪烟花开始！");

	var rowHeight = height / (waveRows + 2);

	// 计算17位置和边界
	var targetWidth = width * 0.7;
	var targetHeight = height * 0.7;
	var scale = Math.min(targetWidth / seventeenWidth, targetHeight / seventeenHeight);
	var offsetX = (width - seventeenWidth * scale) / 2;
	var offsetY = (height - seventeenHeight * scale) / 2;

	seventeenBounds.minX = offsetX;
	seventeenBounds.maxX = offsetX + seventeenWidth * scale;
	seventeenBounds.minY = offsetY;
	seventeenBounds.maxY = offsetY + seventeenHeight * scale;

	// 转换17点阵到屏幕坐标
	var screenPoints = seventeenPoints.map(function (p) {
		return {
			x: offsetX + p.x * scale,
			y: offsetY + p.y * scale,
			originalY: p.y
		};
	});

	// 按Y坐标排序（从上到下）
	screenPoints.sort(function (a, b) {
		return a.originalY - b.originalY;
	});

	var totalPoints = screenPoints.length;
	var batchSize = Math.ceil(totalPoints / 8);
	var landedCount = 0;

	// 从下到上逐行发射（波浪）
	for (var row = 0; row < waveRows; row++) {
		setTimeout(function (currentRow) {
			return function () {
				var y = height - (currentRow + 1) * rowHeight;

				// 这一行的多个烟花（避开17区块）
				for (var col = 0; col < waveCols; col++) {
					setTimeout(function (currentCol) {
						return function () {
							var x = (width / (waveCols - 1)) * currentCol;
							x += (Math.random() - 0.5) * 30;

							// 如果这个位置在17区块内，跳过
							if (isInSeventeenBlock(x, height)) {
								return;
							}

							var baseSpeed = 6 + currentRow * 0.5;
							var vy = -(Math.random() * 2 + baseSpeed);
							var color = getWaveColor(currentRow, currentCol);

							fireworks.push(new Firework(x, height, 0, vy, 5, color));
						};
					}(col), col * 50);
				}

				// 发射17的光点（金色）
				setTimeout(function () {
					var startIdx = totalPoints - (currentRow + 1) * batchSize;
					var endIdx = totalPoints - currentRow * batchSize;
					startIdx = Math.max(0, startIdx);
					endIdx = Math.min(totalPoints, endIdx);

					for (var i = startIdx; i < endIdx; i++) {
						var p = screenPoints[i];
						var light = new FadingLight(p.x, height, p.y, function () {
							landedCount++;
							if (landedCount >= totalPoints && !allLightsLanded) {
								allLightsLanded = true;
								holdStartTime = Date.now();
								console.log("所有光点到位，开始永久停留");
								// ========== 修改：不设置fadeStartTime，永远不淡出 ==========
							}
						});
						fadingLights.push(light);
					}
				}, 200);

				// 每行左右两侧额外加两个
				setTimeout(function () {
					fireworks.push(new Firework(0, height, Math.random() * 2, -(Math.random() * 3 + 7), 4, "white"));
					fireworks.push(new Firework(width, height, -Math.random() * 2, -(Math.random() * 3 + 7), 4, "white"));
				}, 100);
			};
		}(row), (waveRows - 1 - row) * waveRowDelay);
	}

	// ========== 修改：金色圆形爆发收尾（仍然执行，但之后烟花继续） ==========
	setTimeout(function () {
		console.log("🎆 金色圆形爆发！");
		for (var i = 0; i < 30; i++) {
			var angle = (Math.PI * 2 / 30) * i;
			var power = (Math.random() * 2 + 8);
			var vx = Math.cos(angle) * power;
			var vy = Math.sin(angle) * power - 2;
			fireworks.push(new Firework(width / 2, height, vx, vy, 6, "gold"));
		}
	}, waveRows * waveRowDelay + 2000); // ========== 修改：固定2秒后爆发，不依赖holdDuration ==========
}

// 获取波浪颜色
function getWaveColor(row, col) {
	var colors = [
		["darkred", "red", "crimson"],
		["red", "orangered", "tomato"],
		["orange", "darkorange", "coral"],
		["gold", "yellow", "khaki"],
		["limegreen", "lime", "chartreuse"],
		["cyan", "deepskyblue", "turquoise"],
		["magenta", "purple", "violet"],
		["white", "pink", "lightyellow"]
	];
	var rowColors = colors[row] || colors[7];
	return rowColors[col % 3];
}

function getColorArray(colorName) {
	var canvas = document.createElement("canvas");
	var ctx = canvas.getContext("2d");
	ctx.fillStyle = colorName;
	ctx.fillRect(0, 0, 1, 1);
	var data = ctx.getImageData(0, 0, 1, 1).data;
	return [data[0], data[1], data[2]];
}

function launchTextFirework() {
	// ========== 修改：取消时间限制，只判断是否还有祝福语 ==========
	if (currentMessageIndex < messages.length) {
		updatePointsForText(messages[currentMessageIndex]);
		fireworks.push(new Firework(width / 2, height, 0, -9.5, 10, "gold", true));
		currentMessageIndex++;

		if (currentMessageIndex < messages.length) {
			setTimeout(launchTextFirework, 2000);
		}
	}
}

setTimeout(launchTextFirework, 2000);

for (var i = 0; i < 250; i++) {
	circle(Math.random() * width, Math.random() * height, 1, "rgb(200, 200, 200)");
}
var starImage = canvasToImage();

background("black");
loop();

function loop() {
	gc.ctx.globalCompositeOperation = "source-over";
	background("rgba(0, 0, 0, 0.1)");
	gc.ctx.drawImage(starImage, 0, 0);
	gc.ctx.globalCompositeOperation = "lighter";

	for (var i = 0; i < fireworks.length; i++) {
		var firework = fireworks[i];
		firework.update();
		firework.render();
	}

	for (var i = 0; i < particles.length; i++) {
		var particle = particles[i];
		particle.update();
		particle.render();
	}

	if (fadingLights.length > 0) {
		renderFadingLightsBatch();
	}

	for (var i = 0; i < titleParticles.length; i++) {
		var p = titleParticles[i];
		p.update();
		p.render();
	}



	requestAnimationFrame(loop);
}

// ========== 修改：金色光点批量渲染 ==========
function renderFadingLightsBatch() {
	var ctx = gc.ctx;
	// ========== 修改：永远不进入淡出 ==========
	var allReadyToFade = false; // 强制为false，永久保留

	for (var i = fadingLights.length - 1; i >= 0; i--) {
		var light = fadingLights[i];
		light.update(allReadyToFade);
		// ========== 修改：不清理死亡的光点，让它们永远存在 ==========
		// if (light.dead) {
		// 	fadingLights.splice(i, 1);
		// }
	}

	if (fadingLights.length === 0) return;

	// 金色光晕
	ctx.fillStyle = "rgba(255, 215, 0, 0.5)";
	for (var i = 0; i < fadingLights.length; i++) {
		var light = fadingLights[i];
		var alpha = (light.life / light.maxLife) * 0.5;

		ctx.globalAlpha = alpha;
		ctx.beginPath();
		ctx.arc(light.x, light.y, light.glowRadius, 0, Math.PI * 2);
		ctx.fill();
	}

	// 亮金色核心
	ctx.fillStyle = "rgba(255, 255, 220, 0.95)";
	for (var i = 0; i < fadingLights.length; i++) {
		var light = fadingLights[i];
		var alpha = light.life / light.maxLife;

		ctx.globalAlpha = alpha;
		ctx.beginPath();
		ctx.arc(light.x, light.y, light.radius, 0, Math.PI * 2);
		ctx.fill();
	}

	ctx.globalAlpha = 1;
}

// 金色光点类
// 金色光点类
function FadingLight(x, startY, targetY, onLandCallback) {
	this.x = x;
	this.y = startY;
	this.targetY = targetY;
	this.rising = true;
	this.vy = -12;
	this.vx = (Math.random() - 0.5) * 0.2;
	this.holding = false;
	this.fading = false;
	this.life = 100;
	this.maxLife = 100;
	this.radius = 4;
	this.glowRadius = 12;
	this.dead = false;
	this.onLandCallback = onLandCallback;
	this.landed = false;

	this.update = function (allReadyToFade) {
		if (this.rising) {
			this.y += this.vy;
			this.x += this.vx;
			this.vy += 0.25;

			if (this.y <= this.targetY || this.vy >= 0) {
				this.rising = false;
				this.holding = true;
				this.y = this.targetY;
				// ========== 修改：到位后速度清零，不再漂移 ==========
				this.vx = 0;

				if (!this.landed) {
					this.landed = true;
					if (this.onLandCallback) {
						this.onLandCallback();
					}
				}
			}
		} else if (this.holding) {
			// ========== 修改：完全静止，不再有任何移动 ==========
			// 删除所有移动代码，光点固定在目标位置

			// 淡出判断（永远不会触发，因为 allReadyToFade 始终为 false）
			if (allReadyToFade && false) {
				this.holding = false;
				this.fading = true;
			}
		} else if (this.fading) {
			// 这段理论上不会执行，保留以防万一
			this.x += this.vx;
			this.y += Math.sin(Date.now() * 0.001 + this.x * 0.01) * 0.15;

			this.life -= 2;
			this.radius = 4 * (this.life / this.maxLife);
			this.glowRadius = 12 * (this.life / this.maxLife);

			if (this.life <= 0) {
				this.dead = true;
			}
		}
	};
}

function TitleParticle(x, y, vx, vy) {
	this.x = x;
	this.y = y;
	this.vx = vx;
	this.vy = vy;
	this.ay = 0.2;
	this.radius = 4;
	this.maxHealth = 200;
	this.health = 200;

	this.update = function () {
		this.x += this.vx;
		this.y += this.vy;
		this.vx *= 0.95;
		this.vy *= 0.95;
		this.vy += this.ay;
		this.ay *= 0.95;
		this.radius = (this.health / this.maxHealth) * 4;
		this.health--;
		if (this.health <= 0) {
			titleParticles.splice(titleParticles.indexOf(this), 1);
		}
	}

	this.render = function () {
		circle(this.x, this.y, this.radius, "rgba(255, 255, 255, " + (this.health / this.maxHealth) + ")");
	}
}

function Firework(x, y, vx, vy, radius = 5, color = "white", title = false) {
	this.x = x;
	this.y = y;
	this.vx = vx;
	this.vy = vy;
	this.radius = radius;
	this.title = title;
	this.color = color;

	this.update = function () {
		this.x += this.vx;
		this.y += this.vy;
		this.vy += gravity;

		if (this.vy >= 0) {
			fireworks.splice(fireworks.indexOf(this), 1);

			if (this.title) {
				var scale = 0.3;
				for (var i = 0; i < points.length; i++) {
					var p = points[i];
					var v = {
						x: (p.x - 100) * scale + (Math.random() - 0.5) * 0.1,
						y: (p.y - 20) * scale + (Math.random() - 0.5) * 0.1
					}
					var particle = new TitleParticle(this.x, this.y, v.x, v.y);
					titleParticles.push(particle);
				}
			} else {
				var colorArray = typeof this.color === 'string' ?
					getColorArray(this.color) : this.color;
				for (var i = 0; i < Math.PI * 2; i += 0.1) {
					var power = (Math.random() + 0.5) * 4;
					var vx = Math.cos(i) * power;
					var vy = Math.sin(i) * power;

					// 关键：每个粒子独立随机选色
					var randomColor = getRandomColor();
					particles.push(new Particle(this.x, this.y, vx, vy, Math.random() + 3, randomColor));
				}
			}
		}
	}

	this.render = function () {
		circle(this.x, this.y, this.radius, this.color);
	}
}

function Particle(x, y, vx, vy, radius, color) {
	this.x = x;
	this.y = y;
	this.vx = vx;
	this.vy = vy;
	this.life = 130;
	this.color = color;
	this.radius = radius;

	this.update = function () {
		this.x += this.vx;
		this.y += this.vy;
		this.vy += gravity;

		var xt = (Math.floor(Math.random() * 7) + 95) / 100;
		var yt = (Math.floor(Math.random() * 8) + 95) / 100;
		this.vx *= xt;
		this.vy *= yt;

		this.life--;
		if (this.life <= 0) {
			particles.splice(particles.indexOf(this), 1);
		}
	}

	this.render = function () {
		circle(this.x, this.y, 3 * (this.life / 100), "rgba(" + this.color[0] + ", " + this.color[1] + ", " + this.color[2] + ", " + (this.life / 100) + ")");
	}
}

function textToPoints(text, textSize, font) {
	var canvas = document.createElement("canvas");
	canvas.width = window.innerWidth;
	canvas.height = 30 * text.length;
	var ctx = canvas.getContext("2d");

	ctx.textBaseline = "bottom";
	ctx.font = 15 + "px " + font;

	text = [...text].reverse();

	var lineheight = 15;
	for (var i = 0; i < text.length; i++) {
		ctx.fillText(text[i], 20, (canvas.height / 2) - (i * lineheight));
	}

	var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	var data = imageData.data;

	var points = [];
	var index = (x, y) => (x + canvas.width * y) * 4;
	var threshold = 50;

	for (var i = 0; i < data.length; i += 4) {
		if (data[i + 3] > threshold) {
			var p = {
				x: (i / 4) % canvas.width,
				y: (i / 4) / canvas.width >> 0
			};

			if (data[index(p.x + 1, p.y) + 3] < threshold ||
				data[index(p.x - 1, p.y) + 3] < threshold ||
				data[index(p.x, p.y + 1) + 3] < threshold ||
				data[index(p.x, p.y - 1) + 3] < threshold) {
				points.push({
					x: (i / 4) % canvas.width,
					y: (i / 4) / canvas.width >> 0
				});
			}
		}
	}

	return points;
}