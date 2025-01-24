import { Head } from '$fresh/runtime.ts';
import Sidebar from '../components/SideBar.tsx';
import StudentReport from '../islands/StudentReport.tsx';
import { Handlers } from '$fresh/server.ts';
import StudentModel from '../models/student.ts';
import { Student } from '../types.ts';

export const handler: Handlers = {
  async GET(_, ctx) {
    const students = await StudentModel.list();

    return ctx.render({
      students,
    });
  },
};

export default function Home(
  { data }: { data: { students: Student[] } },
) {
  return (
    <>
      <Head>
        <title>School Enrollee Prediction</title>
        <link
          href='/css/file.css'
          rel='stylesheet'
        />
      </Head>
      <div class='flex bg-gray-900 text-gray-200 min-h-screen'>
        <Sidebar />
        <div class='ml-64 p-4 w-full'>
          <StudentReport students={data.students} />
        </div>
      </div>
    </>
  );
}
