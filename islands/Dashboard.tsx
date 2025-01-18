import { useEffect, useRef, useState } from 'preact/hooks';

export default function Dashboard() {
  const [data, setData] = useState<number[]>([]);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [students, setStudents] = useState<
    {
      name: string;
      college: string;
      department: string;
      id: string;
      status: string;
    }[]
  >([]);

  useEffect(() => {
    // Generate random data for charts
    const randomData = Array.from(
      { length: 3 },
      () => Math.floor(Math.random() * 5000),
    );
    setData(randomData);

    // Generate random students data
    const colleges = ['CET', 'CA', 'CAS'];
    const departments = ['BS IT', 'BS Agriculture', 'BS Social Work'];
    const statuses = ['Freshmen', 'Continuing', 'Outgoing'];
    const randomStudents = Array.from({ length: 10 }, (_, idx) => ({
      name: `Student ${idx + 1}`,
      college: colleges[Math.floor(Math.random() * colleges.length)],
      department: departments[Math.floor(Math.random() * departments.length)],
      id: `2023${Math.floor(1000 + Math.random() * 9000)}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
    }));
    setStudents(randomStudents);

    if (chartRef.current) {
      const chartInstance = new Chart(chartRef.current, {
        type: 'pie',
        data: {
          labels: ['CET', 'CA', 'CAS'],
          datasets: [
            {
              data: randomData,
              backgroundColor: ['#7C3AED', '#22C55E', '#EF4444'], // Colors
              borderColor: '#2D2D2D',
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#FFFFFF', // White text for dark background
                font: { size: 14 },
              },
            },
          },
        },
      });

      // Cleanup chart on component unmount
      return () => chartInstance.destroy();
    }
  }, []);

  // Calculate percentages for the pie chart
  const total = data.reduce((sum, value) => sum + value, 0);
  const percentages = data.map((value) => (value / total) * 100);

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
                  {idx === 0 ? data.reduce((a, b) => a + b, 0) : data[idx - 1]}
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
              {['CET', 'CA', 'CAS'].map((college, idx) => (
                <div key={idx} class='flex items-center justify-between'>
                  <span>{college}</span>
                  <div class='bg-purple-600 h-4 rounded-full w-2/3 relative'>
                    <div
                      class='absolute top-0 left-0 h-full bg-purple-400'
                      style={{
                        width: `${(data[idx] / 5000) * 100}%`,
                      }}
                    />
                  </div>
                  <span>{data[idx]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pie Chart */}
          <div class='bg-gray-800 p-6 rounded-lg shadow-lg max-w-screen-md mx-auto'>
            <h3 class='text-xl font-bold text-gray-100 mb-6'>
              AY 2024-2025 Distribution
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
                  { startAngle: 0, elements: [] as JSX.Element[] },
                ).elements}
              </svg>
            </div>
            <div class='flex justify-around'>
              <div class='flex items-center space-x-2'>
                <span
                  class='block w-4 h-4'
                  style={{ backgroundColor: colors[0] }}
                >
                </span>
                <span>CET</span>
              </div>
              <div class='flex items-center space-x-2'>
                <span
                  class='block w-4 h-4'
                  style={{ backgroundColor: colors[1] }}
                >
                </span>
                <span>CA</span>
              </div>
              <div class='flex items-center space-x-2'>
                <span
                  class='block w-4 h-4'
                  style={{ backgroundColor: colors[2] }}
                >
                </span>
                <span>CAS</span>
              </div>
            </div>
          </div>
          {
            /* <div class='bg-gray-800 p-4 rounded shadow'>
            <h3 class='font-bold text-gray-200'>AY 2024-2025 Distribution</h3>
            <div class='flex justify-center items-center mt-4'>
              <svg viewBox='0 0 32 32' class='w-32 h-32'>
                {data.map((value, idx) => {
                  const percentage = value / total; // Calculate percentage
                  const offset = data
                    .slice(0, idx) // Sums up previous slices
                    .reduce((sum, prevValue) => sum + prevValue / total, 0) *
                    100;

                  return (
                    <circle
                      key={idx}
                      r='16'
                      cx='16'
                      cy='16'
                      fill='transparent'
                      stroke={colors[idx]}
                      strokeWidth='32'
                      strokeDasharray={`${percentage * 100} ${
                        100 - percentage * 100
                      }`}
                      strokeDashoffset={-offset} // Adjust slice offset
                      transform='rotate(-90 16 16)' // Start from top
                    />
                  );
                })}
              </svg>
            </div>
            <div class='mt-4 flex justify-around'>
              <div class='flex items-center space-x-2'>
                <span
                  class='block w-4 h-4'
                  style={{ backgroundColor: colors[0] }}
                >
                </span>
                <span>CET</span>
              </div>
              <div class='flex items-center space-x-2'>
                <span
                  class='block w-4 h-4'
                  style={{ backgroundColor: colors[1] }}
                >
                </span>
                <span>CA</span>
              </div>
              <div class='flex items-center space-x-2'>
                <span
                  class='block w-4 h-4'
                  style={{ backgroundColor: colors[2] }}
                >
                </span>
                <span>CAS</span>
              </div>
            </div>
          </div> */
          }
        </section>

        {/* Students Table */}
        <section class='mt-8 bg-gray-800 p-4 rounded shadow'>
          <h3 class='font-bold text-gray-200 mb-4'>Recent Students</h3>
          <table class='w-full text-gray-200'>
            <thead>
              <tr class='bg-gray-700'>
                <th class='p-2 text-left'>Name</th>
                <th class='p-2 text-left'>College</th>
                <th class='p-2 text-left'>Department</th>
                <th class='p-2 text-left'>ID</th>
                <th class='p-2 text-left'>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => (
                <tr
                  key={idx}
                  class={`${
                    idx % 2 === 0 ? 'bg-gray-600' : 'bg-gray-700'
                  } hover:bg-gray-500`}
                >
                  <td class='p-2'>{student.name}</td>
                  <td class='p-2'>{student.college}</td>
                  <td class='p-2'>{student.department}</td>
                  <td class='p-2'>{student.id}</td>
                  <td class='p-2'>{student.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </>
  );
}
