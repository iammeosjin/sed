export default function Sidebar() {
  return (
    <nav class="fixed top-0 left-0 h-full bg-gray-800 text-gray-200 w-64">
      <ul>
        {["Dashboard", "Reports", "Analytics", "Prediction", "Settings"].map(
          (item, idx) => (
            <li key={idx} class="p-4 hover:bg-gray-700">
              <a href={`/${item.toLowerCase()}`} class="block">
                {item}
              </a>
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}
