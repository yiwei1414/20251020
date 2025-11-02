let circles = [];
let particles = [];
let popSound; // 宣告音效變數
let isAudioStarted = false; // 控制音效是否已啟動
let score = 0; // 新增分數變數

function preload() {
  // 載入音效檔案
  soundFormats('mp3', 'ogg');
  popSound = loadSound('pop.mp3');
}

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.velocity = p5.Vector.random2D();
    this.velocity.mult(random(2, 5));
    this.alpha = 255;
    this.size = random(3, 8);
  }

  update() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.velocity.y += 0.1; // 重力效果
    this.velocity.mult(0.98); // [優化] 增加摩擦力
    this.alpha -= 5;
  }

  display() {
    noStroke();
    let c = color(this.color);
    c.setAlpha(this.alpha);
    fill(c);
    circle(this.x, this.y, this.size);
  }

  isDead() {
    return this.alpha <= 0;
  }
}

const COLORS = [
  '#eff3d4', // 淺黃
  '#fc9e4f', // 橘色
  '#81a4cd', // 藍色
  '#12355b', // 深藍
  '#f26419'  // 亮橘
];

class Circle {
  constructor() {
    this.baseColor = random(COLORS);
    this.diameter = random(50, 200);
    this.alpha = random(50, 200); 
    this.x = random(this.diameter / 2, width - this.diameter / 2);
    this.y = random(height + 100, height + 600); 
    this.speed = random(-3.0, -0.5); 
    
    this.c = color(this.baseColor);
    this.c.setAlpha(this.alpha);
    
    this.isExploding = false;
    this.noiseOffset = random(1000);
  }

  // 檢查滑鼠是否點擊到氣球
  contains(px, py) {
    let d = dist(px, py, this.x, this.y);
    return d < this.diameter / 2;
  }

  update() {
    let noiseVal = noise(this.noiseOffset);
    this.x += map(noiseVal, 0, 1, -0.5, 0.5); 
    this.noiseOffset += 0.005;

    this.y += this.speed;

    if (this.y < -this.diameter / 2 || this.isExploding) {
      this.reset();
    }
  }

  explode() {
    // 產生爆炸粒子
    for (let i = 0; i < 20; i++) {
      particles.push(new Particle(this.x, this.y, this.baseColor));
    }
    
    // 播放爆破音效
    if (popSound && popSound.isLoaded()) {
      // 設定音量（0.0 到 1.0）
      popSound.setVolume(0.5);
      popSound.play();
    }
  }

  reset() {
    // [優化] 將 Y 的重置範圍再加大，更錯開
    this.y = height + this.diameter / 2 + random(0, 800); 
    this.x = random(this.diameter / 2, width - this.diameter / 2);
    this.isExploding = false;
    this.baseColor = random(COLORS); // [優化] 重置時也換顏色
    this.diameter = random(50, 200); // [優化] 重置時也換大小
    this.alpha = random(50, 200); 
    this.speed = random(-3.0, -0.5);
    this.c = color(this.baseColor);
    this.c.setAlpha(this.alpha);
    this.noiseOffset = random(1000); // [優化] 重置雜訊偏移
  }

  display() {
    // 繪製圓形
    noStroke();
    fill(this.c);
    ellipse(this.x, this.y, this.diameter, this.diameter);

    // 繪製右上方方形
    let rectSize = this.diameter / 7; 
    let radius = this.diameter / 2; 
    
    let distFromCenter = radius * 0.75;
    let angle = PI / 4; 
    
    let rectCenterX = this.x + cos(angle) * distFromCenter;
    let rectCenterY = this.y - sin(angle) * distFromCenter; 
    
    rectMode(CENTER); 
    fill(255, 255, 255, this.alpha * 0.8); 
    noStroke(); 
    rect(rectCenterX, rectCenterY, rectSize, rectSize);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background('#d0f4de');
  
  for (let i = 0; i < 30; i++) {
    circles.push(new Circle());
  }
}

function draw() {
  background('#d0f4de'); 

  // 如果音效還沒啟動，顯示提示文字
  if (!isAudioStarted) {
    textAlign(CENTER, CENTER);
    textSize(24);
    fill(0);
    text('請點擊螢幕開始產生音效', width/2, height/2);
    return;
  }

  // 顯示學號
  textAlign(LEFT, TOP);
  textSize(32);
  fill('#eb6424');
  text('學號為411136541', 20, 20);

  // 顯示分數
  textAlign(RIGHT, TOP);
  text('得分: ' + score, width - 20, 20);

  // 更新和顯示所有氣球
  for (let i = 0; i < circles.length; i++) {
    circles[i].update();
    circles[i].display();
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].display();
    if (particles[i].isDead()) {
      particles.splice(i, 1);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background('#d0f4de'); 
}

function mousePressed() {
  if (!isAudioStarted) {
    userStartAudio();
    isAudioStarted = true;
    return;
  }

  // 檢查是否點擊到氣球
  for (let i = circles.length - 1; i >= 0; i--) {
    if (circles[i].contains(mouseX, mouseY) && !circles[i].isExploding) {
      // 檢查氣球顏色並更新分數
      if (circles[i].baseColor === '#12355b') {
        score += 1; // 深藍色氣球加1分
      } else {
        score -= 1; // 其他顏色氣球扣1分
      }
      
      circles[i].explode();
      circles[i].isExploding = true;
      break; // 只爆破第一個被點擊到的氣球
    }
  }
}