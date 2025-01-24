import { useState } from 'preact/hooks';
import groupBy from 'https://deno.land/x/ramda@v0.27.2/source/groupBy.js';
import toPairs from 'https://deno.land/x/ramda@v0.27.2/source/toPairs.js';
import sortBy from 'https://deno.land/x/ramda@v0.27.2/source/sort.js';
import ascend from 'https://deno.land/x/ramda@v0.27.2/source/ascend.js';
import prop from 'https://deno.land/x/ramda@v0.27.2/source/prop.js';
import FileUpload from '../components/FileUpload.tsx';
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

  return { total, freshmen, continuing, outgoing };
};

export default function ReportsPage(params: { students: Student[] }) {
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
    sortBy(
      ascend(prop('name')),
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
    ),
  );
  const [summary] = useState(calculateSummary(students));

  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 20;

  // Pagination logic
  const totalPages = Math.ceil(students.length / studentsPerPage);
  const paginatedStudents = students.slice(
    (currentPage - 1) * studentsPerPage,
    currentPage * studentsPerPage,
  );

  // Dynamic pagination range
  const getPageNumbers = () => {
    const rangeSize = 4;
    const start = Math.max(1, currentPage - Math.floor(rangeSize / 2));
    const end = Math.min(totalPages, start + rangeSize - 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div class='bg-gray-900 min-h-screen text-gray-200 p-6'>
      <h1 class='text-3xl font-bold mb-6'>Enrollment Reports</h1>

      {/* Summary Cards */}
      <div class='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
        {[
          { title: 'Total Students', value: summary.total },
          { title: 'Freshmen Students', value: summary.freshmen },
          { title: 'Continuing Students', value: summary.continuing },
          { title: 'Outgoing Students', value: summary.outgoing },
        ].map((item, idx) => (
          <div
            key={idx}
            class='bg-purple-800 text-gray-200 p-4 rounded shadow text-center'
          >
            <p>{item.title}</p>
            <h2 class='text-2xl font-bold'>{item.value}</h2>
          </div>
        ))}
      </div>

      {/* Students Table Header with Upload Button */}
      <div class='flex justify-between items-center mb-4'>
        <h2 class='text-xl font-bold'>Enrolled Students</h2>
        <FileUpload uploadType='students' />
      </div>

      {/* Students Table */}
      <div class='bg-gray-800 p-6 rounded-lg shadow'>
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

        {/* Pagination */}
        <div class='mt-4 flex flex-wrap justify-center gap-2'>
          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            class='px-4 py-2 rounded bg-gray-700 text-gray-300 hover:bg-purple-600 hover:text-white disabled:opacity-50'
          >
            Prev
          </button>

          {/* Numbered Buttons */}
          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              class={`px-4 py-2 rounded ${
                page === currentPage
                  ? 'bg-purple-700 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-purple-600 hover:text-white'
              }`}
            >
              {page}
            </button>
          ))}

          {/* Next Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            class='px-4 py-2 rounded bg-gray-700 text-gray-300 hover:bg-purple-600 hover:text-white disabled:opacity-50'
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
