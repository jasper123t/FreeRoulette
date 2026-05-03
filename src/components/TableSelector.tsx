import styles from './TableSelector.module.css';

type TableSelectorProps = {
  current: number;
  onSelect: (value: number) => void;
};

export const TableSelector = ({ current, onSelect }: TableSelectorProps) => {
  return (
    <div className={styles.wrapper}>
      <button 
        className={`${styles.option} ${current === 0 ? styles.active : ''}`}
        onClick={() => onSelect(0)}
      >
        European
      </button>
      
      <button 
        className={`${styles.option} ${current === 1 ? styles.active : ''}`}
        onClick={() => onSelect(1)}
      >
        American
      </button>

      <button 
        className={styles.option} 
        disabled // This greys it out and blocks clicks
      >
        Custom (soon)
      </button>
    </div>
  );
};
