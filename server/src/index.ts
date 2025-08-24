import express from 'express';
import dotenv from 'dotenv';
import {
	convertVideo,
	deleteProcessedVideo,
	deleteRawVideo,
	downloadRawVideo,
	setupDirectories,
	uploadProcessedVideo,
} from './storage';
dotenv.config();

// Create the local directories for videos
setupDirectories();

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

app.post('/process-video', async (req, res) => {
	// Get the bucket and filename from the Cloud Pub/Sub message
	let data;
	try {
		const message = Buffer.from(req.body.message.data, 'base64').toString(
			'utf-8'
		);
		data = JSON.parse(message);
		if (!data.name) {
			throw new Error('Invalid message payload received.');
		}
	} catch (error) {
		console.error('Error parsing JSON:', error);
		return res.status(400).send('Bad Request. Missing file name');
	}
	const inputFileName = data.name;
	const outputFileName = `processed-${inputFileName}`;

	// Download the raw video from Cloud Storage
	await downloadRawVideo(inputFileName);

	// Process the video into 360p
	try {
		await convertVideo(inputFileName, outputFileName);
	} catch (err) {
		await Promise.all([
			deleteRawVideo(inputFileName),
			deleteProcessedVideo(outputFileName),
		]);
		return res.status(500).send('Processing failed');
	}

	// Upload the processed video to Cloud Storage
	await uploadProcessedVideo(outputFileName);

	await Promise.all([
		deleteRawVideo(inputFileName),
		deleteProcessedVideo(outputFileName),
	]);

	return res.status(200).send('Processing finished successfully');
});

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
