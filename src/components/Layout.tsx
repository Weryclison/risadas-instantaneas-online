
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { useGame } from "@/contexts/GameContext";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentRoom, leaveRoom, isAdmin, adminLogout } = useGame();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-2xl font-bold text-primary">Cartas Contra</Link>
            {currentRoom && (
              <span className="text-sm bg-secondary rounded-full px-3 py-1">
                Sala: {currentRoom.id}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {currentRoom && (
              <button 
                onClick={leaveRoom}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Sair da sala
              </button>
            )}
            {isAdmin && (
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                  Admin
                </span>
                <button 
                  onClick={adminLogout}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Logout
                </button>
              </div>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
      
      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Cartas Contra &copy; 2025 - MVP</p>
          <div className="mt-2 flex justify-center space-x-4">
            <Link to="/faq" className="hover:text-foreground">FAQ</Link>
            <Link to="/feedback" className="hover:text-foreground">Feedback</Link>
            <Link to="/admin" className="hover:text-foreground">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
