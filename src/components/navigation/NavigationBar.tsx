'use client';

import { Navbar, NavbarContent } from '@nextui-org/navbar';
import Link from 'next/link';

export default function NavigationBar() {
  return (
    <Navbar
      className="bg-content1 justify-between px-4 lg:px-8"
      height={'3rem'}
    >
      <NavbarContent justify="start" className="!grow-[3]">
        <header className="m-1 flex justify-center">
          <Link href="/">App Config</Link>
        </header>
      </NavbarContent>
    </Navbar>
  );
}
