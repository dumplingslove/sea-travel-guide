import { Link } from "react-router-dom";
import { Hammer } from "lucide-react";

export default function Placeholder({
  title,
  note,
}: {
  title: string;
  note?: string;
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <Hammer size={32} className="mx-auto text-teal-700 mb-4" />
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-gray-500 mb-6">
        {note ?? "该功能正在搭建中，敬请期待。"}
      </p>
      <Link
        to="/"
        className="inline-block px-5 py-2 rounded-lg bg-teal-700 text-white text-sm font-medium hover:bg-teal-800"
      >
        返回首页
      </Link>
    </div>
  );
}
