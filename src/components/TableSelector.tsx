import styles from "./TableSelector.module.css";

type TableSelectorProps = {
  current: "EU" | "US";
  onSelect: (value: "EU" | "US") => void;
  isSpinning: boolean;
};

export const TableSelector = ({
  current,
  onSelect,
  isSpinning,
}: TableSelectorProps) => {
  return (
    <div className={styles.wrapper}>
      <button
        className={`${styles.option} ${current === "EU" ? styles.active : ""}`}
        onClick={() => onSelect("EU")}
        disabled={isSpinning}
      >
        European
      </button>

      <button
        className={`${styles.option} ${current === "US" ? styles.active : ""}`}
        onClick={() => onSelect("US")}
        disabled={isSpinning}
      >
        American
      </button>

      <button
        className={styles.option}
        disabled // grey out and block clicks
      >
        Custom (soon)
      </button>
    </div>
  );
};
