import { Separator } from "@/components/ui/separator";

const Header = () => {
  return (
    <header className="border-b bg-card animate-fade-in">
      <div className="container flex h-16 items-center px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">P5 Loop Studio</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
