// deno-lint-ignore-file no-explicit-any
import { useState } from 'preact/hooks';
import Chart from './Chart.tsx';
import groupBy from 'https://deno.land/x/ramda@v0.27.2/source/groupBy.js';
import sort from 'https://deno.land/x/ramda@v0.27.2/source/sort.js';
import toPairs from 'https://deno.land/x/ramda@v0.27.2/source/toPairs.js';
import flatten from 'https://deno.land/x/ramda@v0.27.2/source/flatten.js';
import { Student } from '../types.ts';
import { parseLevel } from '../library/parse-level.ts';

type StudentReport = Omit<Student, 'sid'> & {
	status: 'Continuing' | 'Outgoing' | 'Freshmen';
};

type StudentData = {
	year: number;
	semester: number;
	college: string;
	count: number;
};

const calculateSummary = (studentList: StudentReport[]) => {
	const total = studentList.length;
	const freshmen = studentList.filter((s) => s.status === 'Freshmen').length;
	const continuing =
		studentList.filter((s) => s.status === 'Continuing').length;
	const outgoing = studentList.filter((s) => s.status === 'Outgoing').length;

	return {
		'Total Students': total,
		Freshmen: freshmen,
		Continuing: continuing,
		Outgoing: outgoing,
	};
};

export default function Dashboard(
	params: {
		students: Student[];
		studentData: StudentData[];
		predictedStudenData: StudentData[];
	},
) {
	const students: StudentReport[] = toPairs(
		groupBy((student: Student) => student.slug, params.students),
	).reduce((acc: StudentReport[], [, students]: [string, Student[]]) => {
		const student = students[students.length - 1];
		const studentReport: StudentReport = {
			...student,
			status: 'Freshmen',
		};
		if (students.length > 1) {
			studentReport.status = 'Continuing';
		}
		return [...acc, studentReport];
	}, []);

	const collegeStats = students.reduce(
		(acc: Record<string, number>, student) => {
			acc[student.college] = (acc[student.college] || 0) + 1;
			return acc;
		},
		{},
	);

	const colleges = ['CAS', 'CA', 'CET'];
	const summary = calculateSummary(students);

	const paginatedStudents = sort(
		(a: StudentReport, b: StudentReport) => b.level - a.level,
		students,
	).slice(0, 10);

	// 📊 Data for Pie Chart (School Year Distribution)
	const pieChartData = {
		labels: colleges,
		datasets: [
			{
				data: colleges.map((college) => collegeStats[college]),
				backgroundColor: ['#7C3AED', '#22C55E', '#EF4444'],
			},
		],
	};
	const mergedData = [...params.studentData, ...params.predictedStudenData];

	const xAxisLabels = [
		...new Set(mergedData.map((data) => `${data.semester}-${data.year}`)),
	].sort((a, b) => {
		const [semesterA, yearA] = a.split('-').map(Number);
		const [semesterB, yearB] = b.split('-').map(Number);
		if (yearA === yearB) return semesterA - semesterB; // Sort by semester if years are the same
		return yearA - yearB; // Sort by year
	});

	const isPrediction = (input: { year: number; semester: number }) =>
		params.predictedStudenData.find((data) =>
			data.year === input.year && data.semester === input.semester
		);

	// Group and align data for each college
	const predictionChartData = {
		labels: xAxisLabels, // Sorted x-axis labels
		datasets: flatten(colleges.map((college, index) => {
			const data = mergedData.filter((data) => data.college === college);
			const currentData = data.filter((data) => !isPrediction(data));
			const predictedData = data.filter((data) => isPrediction(data));

			return [
				{
					label: `${college} (Historical)`,
					data: [
						...currentData.map((data) => data.count),
						...Array.from({ length: predictedData.length }).fill(
							null,
						),
					],
					fill: false,
					borderColor: ['#7C3AED', '#22C55E', '#EF4444'][index % 3],
					tension: 0.1,
					rank: 1,
				},
				{
					label: `${college} (Prediction)`,
					data: [
						...Array.from({ length: currentData.length - 1 }).fill(
							null,
						),
						currentData[currentData.length - 1]?.count,
						...predictedData.map((data) => data.count),
					],
					fill: false,
					borderColor: ['#7C3AED', '#22C55E', '#EF4444'][index % 3],
					tension: 0.1,
					borderDash: [5, 5],
					rank: 2,
				},
			];
		})).sort((a: any, b: any) => a.rank - b.rank),
	};

	// Chart Options
	const predictionChartOptions = {
		scales: {
			x: {
				title: { display: true, text: 'Semester - Year' },
				ticks: { color: '#FFFFFF' },
			},
			y: {
				title: { display: true, text: 'Student Count' },
				beginAtZero: true,
				ticks: { color: '#FFFFFF' },
			},
		},
		plugins: {
			legend: {
				display: true,
				position: 'bottom',
				labels: { color: '#FFFFFF' },
			},
			tooltip: { enabled: true },
		},
		responsive: true,
		maintainAspectRatio: false,
	};

	return (
		<>
			<main class='p-4 max-w-screen-lg mx-auto'>
				<h1 class='text-3xl font-bold text-gray-100'>
					Enrollment Dashboard
				</h1>

				{/* Summary Cards */}
				<section class='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4'>
					{['Total Students', 'Freshmen', 'Continuing', 'Outgoing']
						.map(
							(item, idx) => (
								<div
									key={idx}
									class='bg-purple-800 text-gray-200 p-4 rounded shadow'
								>
									<p>{item}</p>
									<h2 class='text-2xl font-bold'>
										{summary[item as keyof typeof summary]}
									</h2>
								</div>
							),
						)}
				</section>

				{/* Charts Section */}
				<section class='grid grid-cols-1 md:grid-cols-2 gap-4 mt-8'>
					<div class='bg-gray-800 p-4 rounded shadow'>
						<h3 class='font-bold text-gray-200'>
							Enrollment Prediction
						</h3>
						<div style={{ width: '100%', height: '400px' }}>
							<Chart
								type='line'
								data={predictionChartData}
								options={predictionChartOptions}
							/>
						</div>
					</div>

					{/* Pie Chart */}
					<div class='bg-gray-800 p-6 rounded-lg shadow-lg'>
						<h3 class='text-xl font-bold text-gray-100 mb-6'>
							AY {new Date().getFullYear() - 1}-{new Date()
								.getFullYear()} Distribution
						</h3>
						<Chart type='pie' data={pieChartData} />
					</div>
				</section>

				{/* Students Table */}
				<section class='mt-8 bg-gray-800 p-4 rounded shadow'>
					<h3 class='font-bold text-gray-200 mb-4'>
						Recent Students
					</h3>
					<table class='w-full text-left text-gray-200'>
						<thead class='bg-gray-700'>
							<tr>
								<th class='p-2'>Name</th>
								<th class='p-2'>College</th>
								<th class='p-2'>Year Level</th>
								<th class='p-2'>Status</th>
							</tr>
						</thead>
						<tbody>
							{paginatedStudents.map(
								(student: StudentReport, idx: number) => (
									<tr
										key={idx}
										class={`${
											idx % 2 === 0
												? 'bg-gray-600'
												: 'bg-gray-700'
										} hover:bg-gray-500`}
									>
										<td class='p-2'>{student.name}</td>
										<td class='p-2'>{student.college}</td>
										<td class='p-2'>
											{parseLevel(student.level)} Year
											{' '}
											{student.degree}
										</td>
										<td class='p-2'>{student.status}</td>
									</tr>
								),
							)}
						</tbody>
					</table>
				</section>
			</main>
		</>
	);
}
