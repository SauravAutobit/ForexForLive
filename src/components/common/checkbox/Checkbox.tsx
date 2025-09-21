import "./Checkbox.css";

interface CheckboxProps {
  checked: boolean;
  onChange: (isChecked: boolean) => void;
  // label?: string;
}

const Checkbox = ({ checked, onChange }: CheckboxProps) => {
  return (
    <>
      <div
        className={`custom-checkbox-wrapper ${checked ? "checked" : ""}`}
        onClick={() => onChange(!checked)}
      >
        <div className="custom-checkbox-box" />
        {/* Optional checkmark element */}
        {checked && <div className="custom-checkbox-checkmark">✔</div>}
      </div>
    </>
  );
};

export default Checkbox;
