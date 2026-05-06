import styles from "./TableSelector.module.css";

type TableSelectorProps = {
  current: "EU" | "US";
  onSelect: (value: "EU" | "US") => void;
};

export const TableSelector = ({ current, onSelect }: TableSelectorProps) => {
  return (
    <div className={styles.wrapper}>
      <button
        className={`${styles.option} ${current === "EU" ? styles.active : ""}`}
        onClick={() => onSelect("EU")}
      >
        European
      </button>

      <button
        className={`${styles.option} ${current === "US" ? styles.active : ""}`}
        onClick={() => onSelect("US")}
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
