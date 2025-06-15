
import { NavLink } from "react-router-dom";
import { Palette, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const Header = () => {
  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      "transition-colors hover:text-primary",
      isActive ? "text-primary font-semibold" : "text-muted-foreground"
    );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <NavLink to="/" className="mr-6 flex items-center space-x-2">
          <Palette className="h-6 w-6" />
          <span className="hidden font-bold sm:inline-block">
            Chroma Palettes
          </span>
        </NavLink>
        <nav className="flex items-center gap-4 text-sm lg:gap-6">
          <NavLink to="/how-to-use" className={linkClasses}>
            <div className="flex items-center gap-2">
              <HelpCircle size={16} />
              <span>Comment utiliser</span>
            </div>
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Header;
