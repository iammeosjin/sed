import { Head } from '$fresh/runtime.ts';
import Sidebar from '../components/SideBar.tsx';
import Dashboard from '../islands/Dashboard.tsx';

export default function Home() {
  return (
    <>
      <Head>
        <title>School Enrollee Prediction</title>
      </Head>
      <div class='flex bg-gray-900 text-gray-200 min-h-screen'>
        <Sidebar />
        <div class='ml-64 p-4 w-full'>
          <Dashboard />
        </div>
      </div>
    </>
  );
}
