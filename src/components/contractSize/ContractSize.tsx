import { useState, useEffect } from "react";


interface ContractSizeProps {
  contractSize: number;
  onLotChange: (lot: number) => void;
}

const ContractSize = ({ contractSize, onLotChange }: ContractSizeProps) => {
  const [selectedLot, setSelectedLot] = useState(0.01);

  const baseLot = 0.01;

  const handleLotChange = (change: number) => {
    const newLot = selectedLot + change;
    if (newLot >= baseLot) {
      const finalLot = parseFloat(newLot.toFixed(2));
      setSelectedLot(finalLot);
     
      onLotChange(finalLot);
    }
  };

  const isButtonDisabled = (change: number) => {
    const newLot = selectedLot + change;
    return newLot < baseLot;
  };

  const calculatedQuantity = selectedLot * contractSize;

  useEffect(() => {
    console.log("Calculated quantity for API:", calculatedQuantity);
  }, [calculatedQuantity]);

  return (
    <div className="my-5">
      <ul className="flex justify-between border-b border-tertiary rounded-10 pb-2.5">
        <li className="text-sm">
          <button
            className={`
              ${
                isButtonDisabled(-0.5)
                  ? "text-gray-500 cursor-not-allowed"
                  : "text-white"
              }
            `}
            onClick={() => handleLotChange(-0.5)}
            disabled={isButtonDisabled(-0.5)}
          >
            -0.5
          </button>
        </li>
        <li className="text-sm">
          <button
            className={`
              ${
                isButtonDisabled(-0.1)
                  ? "text-gray-500 cursor-not-allowed"
                  : "text-white"
              }
            `}
            onClick={() => handleLotChange(-0.1)}
            disabled={isButtonDisabled(-0.1)}
          >
            -0.1
          </button>
        </li>
        <li className="text-sm">
          <button
            className={`
              ${
                isButtonDisabled(-0.01)
                  ? "text-gray-500 cursor-not-allowed"
                  : "text-white"
              }
            `}
            onClick={() => handleLotChange(-0.01)}
            disabled={isButtonDisabled(-0.01)}
          >
            -0.01
          </button>
        </li>
          <li className="font-secondary">{selectedLot.toFixed(2)}</li>
        <li className="text-sm">
          <button className="text-white" onClick={() => handleLotChange(0.01)}>
            +0.01
          </button>
        </li>
        <li className="text-sm">
          <button className="text-white" onClick={() => handleLotChange(0.1)}>
            +0.1
          </button>
        </li>
        <li className="text-sm">
          <button className="text-white" onClick={() => handleLotChange(0.5)}>
            +0.5
          </button>
        </li>
      </ul>
    </div>
  );
};

export default ContractSize;
