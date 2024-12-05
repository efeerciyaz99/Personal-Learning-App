'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Book, Video, FileText, Newspaper } from 'lucide-react';

const MEDIUMS = [
  { icon: Book, label: 'Articles', href: '/dashboard/article' },
  { icon: Video, label: 'Videos', href: '/dashboard/video' },
  { icon: FileText, label: 'Documents', href: '/dashboard/document' },
  { icon: Newspaper, label: 'Blogs', href: '/dashboard/blog' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 border-r h-[calc(100vh-4rem)] p-4">
      <h2 className="font-semibold mb-4">Content Types</h2>
      <nav className="space-y-2">
        {MEDIUMS.map(({ icon: Icon, label, href }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 p-2 rounded hover:bg-gray-100 ${
              pathname === href ? 'bg-gray-100' : ''
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <h2 className="font-semibold mb-4 mt-8">Themes</h2>
      <div className="space-y-2">
        {/* Theme list will be dynamically populated */}
      </div>
    </div>
  );
} 