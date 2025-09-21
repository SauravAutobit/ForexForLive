import { Check, ChevronLeft, Edit, Menu, Plus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import upDownArrow from "../assets/icons/upDownArrow.svg";
import tradeEdit from "../assets/icons/tradeEdit.svg";
import { type Dispatch, type SetStateAction } from "react";
import type { IsFlagType } from "./MainLayout";
import deleteIcon from "../assets/icons/deleteIcon.svg";
import pinkDelete from "../assets/icons/pinkDelete.svg";
import { motion, AnimatePresence } from "framer-motion";
// import TradeOption from "../components/tradeOption/TradeOption"; // adjust path

// import blueTick from "../assets/icons/blueTick.svg";

type HeaderProps = {
  isFlag: IsFlagType;
  setIsFlag: Dispatch<SetStateAction<IsFlagType>>;
  handleDeleteSelected: () => void;
};

export default function Header({
  isFlag,
  setIsFlag,
  handleDeleteSelected,
}: HeaderProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const conditionalRender = () => {
    let title = "";
    let actions = null;
    const tradeAmount = "-21.34 USD";

    if (isFlag?.quotes?.add) {
      title = "Add Symbol";
      actions = null;
    } else if (isFlag?.quotes?.edit) {
      title = "Selected Symbol";
      actions = (
        <>
          <Plus
            size={16}
            onClick={() =>
              setIsFlag((prev: IsFlagType) => ({
                ...prev,
                quotes: {
                  add: true,
                  edit: false,
                  delete: false,
                },
              }))
            }
          />
          <img
            src={deleteIcon}
            alt="delete"
            onClick={() =>
              setIsFlag((prev: IsFlagType) => ({
                ...prev,
                quotes: {
                  add: false,
                  edit: false,
                  delete: true,
                },
              }))
            }
          />
        </>
      );
    } else if (isFlag?.quotes?.delete) {
      title = "Confirm";
      actions = (
        <>
          <Plus
            size={16}
            onClick={() =>
              setIsFlag((prev: IsFlagType) => ({
                ...prev,
                quotes: {
                  add: true,
                  edit: false,
                  delete: false,
                },
              }))
            }
          />
          <img
            src={pinkDelete}
            alt="pinkDelete"
            className="text-[#E34C67] cursor-pointer"
            onClick={() =>
              setIsFlag((prev: IsFlagType) => ({
                ...prev,
                quotes: {
                  add: false,
                  edit: false,
                  delete: true,
                },
              }))
            }
          />
        </>
      );
    } else if (isFlag?.drawer?.newOrder) {
      title = "New Order";
      actions = null;
    } else {
      switch (pathname) {
        case "/":
        case "/history":
          title = pathname === "/" ? "Quotes" : "History";
          actions = (
            <>
              <Plus
                size={16}
                onClick={() => {
                  if (pathname !== "/history") {
                    setIsFlag((prev: IsFlagType) => ({
                      ...prev,
                      quotes: {
                        add: true,
                        edit: false,
                        delete: false,
                      },
                    }));
                  }
                }}
              />
              <Edit
                size={16}
                onClick={() => {
                  if (pathname !== "/history") {
                    setIsFlag((prev: IsFlagType) => ({
                      ...prev,
                      quotes: {
                        add: false,
                        edit: true,
                        delete: false,
                      },
                    }));
                  }
                }}
              />
            </>
          );
          break;

        case "/charts":
          title = "Charts";
          actions = (
            <>
              <img src={upDownArrow} alt="upDownArrow" />
              <img src={tradeEdit} alt="tradeEdit" />
            </>
          );
          break;

        case "/trade":
          title = "Trades";
          actions = (
            <>
              <img
                src={upDownArrow}
                alt="upDownArrow"
                onClick={() =>
                  setIsFlag((prev) => ({
                    ...prev,
                    trades: { upDown: !prev.trades.upDown },
                  }))
                }
              />
              <img src={tradeEdit} alt="tradeEdit" />
            </>
          );
          break;

        case "/profile":
          title = "Profile";
          actions = (
            <>
              <img src={upDownArrow} alt="upDownArrow" />
              <img src={tradeEdit} alt="tradeEdit" />
            </>
          );
          break;

        default:
          return null;
      }
    }

    return (
      // <>
      //   <div
      //     className={`text-xl font-secondary flex-1 ${
      //       isFlag?.quotes?.add ||
      //       isFlag?.quotes?.edit ||
      //       isFlag?.quotes?.delete
      //         ? "text-left"
      //         : "text-center"
      //     } ${isFlag?.quotes?.delete ? "text-tertiary" : ""}`}
      //   >
      //     {title}
      //   </div>
      //   {pathname === "/trade" && (
      //     <div className="text-loss font-secondary text-center mt-4">
      //       {tradeAmount}
      //     </div>
      //   )}
      //   {(!isFlag?.quotes?.add || !isFlag?.quotes?.edit) && (
      //     <div className="flex gap-4">{actions}</div>
      //   )}
      // </>
      <>
        <div
          className={`text-xl font-secondary flex-1 flex flex-col  ${
            isFlag?.quotes?.add ||
            isFlag?.quotes?.edit ||
            isFlag?.quotes?.delete ||
            isFlag?.drawer?.newOrder
              ? "text-left"
              : "text-center"
          } ${isFlag?.quotes?.delete ? "text-tertiary" : ""}`}
        >
          <span>{title}</span>
          {pathname === "/trade" && (
            <span className="text-loss font-secondary text-base">
              {tradeAmount}
            </span>
          )}
        </div>
        {(!isFlag?.quotes?.add || !isFlag?.quotes?.edit) && (
          <div className="flex gap-4">{actions}</div>
        )}
      </>
    );
  };

  return (
    <header className="flex items-center fixed top-0 left-0 right-0 z-40 bg-primaryBg justify-between py-2 px-4 max-w-[390px] mx-auto">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={
            // this key should change whenever the button changes
            isFlag?.quotes?.delete
              ? "deleteBtn"
              : isFlag?.quotes?.add || isFlag?.quotes?.edit
              ? "backBtn"
              : "menuBtn"
          }
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          {isFlag?.quotes?.delete === true ? (
            <button
              aria-label="Open menu"
              className="p-2 rounded hover:bg-gray-900"
            >
              <Check
                color="#6184D8"
                onClick={() => {
                  handleDeleteSelected();
                  setIsFlag((prev: IsFlagType) => ({
                    ...prev,
                    quotes: { add: false, edit: false, delete: false },
                    trades: { upDown: false },
                  }));
                }}
              />
            </button>
          ) : isFlag?.quotes?.add === false &&
            isFlag?.quotes?.edit === false &&
            isFlag?.drawer?.newOrder == false ? (
            <button
              aria-label="Open menu"
              onClick={() =>
                document.dispatchEvent(new CustomEvent("openSidebar"))
              }
              className="p-2 rounded hover:bg-gray-900"
            >
              <Menu size={24} />
            </button>
          ) : (
            <button
              aria-label="Open menu"
              className="p-2 rounded hover:bg-gray-900"
            >
              <ChevronLeft
                size={24}
                onClick={() => {
                  navigate("/");
                  setIsFlag((prev: IsFlagType) => ({
                    ...prev,
                    quotes: { add: false, edit: false, delete: false },
                    trades: { upDown: false },
                    drawer: { newOrder: false },
                  }));
                }}
              />
            </button>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={JSON.stringify(isFlag) + pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="flex flex-1 justify-between items-center"
        >
          {conditionalRender()}
        </motion.div>
      </AnimatePresence>

      {/* <TradeOption
        isOpen={Boolean(isFlag?.trades?.upDown)}
        onClose={() =>
          setIsFlag((prev) => ({ ...prev, trades: { upDown: false } }))
        }
      /> */}
    </header>
  );
}
