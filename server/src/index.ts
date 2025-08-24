import express from 'express';
import ffmpeg from 'fluent-ffmpeg';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
app.post('/process-video', (req, res) => {
	// Get path of the input video file from request body
	const inputFilePath = req.body.inputFilePath;
	const outputFilePath = req.body.outputFilePath;

	if (!inputFilePath || !outputFilePath) {
		return res.status(400).send('Input and output file paths are required');
	}

	ffmpeg(inputFilePath)
		.outputOption('-vf', 'scale=-1:360') // 360p resolution
		.on('end', () => {
			console.log('Processing finished successfully');
			res.status(200).send('Processing finished successfully');
		})
		.on('error', err => {
			console.log('An error occurred: ' + err.message);
			res.status(500).send('An error occurred: ' + err.message);
		})
		.save(outputFilePath);
});

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
