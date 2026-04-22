import styles from "./page.module.scss";

export default function Home() {
  const checklist = [
    "기획서 병합 요구사항 문서 확정",
    "핵심 지표별 API 스펙 정리",
    "위젯별 화면 구조 설계",
    "첫 데이터 연결 우선순위 확정",
  ];

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={styles.badge}>Hackathon Bootstrap</p>
        <h1>Timing Analysis Dashboard</h1>
        <p className={styles.description}>
          Next.js + TypeScript + Sass + PR automation 구성이 완료된 시작 화면입니다.
        </p>
        <ul className={styles.list}>
          {checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
