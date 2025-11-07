"use client";

import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <header className="flex justify-between items-center p-4 gap-4 h-16 max-w-7xl mx-auto">
      <Button
        asChild
        variant="ghost"
        className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold h-auto py-2 px-3 sm:px-4 hover:bg-transparent"
      >
        <Link href="/">나만의 관광지</Link>
      </Button>
      <div className="flex gap-4 items-center">
        <Button asChild variant="ghost" className="hidden sm:flex">
          <Link href="/stats">통계</Link>
        </Button>
        <SignedOut>
          <SignInButton mode="modal">
            <Button>로그인</Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
};

export default Navbar;
