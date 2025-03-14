import { Separator } from "@/components/ui/separator";

const Header = () => {
  return (
    <header className="border-b bg-card animate-fade-in">
      <div className="container flex h-16 items-center px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">P5 Loop Studio</h1>
          <Separator orientation="vertical" className="h-6" />
          <p className="text-sm text-muted-foreground">
            Редактируйте анимацию и запустите <code>node render-video.cjs</code> для рендеринга видео
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
