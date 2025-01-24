export default function Sidebar() {
  return (
    <nav class='fixed top-0 left-0 h-full bg-gray-900 text-gray-200 w-64 shadow-lg'>
      <div class='flex items-center justify-center py-6'>
        <h1 class='text-xl font-bold uppercase tracking-wide text-purple-400'>
          Enrollment Trends
        </h1>
      </div>
      <ul class='mt-4 space-y-2'>
        {[
          { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
          { name: 'Reports', href: '/reports', icon: '📄' },
          { name: 'Prediction', href: '/prediction', icon: '📊' },
        ].map((item, idx) => (
          <li key={idx}>
            <a
              href={item.href}
              class='flex items-center px-4 py-3 rounded-lg transition hover:bg-purple-600 hover:text-white'
            >
              <span class='mr-3 text-xl'>{item.icon}</span>
              <span class='font-medium'>{item.name}</span>
            </a>
          </li>
        ))}
      </ul>
      <div class='absolute bottom-6 w-full px-4'>
        <button class='w-full py-2 px-4 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition'>
          Logout
        </button>
      </div>
    </nav>
  );
}
