import styles from './index.css.tsx';

interface SectionHeaderProps {
  title: string;
}

const SectionHeader = ({ title }: SectionHeaderProps) => {
  return (
    <div style={styles.page}>
      <h2 style={styles.title}>{title}</h2>
    </div>
  );
};

export default SectionHeader;
