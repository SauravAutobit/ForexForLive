// import Dropdown from "../dropddown/Dropddown"; // Import the refactored component
// import plus from "../../assets/icons/plus.svg";
// import type { Instrument } from "../../store/slices/instrumentsSlice";
// import { useDispatch } from "react-redux";
// import { addInstrumentToQuotes } from "../../store/slices/quotesSlice";

// interface AddInstrumentDropdownProps {
//   categoryName: string;
//   instruments: Instrument[];
//   addedCount: number;
//   totalCount: number;
// }

// const AddInstrumentDropdown = ({
//   categoryName,
//   instruments,
//   addedCount,
//   totalCount,
// }: AddInstrumentDropdownProps) => {
//   const dispatch = useDispatch();

//   const handleInstrumentClick = (instrument: Instrument) => {
//     dispatch(addInstrumentToQuotes(instrument));
//   };

//   // Map the instruments to the GenericDropdownItem format
//   const formattedInstruments = instruments.map((inst) => ({
//     id: inst.id,
//     name: inst.name.toUpperCase(),
//     subLabel: inst.feeding_name,
//     icon: plus,
//   }));

//   return (
//     <Dropdown
//       label={categoryName}
//       items={formattedInstruments}
//       onItemClick={handleInstrumentClick}
//       addedCount={addedCount}
//       totalCount={totalCount}
//     />
//   );
// };

// export default AddInstrumentDropdown;
