let video;
let poseNet;
let pose;
let yogaNN;
var iterationCounter;
let state = "predict";
let timeLimit = 10;
var timeLeft;
let target;
let poseCounter;
let errorCounter;
var imgArray = new Array();
var poseImage;
let english = [
  "Mountain Pose",
  "Tree Pose",
  "Downward Dog",
  "Warrior I",
  "Warrior II",
  "Chair Pose",
];
let posesArray = [
  "Tadasana",
  "Vrikshasana",
  "Adhmoukha svanasana",
  "Vidarbhasana I",
  "Vidarbhasana II",
  "Utkatasana",
];
function setup() {
  var canvas = createCanvas(640, 480);
  canvas.position(50, 95);
  video = createCapture(VIDEO);
  video.size(width, height);
  targetLabel = 1;
  iterationCounter = 0;
  poseCounter = 0;
  errorCounter = 0;
  timeLeft = timeLimit;
  target = posesArray[poseCounter];
  document.getElementById("poseName").textContent = target;
  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on("pose", function (results) {
    if (results.length > 0) {
      pose = results[0].pose;
    }
  });
  imgArray[0] = new Image();
  imgArray[0].src = "/public/images/mountain_pose.jpg";
  imgArray[1] = new Image();
  imgArray[1].src = "/public/images/tree_pose.jpg";
  imgArray[2] = new Image();
  imgArray[2].src = "/public/images/downward_dog.jpg";
  imgArray[3] = new Image();
  imgArray[3].src = "/public/images/warrior_1.jpg";
  imgArray[4] = new Image();
  imgArray[4].src = "/public/images/warrior_2.jpg";
  imgArray[5] = new Image();
  imgArray[5].src = "/public/images/chair.jpg";

  // Hide the video element, and just show the canvas
  document.getElementById("poseImg").src = imgArray[poseCounter].src;
  document.getElementById("next_asana").textContent =
    posesArray[poseCounter + 1];
  document.getElementById("english").textContent =
    '"' + english[poseCounter] + '"';

  let options = {
    inputs: 34,
    outputs: 6,
    task: "classification",
    debug: true,
  };

  yogaNN = ml5.neuralNetwork(options);
  const modelInfo = {
    model: "/public/js/posenet_models/model.json",
    metadata: "/public/js/posenet_models/model_meta.json",
    weights: "/public/js/posenet_models/model.weights.bin",
  };
  yogaNN.load(modelInfo, yogiLoaded);

  video.hide();
}

function yogiLoaded() {
  console.log("Loaded yoga model");
  state = "predict";
  classifyPose();
}

function classifyPose() {
  if (pose) {
    let inputs = [];
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      inputs.push(x);
      inputs.push(y);
    }
    yogaNN.classify(inputs, gotResult);
  } else {
    console.log("NO POSE DETECTED");
    setTimeout(classifyPose, 100);
    // select("#asana").html("");
  }
}

function gotResult(error, results) {
  if (results) {
    if (results[0].confidence > 0.62) {
      console.log("Confidence");
      if (targetLabel == 6) {
        console.log(targetLabel);
        iterationCounter = iterationCounter + 1;

        console.log(iterationCounter);

        if (iterationCounter == timeLimit) {
          console.log("30!");
          iterationCounter = 0;
          nextPose();
        } else {
          console.log("doin this");
          timeLeft = timeLeft - 1;
          if (timeLeft < 10) {
            document.getElementById("time").textContent = "00:0" + timeLeft;
          } else {
            document.getElementById("time").textContent = "00:" + timeLeft;
          }
          setTimeout(classifyPose, 1000);
        }
      } else if (results[0].label == targetLabel.toString()) {
        console.log(targetLabel);
        iterationCounter = iterationCounter + 1;

        console.log(iterationCounter);

        if (iterationCounter == timeLimit) {
          console.log("30!");
          iterationCounter = 0;
          nextPose();
        } else {
          console.log("doin this");
          timeLeft = timeLeft - 1;
          if (timeLeft < 10) {
            document.getElementById("time").textContent = "00:0" + timeLeft;
          } else {
            document.getElementById("time").textContent = "00:" + timeLeft;
          }
          setTimeout(classifyPose, 1000);
        }
      } else {
        errorCounter = errorCounter + 1;
        console.log("error");
        if (errorCounter >= 4) {
          console.log("four errors");
          iterationCounter = 0;
          timeLeft = timeLimit;
          if (timeLeft < 10) {
            document.getElementById("time").textContent = "00:0" + timeLeft;
          } else {
            document.getElementById("time").textContent = "00:" + timeLeft;
          }
          errorCounter = 0;
          setTimeout(classifyPose, 100);
        } else {
          setTimeout(classifyPose, 100);
        }
      }
    } else {
      console.log("whatwe really dont want");
      setTimeout(classifyPose, 100);
    }
  }
}

function nextPose() {
  if (poseCounter >= 5) {
    console.log("Well done, you have learnt all poses!");
    document.getElementById("time").textContent = "Well done!";
    document.getElementById("time2").textContent = "You have learnt all poses!";
  } else {
    console.log("Well done, you all poses!");
    errorCounter = 0;
    iterationCounter = 0;
    poseCounter = poseCounter + 1;
    targetLabel = poseCounter + 1;
    console.log("next pose target label" + targetLabel);
    target = posesArray[poseCounter];
    document.getElementById("poseName").textContent = target;
    document.getElementById("english").textContent =
      '"' + english[poseCounter] + '"';
    document.getElementById("poseImg").src = imgArray[poseCounter].src;
    if (poseCounter < 5) {
      document.getElementById("next_asana").textContent =
        posesArray[poseCounter + 1];
    } else {
      document.getElementById("next_asana").textContent = "";
    }

    console.log("reached till here");
    timeLeft = timeLimit;
    document.getElementById("time").textContent = "00:" + timeLeft;
    setTimeout(classifyPose, 4000);
  }
}

function draw() {
  translate(video.width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);

  if (state == "predict") {
    if (pose) {
      for (let j = 0; j < pose.keypoints.length; j++) {
        let keypoint = pose.keypoints[j];
        // Only draw an ellipse is the pose probability is bigger than 0.2

        fill(0, 255, 0);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    }
  }
}

function modelReady() {
  console.log("PoseNet is here");
}
