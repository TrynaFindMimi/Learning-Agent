import React, { useMemo, useState } from "react";
import { Card, Typography, Row, Col, Button } from "antd";

/** ---------- Utilidades de mock ---------- */
const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomDateWithinDays = (daysBack = 60) => {
  const now = new Date();
  const past = new Date(now);
  past.setDate(now.getDate() - randInt(0, daysBack));
  return past;
};

const formatDate = (d: Date) =>
  d.toLocaleDateString("es-BO", { year: "numeric", month: "2-digit", day: "2-digit" });

type Subject = {
  id: string;
  name: string;
  scores: number[];       // historial para sparkline (0–100)
  lastScore: number;      // último puntaje
  lastExamDate: Date;     // fecha último examen
  successRate: number;    // % >= 60
};

const makeSubject = (name: string): Subject => {
  const length = randInt(5, 8);
  const scores = Array.from({ length }, () => randInt(20, 100));
  const lastScore = scores[scores.length - 1];
  const passes = scores.filter((s) => s >= 60).length;
  const successRate = Math.round((passes / scores.length) * 100);
  return {
    id: crypto.randomUUID(),
    name,
    scores,
    lastScore,
    lastExamDate: randomDateWithinDays(),
    successRate,
  };
};

/** ---------- Sparkline (SVG livianito) ---------- */
const Sparkline: React.FC<{ data: number[]; width?: number; height?: number }> = ({
  data,
  width = 140,
  height = 90,
}) => {
  const padding = 8;
  const W = width - padding * 2;
  const H = height - padding * 2;
  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * W;
    const y = padding + (1 - v / 100) * H; // escala 0–100
    return [x, y] as const;
  });
  const path = points.map(([x, y], i) => (i ? `L${x},${y}` : `M${x},${y}`)).join(" ");

  return (
    <svg width={width} height={height} className="rounded-md border border-purple-400">
      <path d={path} fill="none" stroke="#1A2A80" strokeWidth={2} />
      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3} fill="#1A2A80" />
      ))}
    </svg>
  );
};

/** ---------- Card por materia ---------- */
const SubjectCard: React.FC<{
  subject: Subject;
  onSimulate: (id: string) => void;
}> = ({ subject, onSimulate }) => {
  return (
    <Card className="border-none rounded-2xl shadow-lg p-4 bg-white h-full">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <Typography.Title level={4} className="!text-[#1A2A80] !mb-2">
            {subject.name}
          </Typography.Title>
          <ul className="text-gray-700 text-base leading-7">
            <li>
              <span className="font-medium">Último puntaje:</span> {subject.lastScore}
            </li>
            <li>
              <span className="font-medium">Fecha último examen:</span>{" "}
              {formatDate(subject.lastExamDate)}
            </li>
            <li>
              <span className="font-medium">Tasa de éxito:</span> {subject.successRate}%
            </li>
          </ul>

          <Button
            size="small"
            className="mt-3 !bg-[#1A2A80] !text-white !rounded-xl"
            onClick={() => onSimulate(subject.id)}
          >
            Simular examen
          </Button>
        </div>

        <div className="shrink-0">
          <Sparkline data={subject.scores} />
        </div>
      </div>
    </Card>
  );
};

/** ---------- Grid de materias (colócalo debajo de “Sílabo” y “Documentos”) ---------- */
export const ProgressCard: React.FC = () => {
  const initialSubjects = useMemo(
    () =>
      [
        "Matemáticas",
        "Programación",
        "Bases de Datos"
      ].map(makeSubject),
    []
  );

  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);

  const simulateExam = (id: string) => {
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const newScore = randInt(20, 100);
        const newScores = [...s.scores.slice(-7), newScore]; // mantenemos último historial corto
        const passes = newScores.filter((v) => v >= 60).length;
        return {
          ...s,
          scores: newScores,
          lastScore: newScore,
          lastExamDate: new Date(),
          successRate: Math.round((passes / newScores.length) * 100),
        };
      })
    );
  };

  const regenerateAll = () => {
    setSubjects((_) => initialSubjects.map((n) => makeSubject(n.name)));
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <Typography.Title level={3} className="!text-[#1A2A80] !mb-0">
          Progreso por materia
        </Typography.Title>
        <Button onClick={regenerateAll} className="!rounded-xl">
          Generar nuevos datos
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {subjects.map((subject) => (
          <Col key={subject.id} xs={24} sm={24} md={12} lg={12} xl={12}>
            <SubjectCard subject={subject} onSimulate={simulateExam} />
          </Col>
        ))}
      </Row>
    </div>
  );
};
