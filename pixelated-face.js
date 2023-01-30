// The face detection does not work on all browsers and operating systems.
// If you are getting a `Face detection service unavailable` error or similar,
// it's possible that it won't work for you at the moment.

const video = document.querySelector('.webcam');

const canvas = document.querySelector('.video');
const ctx = canvas.getContext('2d');

const faceCanvas = document.querySelector('.face');
const faceCtx = faceCanvas.getContext('2d');

const options = {
	SIZE: 10,
	SCALE: 1.5,
};

const faceDetector = new window.FaceDetector();

const optionsInputs = document.querySelectorAll(
	'.controls input[type="range"]'
);

function handleOption(event) {
	const { value, name } = event.currentTarget;
	options[name] = parseFloat(value);
}

optionsInputs.forEach(input => input.addEventListener('input', handleOption));

async function populateVideo() {
	const stream = await navigator.mediaDevices.getUserMedia({
		video: { width: 900, height: 600 },
	});
	video.srcObject = stream;
	await video.play();

	canvas.width = video.videoWidth;
	canvas.height = video.videoHeight;

	faceCanvas.width = video.videoWidth;
	faceCanvas.height = video.videoHeight;
}

async function detect() {
	const faces = await faceDetector.detect(video);
	faces.forEach(drawFace);
	faces.forEach(censor);
	requestAnimationFrame(detect);
}

function drawFace(face) {
	const { width, height, top, left } = face.boundingBox;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.strokeStyle = '#ffc600';
	ctx.lineWidth = 2;
	ctx.strokeRect(left, top, width, height);
}

function censor({ boundingBox: face }) {
	faceCtx.imageSmoothingEnabled = false;
	faceCtx.clearRect(0, 0, faceCanvas.width, faceCanvas.height);
	const width = face.width * options.SCALE;
	const height = face.height * options.SCALE;

	// draw the small face
	faceCtx.drawImage(
		//5 src args
		video, //source

		face.x, //where do we start source pull from?
		face.y,

		face.width, // how much width and height should be taken from the source
		face.height,

		//4 draw args
		face.x, // from where we want to draw
		face.y,
		options.SIZE, //howmuch width, height you want to draw
		options.SIZE
	);
	// take the face back out and draw it back normal size
	faceCtx.drawImage(
		faceCanvas, // source
		face.x, // where do we start the source pull from?
		face.y,
		options.SIZE,
		options.SIZE,
		//drawing args
		face.x - (width - face.width) / 2,
		face.y - (height - face.height) / 2,
		width,
		height
	);
}

populateVideo().then(detect);
