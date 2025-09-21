import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";
import BottomNavbar from "../components/bottomNavbar/BottomNavbar";
import Header from "./Header";
import { AnimatePresence, motion } from "framer-motion";
import ScrollToTop from "../components/scrollToTop/ScrollToTop";
import { useDispatch } from "react-redux";
import { removeInstrumentsFromQuotes } from "../store/slices/quotesSlice";
import useSessionStorage from "../utils/useSessionStorage";

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3 },
};

export type IsFlagType = {
  quotes: {
    add: boolean;
    edit: boolean;
    delete: boolean;
  };
  trades: {
    upDown: boolean;
  };
  drawer: {
    newOrder: boolean;
  };
};

export type OutletContextType = {
  setIsSidebarOpen: (isOpen: boolean) => void;
  isFlag: IsFlagType;
  setIsFlag: React.Dispatch<React.SetStateAction<IsFlagType>>; // ✅ Add this line
  selectedQuotesForDelete: string[];
  setSelectedQuotesForDelete: React.Dispatch<React.SetStateAction<string[]>>;
};

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFlag, setIsFlag] = useSessionStorage("appState", {
    quotes: {
      add: false,
      edit: false,
      delete: false,
    },
    trades: {
      upDown: false,
    },
    drawer: {
      newOrder: false,
    },
  });
  const [selectedQuotesForDelete, setSelectedQuotesForDelete] = useState<
    string[]
  >([]);

  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleOpenSidebar = () => setIsSidebarOpen(true);
    document.addEventListener("openSidebar", handleOpenSidebar);
    return () => document.removeEventListener("openSidebar", handleOpenSidebar);
  }, []);

  const handleDeleteSelected = () => {
    if (selectedQuotesForDelete.length > 0) {
      dispatch(removeInstrumentsFromQuotes(selectedQuotesForDelete));
      setSelectedQuotesForDelete([]);
    }
  };

  // ✅ New variable to check if the current route is the NewOrder page
  const isNewOrderPage = location.pathname.includes("new-order");

  return (
    <div className="min-h-screen flex flex-col relative text-white bg-primaryBg">
      <Header
        isFlag={isFlag}
        setIsFlag={setIsFlag}
        handleDeleteSelected={handleDeleteSelected}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          {...pageVariants}
          className="relative min-h-screen"
        >
          <main
            id="#main-content"
            className="flex-1 py-16 overflow-y-auto bg-primaryBg scroll-smooth"
          >
            <ScrollToTop selector="#main-content" behavior="smooth" />
            <Outlet
              context={{
                setIsSidebarOpen,
                isFlag,
                setIsFlag,
                selectedQuotesForDelete,
                setSelectedQuotesForDelete,
              }}
            />
          </main>
        </motion.div>
      </AnimatePresence>
      {/* ✅ Conditionally render BottomNavbar */}
      {!isNewOrderPage && <BottomNavbar setIsFlag={setIsFlag} />}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </div>
  );
};

export default MainLayout;

// import { useState, useEffect } from "react";
// import { Outlet, useLocation } from "react-router-dom";
// import Sidebar from "../components/sidebar/Sidebar";
// import BottomNavbar from "../components/bottomNavbar/BottomNavbar";
// import Header from "./Header";
// import { AnimatePresence, motion } from "framer-motion";
// import ScrollToTop from "../components/scrollToTop/ScrollToTop";
// import { useDispatch } from "react-redux";
// import { removeInstrumentsFromQuotes } from "../store/slices/quotesSlice";

// const pageVariants = {
//   initial: { opacity: 0, y: 10 },
//   animate: { opacity: 1, y: 0 },
//   exit: { opacity: 0, y: -10 },
//   transition: { duration: 0.3 },
// };

// export type IsFlagType = {
//   quotes: {
//     add: boolean;
//     edit: boolean;
//     delete: boolean;
//   };
//   trades: {
//     upDown: boolean;
//   };
//   drawer: {
//     newOrder: boolean;
//   };
// };

// export type OutletContextType = {
//   setIsSidebarOpen: (isOpen: boolean) => void;
//   isFlag: IsFlagType;
//   selectedQuotesForDelete: string[]; // ✅ should be string array
//   setSelectedQuotesForDelete: React.Dispatch<React.SetStateAction<string[]>>; // ✅ standard setter type
// };

// const MainLayout = () => {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [isFlag, setIsFlag] = useState<IsFlagType>({
//     quotes: {
//       add: false,
//       edit: false,
//       delete: false,
//     },
//     trades: {
//       upDown: false,
//     },
//     drawer: {
//       newOrder: false,
//     },
//   });
//   const [selectedQuotesForDelete, setSelectedQuotesForDelete] = useState<
//     string[]
//   >([]);

//   const location = useLocation();
//   const dispatch = useDispatch();

//   useEffect(() => {
//     const handleOpenSidebar = () => setIsSidebarOpen(true);
//     document.addEventListener("openSidebar", handleOpenSidebar);
//     return () => document.removeEventListener("openSidebar", handleOpenSidebar);
//   }, []);

//   // ✨ NEW: Handler for deleting selected quotes
//   const handleDeleteSelected = () => {
//     if (selectedQuotesForDelete.length > 0) {
//       dispatch(removeInstrumentsFromQuotes(selectedQuotesForDelete));
//       // Clear the selection after dispatching
//       setSelectedQuotesForDelete([]);
//     }
//   };
//   return (
//     <div className="min-h-screen flex flex-col relative text-white bg-primaryBg">
//       {/* Header */}
//       <Header
//         isFlag={isFlag}
//         setIsFlag={setIsFlag}
//         handleDeleteSelected={handleDeleteSelected}
//       />

//       {/* Page Content */}
//       <AnimatePresence mode="wait">
//         <motion.div
//           key={location.pathname}
//           {...pageVariants}
//           className="relative min-h-screen"
//         >
//           {" "}
//           <main
//             id="#main-content"
//             className="flex-1 py-16 overflow-y-auto bg-primaryBg scroll-smooth"
//           >
//             <ScrollToTop selector="#main-content" behavior="smooth" />
//             <Outlet
//               context={{
//                 setIsSidebarOpen,
//                 isFlag,
//                 setIsFlag,
//                 selectedQuotesForDelete,
//                 setSelectedQuotesForDelete,
//               }}
//             />
//           </main>{" "}
//         </motion.div>
//       </AnimatePresence>

//       {/* <main className="flex-1 py-16 overflow-y-auto bg-primaryBg">
//         <Outlet context={{ setIsSidebarOpen, isFlag }} />
//       </main> */}

//       {/* Components */}
//       <BottomNavbar setIsFlag={setIsFlag} />
//       <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
//     </div>
//   );
// };

// export default MainLayout;
