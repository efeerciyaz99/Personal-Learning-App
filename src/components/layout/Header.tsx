'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';

export function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/summary/create', label: 'New Summary' },
    { href: '/settings', label: 'Settings' },
  ];

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <Link href="/" className="font-bold text-xl">
          Learning Assistant
        </Link>

        <nav className="ml-8 flex gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`hover:text-blue-600 ${
                pathname === item.href ? 'text-blue-600' : ''
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <Link href="/search" className="p-2 hover:bg-gray-100 rounded-full">
            <Search className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
} 