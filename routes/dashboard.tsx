import { Head } from '$fresh/runtime.ts';
import { Handlers } from '$fresh/server.ts';
import Sidebar from '../islands/SideBar.tsx';
import Dashboard from '../islands/Dashboard.tsx';
import StudentModel from '../models/student.ts';
import { Student } from '../types.ts';
import { authorize } from '../middlewares/authorize.ts';
import clone from 'https://deno.land/x/ramda@v0.27.2/source/clone.js';
import predictNextSemesters from '../library/predict-next-semesters.ts';

type StudentData = {
	year: number;
	semester: number;
	college: string;
	count: number;
};

const colleges = ['CET', 'CA', 'CAS'];

const generateNextSemesters = (
	data: StudentData[],
	nextSemesters: number,
) => {
	const predictions: {
		year: number;
		semester: number;
		college: string;
		collegeIndex: number;
	}[] = [];
	const lastSemester = data.reduce(
		(prev, curr) =>
			curr.year > prev.year ||
				(curr.year === prev.year && curr.semester > prev.semester)
				? curr
				: prev,
		{ year: 0, semester: 0 } as StudentData,
	);

	for (let i = 1; i <= nextSemesters; i++) {
		const nextSemester = (lastSemester.semester % 2) + 1;
		const nextYear = lastSemester.semester === 2
			? lastSemester.year + 1
			: lastSemester.year;

		colleges.forEach((college) => {
			predictions.push({
				year: nextYear,
				semester: nextSemester,
				college,
				collegeIndex: college === 'CET' ? 0 : college === 'CA' ? 1 : 2,
			});
		});

		lastSemester.year = nextYear;
		lastSemester.semester = nextSemester;
	}

	return predictions;
};

export const handler: Handlers = {
	async GET(req, ctx) {
		if (!authorize(req)) {
			return new Response(null, {
				status: 302,
				headers: { Location: '/login' }, // Redirect to home if already logged in
			});
		}
		const students = await StudentModel.list();

		const studentData: StudentData[] = students.reduce(
			(acc: StudentData[], student: Student) => {
				const existingData = acc.find(
					(data) =>
						data.year === student.schoolYear &&
						data.semester === student.semester &&
						data.college === student.college,
				);

				if (existingData) {
					existingData.count += 1;
				} else {
					acc.push({
						year: student.schoolYear,
						semester: student.semester,
						college: student.college,
						count: 1,
					});
				}

				return acc;
			},
			[],
		);

		const nextSemesters = generateNextSemesters(clone(studentData), 3);
		// Prepare input features for the next 3 semesters
		const inputFeatures = nextSemesters.map(
			(nextSemester) => [
				nextSemester.year,
				nextSemester.semester,
				nextSemester.collegeIndex,
			],
		);

		const maxYear = Math.max(...nextSemesters.map((data) => data.year));
		const maxSemester = Math.max(
			...nextSemesters.map((data) => data.semester),
		);

		const predictions = await predictNextSemesters({
			inputFeatures,
			maxYear,
			maxSemester,
		});

		const predictedStudentData: StudentData[] = predictions
			.flatMap(
				(prediction: number, semesterIdx: number) => {
					return {
						year: nextSemesters[semesterIdx].year,
						semester: nextSemesters[semesterIdx].semester,
						college: nextSemesters[semesterIdx].college,
						count: Math.round(
							prediction,
						),
					};
				},
			);

		return ctx.render({
			students,
			studentData,
			predictedStudentData,
		});
	},
};

export default function Home(
	{ data }: {
		data: {
			students: Student[];
			studentData: StudentData[];
			predictedStudentData: StudentData[];
		};
	},
) {
	return (
		<>
			<Head>
				<title>School Enrollee Prediction</title>
				<script
					src='/js/chart.js' //"https://cdn.jsdelivr.net/npm/chart.js"
					defer
				/>
			</Head>
			<div class='flex bg-gray-900 text-gray-200 min-h-screen'>
				<Sidebar />
				<div class='ml-64 p-4 w-full'>
					<Dashboard
						students={data.students}
						studentData={data.studentData}
						predictedStudenData={data.predictedStudentData}
					/>
				</div>
			</div>
		</>
	);
}
