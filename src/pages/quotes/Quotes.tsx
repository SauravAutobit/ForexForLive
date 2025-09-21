import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

import SearchBar from "../../components/common/searchbar/SearchBar";
import BottomDrawer from "../../components/common/drawer/BottomDrawer";
import Dropddown from "../../components/dropddown/Dropddown";
import type { IsFlagType, OutletContextType } from "../../layout/MainLayout";
// import QuotesList from "../quoteslist/QuotesList";
import Card from "../../components/common/card/Card";
import Checkbox from "../../components/common/checkbox/Checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import { fetchCategories } from "../../store/slices/categoriesSlice";
import {
  fetchInstrumentsByCategory,
  type Instrument,
} from "../../store/slices/instrumentsSlice";
import { selectQuotes, type QuoteData } from "../../store/slices/quotesSlice";
import QuoteCard from "./QuoteCard";
import QuotesList from "../quoteslist/QuotesList";
import { setSelectedInstrument } from "../../store/slices/instrumentsSlice";

const menuItems = [
  { label: "New Order", path: "/new-order" },
  { label: "Chart", path: "/charts" },
  { label: "Properties", path: "/properties" },
  { label: "Depth Of Market", path: "/depth-of-market" },
  { label: "Market Statistics", path: "/market-statistics" },
];

