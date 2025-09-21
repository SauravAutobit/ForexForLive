import { NavLink } from "react-router-dom";
import { Home, BarChart2, Activity, Clock, User } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { IsFlagType } from "../../layout/MainLayout";

const navLinks = [
  { to: "/", label: "Quotes", Icon: Home },
  { to: "/charts", label: "Charts", Icon: BarChart2 },
  { to: "/trade", label: "Trade", Icon: Activity },
  { to: "/history", label: "History", Icon: Clock },
  { to: "/profile", label: "Profile", Icon: User },
];

interface BottomNavbarProps {
  setIsFlag: Dispatch<SetStateAction<IsFlagType>>;
}
export default function BottomNavbar({ setIsFlag }: BottomNavbarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-primaryBg border-gray-800 p-2 max-w-[390px] mx-auto">
      <div className="max-w-2xl mx-auto flex justify-between">
        {navLinks.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center text-xs py-1 px-2 ${
                isActive ? "text-white" : "text-gray-700"
              }`
            }
            onClick={() =>
              setIsFlag((prev: IsFlagType) => ({
                ...prev,
                quotes: {
                  add: false,
                  edit: false,
                  delete: false,
                },
                drawer: {
                  newOrder: false,
                },
              }))
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
