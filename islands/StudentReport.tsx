import { useEffect, useState } from "preact/hooks";

export default function ReportsPage() {
  const [students, setStudents] = useState<
    { name: string; college: string; department: string; id: string; status: string }[]
  >([]);
  const [summary, setSummary] = useState({
    total: 0,
    freshmen: 0,
    continuing: 0,
    outgoing: 0,
  });

  useEffect(() => {
    // Generate random students data
    const colleges = ["Engineering", "Agriculture", "Arts and Sciences"];
    const departments = ["Information Technology", "Agriculture", "Social Work"];
    const statuses = ["Freshmen", "Continuing", "Outgoing"];
    const randomStudents = Array.from({ length: 20 }, (_, idx) => ({
      name: `Student ${idx + 1}`,
      college: colleges[Math.floor(Math.random() * colleges.length)],
      department: departments[Math.floor(Math.random() * departments.length)],
      id: `2023${Math.floor(1000 + Math.random() * 9000)}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
    }));
    setStudents(randomStudents);

    // Calculate summary data
    const total = randomStudents.length;
    const freshmen = randomStudents.filter((s) => s.status === "Freshmen").length;
    const continuing = randomStudents.filter((s) => s.status === "Continuing").length;
    const outgoing = randomStudents.filter((s) => s.status === "Outgoing").length;

    setSummary({ total, freshmen, continuing, outgoing });
  }, []);

  return (
    <div class="bg-gray-900 min-h-screen text-gray-200 p-6">
      <h1 class="text-3xl font-bold mb-6">Enrollment Reports</h1>

      {/* Summary Cards */}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { title: "Total Students", value: summary.total },
          { title: "Freshmen Students", value: summary.freshmen },
          { title: "Continuing Students", value: summary.continuing },
          { title: "Outgoing Students", value: summary.outgoing },
        ].map((item, idx) => (
          <div
            key={idx}
            class="bg-purple-800 text-gray-200 p-4 rounded shadow text-center"
          >
            <p>{item.title}</p>
            <h2 class="text-2xl font-bold">{item.value}</h2>
          </div>
        ))}
      </div>

      {/* Students Table */}
      <div class="bg-gray-800 p-6 rounded-lg shadow">
        <h2 class="text-xl font-bold mb-4">Enrolled Students</h2>
        <table class="w-full text-left text-gray-200">
          <thead class="bg-gray-700">
            <tr>
              <th class="p-2">Name</th>
              <th class="p-2">College</th>
              <th class="p-2">Department</th>
              <th class="p-2">ID Number</th>
              <th class="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, idx) => (
              <tr
                key={idx}
                class={`${
                  idx % 2 === 0 ? "bg-gray-600" : "bg-gray-700"
                } hover:bg-gray-500`}
              >
                <td class="p-2">{student.name}</td>
                <td class="p-2">{student.college}</td>
                <td class="p-2">{student.department}</td>
                <td class="p-2">{student.id}</td>
                <td class="p-2">{student.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
