// deno-lint-ignore-file ban-ts-comment
import { useEffect } from 'preact/hooks';
import { Student } from '../types.ts';
import { parseLevel } from '../library/parse-level.ts';
import clone from 'https://deno.land/x/ramda@v0.27.2/source/clone.js';

type StudentData = {
  year: number;
  semester: number;
  college: string;
  count: number;
};

export default function PredictionPage({ students }: { students: Student[] }) {
  const colleges = ['CET', 'CA', 'CAS'];

  // Prediction logic
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

  const studentData: StudentData[] = students.reduce(
    (acc: StudentData[], student: Student) => {
      const existingData = acc.find(
        (data) =>
          data.year === student.schoolYear &&
          data.semester === student.semester &&
          data.college === student.college,
      );

      if (student.schoolYear === 2026) {
        console.log('existingData', existingData);
      }

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

  useEffect(() => {
    const nextSemesters = generateNextSemesters(clone(studentData), 3);
    // Prepare input features for the next 3 semesters
    const inputFeatures = nextSemesters.map(
      (nextSemester) => [
        nextSemester.year,
        nextSemester.semester,
        nextSemester.collegeIndex,
      ],
    );
    // Fetch predictions from the backend
    fetch('/api/prediction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ semesters: inputFeatures }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.predictions) {
          const formattedPredictions: StudentData[] = data.predictions
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

          drawStackedBarChart([...studentData, ...formattedPredictions]);
        }
      })
      .catch((err) => console.error('Error fetching predictions:', err));
  }, []);

  const drawStackedBarChart = (combinedData: StudentData[]) => {
    const ctx = document.getElementById('stackedBarChart');
    if (!ctx) return;

    // Create unique labels for each semester and year
    const labels = [
      ...new Set(combinedData.map(
        (data) => `${parseLevel(data.semester)} Sem ${data.year}`,
      )),
    ];

    // Create data series for each college
    const seriesData = colleges.map((college) => {
      return {
        name: college,
        data: labels.map((label) => {
          const matchingData = combinedData.find(
            (d) =>
              `${parseLevel(d.semester)} Sem ${d.year}` === label &&
              d.college === college,
          );

          return matchingData ? matchingData.count : 0;
        }),
      };
    });

    // Render the chart
    //@ts-ignore
    new ApexCharts(ctx, {
      chart: {
        type: 'bar',
        height: 400,
        stacked: true,
        toolbar: {
          show: true,
        },
      },
      series: seriesData,
      xaxis: {
        categories: labels,
        labels: {
          style: {
            colors: '#FFFFFF', // White text for better visibility
            fontSize: '14px', // Adjust font size
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: '#FFFFFF',
            fontSize: '14px',
          },
        },
      },
      colors: ['#FF0000', '#00FF00', '#0000FF'],
      plotOptions: {
        bar: {
          columnWidth: '50%', // Adjust bar width
        },
      },
      legend: {
        position: 'bottom',
        labels: {
          colors: '#FFFFFF',
          useSeriesColors: true,
        },
        markers: {
          radius: 5,
        },
      },
      tooltip: {
        theme: 'dark',
        y: {
          formatter: (val: number) => `${val} students`,
        },
      },
    }).render();
  };

  return (
    <div class='bg-gray-900 min-h-screen text-gray-200 p-6'>
      <h1 class='text-3xl font-bold mb-6'>Prediction Page</h1>

      {/* Stacked Bar Chart */}
      <div class='bg-gray-800 p-6 rounded-lg shadow'>
        <h2 class='text-xl font-bold mb-4'>Predicted Enrollment Trends</h2>
        <div id='stackedBarChart' class='w-full h-64'></div>
      </div>
    </div>
  );
}
