import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold mb-2">页面不存在</h1>
      <p className="text-gray-500 mb-6">你访问的页面找不到了。</p>
      <Link
        to="/"
        className="inline-block px-5 py-2 rounded-lg bg-teal-700 text-white text-sm font-medium hover:bg-teal-800"
      >
        返回首页
      </Link>
    </div>
  );
}
