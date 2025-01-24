// deno-lint-ignore-file no-explicit-any
import { useState } from 'preact/hooks';
import groupBy from 'https://deno.land/x/ramda@v0.27.2/source/groupBy.js';
import sort from 'https://deno.land/x/ramda@v0.27.2/source/sort.js';
import toPairs from 'https://deno.land/x/ramda@v0.27.2/source/toPairs.js';
import { Student } from '../types.ts';
import { parseLevel } from '../library/parse-level.ts';

type StudentReport = Omit<Student, 'sid'> & {
  status: 'Continuing' | 'Outgoing' | 'Freshmen';
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

export default function Dashboard(params: { students: Student[] }) {
  const latestSchoolYear = params.students.reduce(
    (acc, student) => {
      if (student.schoolYear > acc.year) {
        acc.year = student.schoolYear;
        acc.semester = student.semester;
      } else if (
        student.schoolYear === acc.year && student.semester > acc.semester
      ) {
        acc.semester = student.semester;
      }
      return acc;
    },
    {
      year: 1,
      semester: 1,
    },
  );
  const [students] = useState<StudentReport[]>(
    toPairs(
      groupBy((student: Student) => student.slug, params.students),
    ).reduce(
      (acc: StudentReport[], [, students]: [string, Student[]]) => {
        const student = students[students.length - 1];
        const studentReport: StudentReport = {
          ...student,
          status: 'Freshmen',
        };
        if (
          student.schoolYear < latestSchoolYear.year ||
          student.semester < latestSchoolYear.semester
        ) {
          studentReport.status = 'Outgoing';
        } else if (students.length > 1) {
          studentReport.status = 'Continuing';
        }
        return [...acc, studentReport];
      },
      [],
    ),
  );

  const collegeStats = students.reduce(
    (acc: Record<string, number>, student) => {
      acc[student.college] = (acc[student.college] || 0) + 1;
      return acc;
    },
    {},
  );

  const colleges = Object.keys(collegeStats);

  const summary = calculateSummary(students);

  const paginatedStudents = sort(
    (a: StudentReport, b: StudentReport) => b.level - a.level,
    students,
  ).slice(0, 10);

  const percentages = Object.values(collegeStats).map((value) =>
    (value / summary['Total Students']) * 100
  );

  // Helper function to calculate SVG path for each slice
  const calculatePath = (percentage: number, startAngle: number) => {
    const x1 = 16 + 16 * Math.cos((Math.PI * 2 * startAngle) / 100);
    const y1 = 16 + 16 * Math.sin((Math.PI * 2 * startAngle) / 100);
    const endAngle = startAngle + percentage;
    const x2 = 16 + 16 * Math.cos((Math.PI * 2 * endAngle) / 100);
    const y2 = 16 + 16 * Math.sin((Math.PI * 2 * endAngle) / 100);
    const largeArcFlag = percentage > 50 ? 1 : 0;

    return `M16,16 L${x1},${y1} A16,16 0 ${largeArcFlag},1 ${x2},${y2} Z`;
  };

  const colors = ['#7C3AED', '#22C55E', '#EF4444']; // Purple, Green, Red

  return (
    <>
      <main class='p-4 max-w-screen-lg mx-auto'>
        <h1 class='text-3xl font-bold text-gray-100'>Enrollment Dashboard</h1>

        {/* Summary Cards */}
        <section class='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4'>
          {['Total Students', 'Freshmen', 'Continuing', 'Outgoing'].map(
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

        {/* Charts */}
        <section class='grid grid-cols-1 md:grid-cols-2 gap-4 mt-8'>
          <div class='bg-gray-800 p-4 rounded shadow'>
            <h3 class='font-bold text-gray-200'>Enrollees per College</h3>
            <div class='mt-4'>
              {colleges.map((college, idx) => (
                <div key={idx} class='flex items-center justify-between'>
                  <span>{college}</span>
                  <div class='bg-purple-600 h-4 rounded-full w-2/3 relative'>
                    <div
                      class='absolute top-0 left-0 h-full bg-purple-400'
                      style={{
                        width: `${
                          (collegeStats[college] / summary['Total Students']) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <span>{collegeStats[college]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pie Chart */}
          <div class='bg-gray-800 p-6 rounded-lg shadow-lg max-w-screen-md mx-auto'>
            <h3 class='text-xl font-bold text-gray-100 mb-6'>
              AY {new Date().getFullYear() - 1}-{new Date().getFullYear()}{' '}
              Distribution
            </h3>
            <div class='flex justify-center items-center mb-8'>
              <svg viewBox='0 0 32 32' class='w-64 h-64'>
                {percentages.reduce(
                  (acc, percentage, idx) => {
                    const startAngle = acc.startAngle;
                    const path = calculatePath(percentage, startAngle);
                    acc.startAngle += percentage;
                    acc.elements.push(
                      <path
                        key={idx}
                        d={path}
                        fill={colors[idx]}
                        stroke='#2D2D2D'
                        strokeWidth='0.5'
                      />,
                    );
                    return acc;
                  },
                  { startAngle: 0, elements: [] as any[] },
                ).elements}
              </svg>
            </div>
            <div class='flex justify-around'>
              {colleges.map((college, index) => {
                return (
                  <div class='flex items-center space-x-2'>
                    <span
                      class='block w-4 h-4'
                      style={{ backgroundColor: colors[index] }}
                    >
                    </span>
                    <span>{college}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Students Table */}
        <section class='mt-8 bg-gray-800 p-4 rounded shadow'>
          <h3 class='font-bold text-gray-200 mb-4'>Recent Students</h3>
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
                      idx % 2 === 0 ? 'bg-gray-600' : 'bg-gray-700'
                    } hover:bg-gray-500`}
                  >
                    <td class='p-2'>{student.name}</td>
                    <td class='p-2'>{student.college}</td>
                    <td class='p-2'>
                      {parseLevel(student.level)} Year {student.degree}
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
