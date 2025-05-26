let video;
let faceMesh;
let faces = [];
let handpose;
let hands = [];

function preload() {
  // 初始化 FaceMesh 模型
  faceMesh = ml5.faceMesh({ maxFaces: 1, flipped: true });
}

function mousePressed() {
  // 印出臉部資料
  console.log(faces);
}

function gotFaces(results) {
  faces = results;
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // 啟動臉部偵測
  faceMesh.detectStart(video, gotFaces);

  // 啟動手勢偵測
  handpose = ml5.handpose(video, () => {});
  handpose.on('predict', results => {
    hands = results;
  });
}

function draw() {
  background(0);
  image(video, 0, 0);

  if (faces.length > 0) {
    let face = faces[0];
    let keypoints = face.keypoints;

    // 預設圓圈在鼻子
    let { x, y } = keypoints[1];

    // 根據手勢移動圓圈
    if (hands.length > 0) {
      const hand = hands[0];
      const fingerCount = countExtendedFingers(hand);

      if (fingerCount === 2) {
        // 剪刀：額頭（第10點）
        x = keypoints[10].x;
        y = keypoints[10].y;
      } else if (fingerCount === 0) {
        // 石頭：左臉（第234點）
        x = keypoints[234].x;
        y = keypoints[234].y;
      } else if (fingerCount === 5) {
        // 布：鼻子（第1點）
        x = keypoints[1].x;
        y = keypoints[1].y;
      }
    }

    // 畫圓圈
    noFill();
    stroke(255, 0, 0);
    strokeWeight(4);
    ellipse(x, y, 50, 50);

    // (可選) 畫出所有臉部特徵點
    for (let i = 0; i < keypoints.length; i++) {
      stroke(255, 255, 0);
      strokeWeight(2);
      point(keypoints[i].x, keypoints[i].y);
    }
  }
}

// 計算伸出的手指數量
function countExtendedFingers(hand) {
  let count = 0;
  const palm = hand.annotations.palmBase[0];
  const fingers = ['thumb', 'indexFinger', 'middleFinger', 'ringFinger', 'pinky'];
  for (let finger of fingers) {
    const tip = hand.annotations[finger][3];
    const d = dist(palm[0], palm[1], tip[0], tip[1]);
    if (d > 60) count++; // 距離閾值可調整
  }
  return count;
}
