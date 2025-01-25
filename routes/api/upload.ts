import { Handlers } from '$fresh/server.ts';
//@deno-types=npm:@types/bluebird
import Bluebird from 'npm:bluebird';
import { parse } from 'https://deno.land/std@0.212.0/csv/mod.ts';
import StudentModel from '../../models/student.ts';
import * as tf from 'https://esm.sh/@tensorflow/tfjs@4.6.0';
import { DenoFileLoadHandler, DenoFileSaveHandler } from '../../library/tf.ts';

export const handler: Handlers = {
	async POST(req) {
		const body = await req.json();
		const data = body.data;

		const users = parse(data, {
			skipFirstRow: true,
		}) as {
			Name: string;
			College: string;
			Level: string;
			Degree: string;
			SchoolYear: string;
			Semester: string;
			Email: string;
		}[];

		const students = await Bluebird.map(
			users,
			async (user) => {
				if (!user.Name) return null;
				const slug = user.Name.toLowerCase().replace(/\s/g, '-');

				console.log(
					'student',
					await StudentModel.get([
						user.SchoolYear,
						user.Semester,
						user.Level,
						user.Degree,
						user.College,
						slug,
					]),
				);

				console.log({
					id: [
						user.SchoolYear,
						user.Semester,
						user.Level,
						user.Degree,
						user.College,
						slug,
					],
					email: user.Email,
					name: user.Name,
					slug,
					schoolYear: parseInt(user.SchoolYear),
					level: parseInt(user.Level),
					degree: user.Degree,
					college: user.College,
					semester: parseInt(user.Semester),
				});

				await StudentModel.insert({
					id: [
						user.SchoolYear,
						user.Semester,
						user.Level,
						user.Degree,
						user.College,
						slug,
					],
					email: user.Email,
					name: user.Name,
					slug,
					schoolYear: parseInt(user.SchoolYear),
					level: parseInt(user.Level),
					degree: user.Degree,
					college: user.College,
					semester: parseInt(user.Semester),
				});

				return {
					schoolYear: parseInt(user.SchoolYear),
					semester: parseInt(user.Semester),
					college: user.College,
				};
			},
			{ concurrency: 100 },
		).then((students) =>
			students.filter(Boolean) as {
				schoolYear: number;
				semester: number;
				college: string;
			}[]
		);

		// Normalize features
		const maxYear = Math.max(...students.map((s) => s.schoolYear));
		const maxSemester = 2; // Assuming two semesters per year

		const features = students.map((s) => [
			s.schoolYear / maxYear,
			s.semester / maxSemester,
			s.college === 'CET' ? 0 : s.college === 'CA' ? 1 : 2,
		]);

		// Labels (Counts of students per college)
		const labels = features.map(([year, semester, college]) =>
			students.reduce((acc, student) => {
				if (
					student.schoolYear === year * maxYear &&
					student.semester === semester * maxSemester &&
					student.college ===
						(college === 0 ? 'CET' : college === 1 ? 'CA' : 'CAS')
				) {
					acc += 1;
				}
				return acc;
			}, 0)
		);

		// Load or create the model
		// const loadHandler = new DenoFileLoadHandler('./prediction-models');
		// let model;
		// try {
		//   model = await tf.loadLayersModel(loadHandler);
		//   model.compile({
		//     optimizer: 'adam',
		//     loss: 'meanSquaredError',
		//     metrics: ['mse'],
		//   });
		//   console.log('Loaded existing model');
		// } catch {
		//   console.log('No existing model found, creating a new one');
		//   model = tf.sequential();
		//   model.add(
		//     tf.layers.dense({ inputShape: [3], units: 16, activation: 'relu' }),
		//   );
		//   model.add(tf.layers.dense({ units: 8, activation: 'relu' }));
		//   model.add(tf.layers.dense({ units: 1, activation: 'linear' }));
		//   model.compile({
		//     optimizer: 'adam',
		//     loss: 'meanSquaredError',
		//     metrics: ['mse'],
		//   });
		// }

		// // Train the model
		// const xs = tf.tensor2d(features, [features.length, 3]);
		// const ys = tf.tensor2d(labels.map((label) => label / maxYear), [
		//   labels.length,
		//   1,
		// ]);

		// await model.fit(xs, ys, {
		//   epochs: 50,
		//   batchSize: 64,
		// });

		// // Save the model
		// const saveHandler = new DenoFileSaveHandler('./prediction-models');
		// await model.save(saveHandler);

		console.log('Model updated and saved');
		return new Response(null, { status: 200 });
	},
};
