import { FileText } from "lucide-react";
import { Button } from "../ui/button";
import NavLink from "./nav-link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import PlanBadge from "./plan-badge";

export default function Header() {
  return (
    <nav className="container flex justify-between items-center py-2 lg:px-8 px-2 mx-auto">
      <div className="flex lg:flex-1">
        <NavLink href="/" className="flex items-center gap-1 lg:gap-2 shrink-0">
          <FileText className="w-4 h-4 lg:w-6 lg:h-6 text-gray-900 hover:rotate-12 transform transition duration-200 ease-in-out" />
          <span className="lg:text-lg font-extrabold text-gray-900">
            Sommaire
          </span>
        </NavLink>
      </div>
      <div className="flex lg:justify-center gap-4 lg:gap-12 lg:items-center">
        <NavLink href="/#pricing">Pricing</NavLink>
        <SignedIn>
          <NavLink href="/dashboard">Your summaries</NavLink>
        </SignedIn>
      </div>
      <div className="flex lg:justify-end lg:flex-1">
        <SignedIn>
          <div className="flex gap-2 items-center">
            <NavLink href="/upload">Upload a PDF</NavLink>
            <PlanBadge></PlanBadge>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </SignedIn>

        <SignedOut>
          <NavLink href="/sign-in">Sign In</NavLink>
        </SignedOut>
      </div>
    </nav>
  );
}