const Quotes = () => {
  const {
    isFlag,
    selectedQuotesForDelete,
    setSelectedQuotesForDelete,
    setIsFlag,
  } = useOutletContext<OutletContextType>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate(); // ✅ INITIALIZE useNavigate
  // const instruments = useSelector((state: RootState) => state.instruments.data);

  // const [quotes, setQuotes] = useState<QuoteData[]>([]);
  console.log("isFlag", isFlag);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<QuoteData | null>(null);
  const [searchTerm, setSearchTerm] = useState(""); // ✅ State for the search input
  // console.log("selectedCard", selectedCard);
  // Get the websocket status from the store
  const apiStatus = useSelector(
    (state: RootState) => state.websockets.apiStatus
  );

  // Get the categories state from the store
  const { data: categories, status: categoriesStatus } = useSelector(
    (state: RootState) => state.categories
  );
  // const instrumentsState = useSelector((state: RootState) => state.instruments);

  const { data: instrumentsData, status: instrumentsStatus } = useSelector(
    (state: RootState) => state.instruments
  );

  const activeQuotes = useSelector(selectQuotes);

  // console.log("dropdown", categories, instrumentsData);
  // Fetch categories when the API WebSocket is connected
  useEffect(() => {
    if (apiStatus === "connected" && categoriesStatus === "idle") {
      dispatch(fetchCategories());
    }
  }, [apiStatus, categoriesStatus, dispatch]);

  // ✅ NEW: Effect to pre-load all instruments once categories are fetched
  useEffect(() => {
    if (categoriesStatus === "succeeded" && categories.length > 0) {
      categories.forEach((category) => {
        // Fetch only if not already present
        if (!instrumentsData[category]) {
          dispatch(fetchInstrumentsByCategory(category));
        }
      });
    }
  }, [categories, categoriesStatus, instrumentsData, dispatch]);

  const canAdd = Boolean(isFlag?.quotes?.add);
  const canEdit = Boolean(isFlag?.quotes?.edit);
  const canDelete = Boolean(isFlag?.quotes?.delete);

  // Memoize a Set of active quote IDs for efficient lookup
  const activeQuoteIds = useMemo(
    () => new Set(activeQuotes.map((q) => q.id)),
    [activeQuotes]
  );

  // ✅ NEW: Memoized logic to filter categories based on the search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) {
      return categories.filter((category) => {
        const instrumentsForCategory = instrumentsData[category] || [];
        const availableInstruments = instrumentsForCategory.filter(
          (instrument) => !activeQuoteIds.has(instrument.id)
        );
        return availableInstruments.length > 0;
      });
    }

    const lowercasedFilter = searchTerm.toLowerCase();
    return categories.filter((category) => {
      const instrumentsForCategory = instrumentsData[category] || [];
      return instrumentsForCategory.some(
        (instrument) =>
          (instrument.name.toLowerCase().includes(lowercasedFilter) ||
            instrument.feeding_name.toLowerCase().includes(lowercasedFilter)) && // AND check if the instrument has not been added yet
          !activeQuoteIds.has(instrument.id)
      );
    });
  }, [searchTerm, categories, instrumentsData, activeQuoteIds]);

  // ✅ NEW: Memoized object to hold the filtered instruments for each category
  const filteredInstrumentsData = useMemo(() => {
    const result: Record<string, Instrument[]> = {};
    const lowercasedFilter = searchTerm.toLowerCase();

    for (const category of filteredCategories) {
      const instrumentsForCategory = instrumentsData[category] || []; // Filter out already added instruments
      const notAddedInstruments = instrumentsForCategory.filter(
        (inst) => !activeQuoteIds.has(inst.id)
      ); // Apply the search term filter

      const searchedInstruments = notAddedInstruments.filter(
        (inst) =>
          inst.name.toLowerCase().includes(lowercasedFilter) ||
          inst.feeding_name.toLowerCase().includes(lowercasedFilter)
      );

      result[category] = searchedInstruments;
    }
    return result;
  }, [filteredCategories, instrumentsData, searchTerm, activeQuoteIds]);

  // handlers
  const handleCardClick = useCallback((item: QuoteData) => {
    setSelectedCard(item);
    setIsDrawerOpen(true);
  }, []);

  const toggleQuoteSelectionForDelete = useCallback(
    (quoteId: string) => {
      setSelectedQuotesForDelete((prev) =>
        prev.includes(quoteId)
          ? prev.filter((id) => id !== quoteId)
          : [...prev, quoteId]
      );
    },
    [setSelectedQuotesForDelete]
  );

  // render heavy lists only when dependencies change
  console.log("activeQuotes", activeQuotes);

  const cardGrid = useMemo(
    () => (
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 gap-4 py-2 px-4">
        {activeQuotes.map((item: QuoteData) => (
          <QuoteCard
            onClick={() => handleCardClick(item)}
            key={item.id}
            code={item.name}
            // Pass the live data directly
            bid={item.bid}
            ask={item.ask}
            high={item.high}
            low={item.low}
            ltp={item.ltp}
            close={item.close} // ✅ FIX: Pass the 'close' prop
            pip={item.static_data?.pip}
            // Format the timestamp here
            timestamp={
              item.timestamp
                ? new Date(item.timestamp).toLocaleTimeString()
                : "..."
            }
          />
        ))}
      </div>
    ),
    [activeQuotes, handleCardClick]
  );

  const deleteList = useMemo(
    () => (
      <div className="p-4 rounded">
        <ul className="mt-2 space-y-2">
          {/* ✅ Use `activeQuotes` from Redux */}
          {activeQuotes.map((q) => (
            <li key={q.id}>
              <div className="flex items-center gap-2 justify-between">
                <Card className="bg-secondaryBg text-white rounded-xl w-full p-[10px] shadow-lg">
                  <h2 className="text-lg font-semibold text-white">{q.name}</h2>
                  <p className="text-gray-400 text-sm font-medium">
                    {q.trading_name}
                  </p>
                </Card>
                <Checkbox
                  checked={selectedQuotesForDelete.includes(q.id)}
                  onChange={() => toggleQuoteSelectionForDelete(q.id)}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    ),
    [activeQuotes, selectedQuotesForDelete, toggleQuoteSelectionForDelete]
  );

  const slideIn = {
    initial: { x: 40, opacity: 0 }, // start slightly to the right
    animate: { x: 0, opacity: 1 }, // slide into place
    exit: { x: 40, opacity: 0 }, // slide back out
    transition: { duration: 0.3 },
  };

  useEffect(() => {
    const el = document.querySelector<HTMLElement>("#main-content");
    if (el) {
      el.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [canAdd, canEdit, canDelete]); // runs whenever mode toggles

  // ✅ NEW: Handler to navigate and close the drawer
  const handleMenuItemClick = (path: string) => {
    if (path === "/new-order") {
      setIsFlag((prev: IsFlagType) => ({
        ...prev,
        drawer: {
          newOrder: true,
        },
      }));
    }

    setIsDrawerOpen(false);

    // Only dispatch and navigate if a card is selected and a valid path exists
    if (selectedCard) {
      // Set the selected instrument in Redux
      dispatch(setSelectedInstrument(selectedCard.id));
    }

    navigate(path);
  };

  console.log("new order", categories, categoriesStatus);

  console.log("filteredCategories", filteredCategories);

  return (
    <div>
      {/* container to allow absolute overlay during transition (avoids layout flashes) */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {canAdd ? (
            <motion.div key="addMode" {...slideIn} layout>
              <div className="px-4">
                <SearchBar
                  placeholder="Find Symbol"
                  delay={300} // Debounce for performance
                  onChange={(value: string) => setSearchTerm(value)}
                />

                {categoriesStatus === "succeeded" &&
                  categories.map((category) => {
                    const categoryInstruments = instrumentsData[category] || []; // Now use the pre-filtered list
                    const instruments = filteredInstrumentsData[category] || [];

                    const addedCount = categoryInstruments.filter((inst) =>
                      activeQuoteIds.has(inst.id)
                    ).length;
                    return (
                      <Dropddown
                        key={category}
                        categoryName={category}
                        instruments={instruments}
                        addedCount={addedCount}
                        totalCount={categoryInstruments.length}
                      />
                    );
                  })}
                {/* Show a loading indicator for instruments */}
                {categoriesStatus === "succeeded" &&
                  instrumentsStatus === "loading" && (
                    <p className="text-gray-400 text-center mt-4">
                      Loading instruments...
                    </p>
                  )}
              </div>
            </motion.div>
          ) : canDelete ? (
            <motion.div key="deleteMode" {...slideIn} layout>
              {deleteList}
            </motion.div>
          ) : // canDelete && selectedQuotesForDelete.length > 0 ? (
          //   <motion.div
          //     className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-20"
          //     initial={{ y: 100, opacity: 0 }}
          //     animate={{ y: 0, opacity: 1 }}
          //     exit={{ y: 100, opacity: 0 }}
          //   >
          //     <button
          //       onClick={handleDeleteSelected}
          //       className="w-full bg-loss text-white font-bold py-3 px-4 rounded-lg shadow-lg"
          //     >
          //       Delete Selected ({selectedQuotesForDelete.length})
          //     </button>
          //   </motion.div>
          // )
          canEdit ? (
            <motion.div key="editMode" {...slideIn} layout>
              <div className="grid grid-cols-1 gap-4 py-4 px-4">
                <QuotesList quotes={activeQuotes} />
              </div>
            </motion.div>
          ) : (
            <motion.div key="normalMode" {...slideIn} layout>
              {cardGrid}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* <AnimatePresence>
        {canDelete && selectedQuotesForDelete.length > 0 && (
          <motion.div
            className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-20"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
          >
            <button
              onClick={handleDeleteSelected}
              className="w-full bg-loss text-white font-bold py-3 px-4 rounded-lg shadow-lg"
            >
              Delete Selected ({selectedQuotesForDelete.length})
            </button>
          </motion.div>
        )}
      </AnimatePresence> */}

      {/* Drawer unchanged */}
      <BottomDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        {selectedCard && (
          <div className="flex flex-col pt-6">
            <h2 className="text-lg font-baseline justify-center mb-4 opacity-45">
              EURUSD: EURO vs USD
            </h2>
            <ul className="flex flex-col gap-6 justify-center items-start">
              {menuItems.map((item, index) => (
                <li key={index} className="w-full">
                  <button
                    onClick={() => handleMenuItemClick(item.path)}
                    className="w-full text-left text-gray-200 hover:text-white"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </BottomDrawer>
    </div>
  );
};

export default Quotes;
