import { useState } from "react";
import StartScreen from "./components/StartScreen";
import Game from "./components/Game";
import ScoreScreen from "./components/ScoreScreen";
import type { GraphNode, GraphEdge, GamePhase } from "./types";

interface GameResult {
    nodes: GraphNode[];
    edges: GraphEdge[];
    longestStreak: number;
    timeSurvived: number;
    score: number;
}

export default function App() {
    const [phase, setPhase] = useState<GamePhase>("start");
    const [gameKey, setGameKey] = useState(0);
    const [result, setResult] = useState<GameResult | null>(null);

    function handleStart() {
        setPhase("playing");
    }

    function handleEnd(
        nodes: GraphNode[],
        edges: GraphEdge[],
        longestStreak: number,
        timeSurvived: number,
        score: number,
    ) {
        setResult({ nodes, edges, longestStreak, timeSurvived, score });
        setPhase("over");
    }

    function handleRestart() {
        setResult(null);
        setGameKey((k) => k + 1);
        setPhase("playing");
    }

    if (phase === "start") return <div className="animate-fade-in w-full h-full"><StartScreen onStart={handleStart} /></div>;

    if (phase === "playing") return <div className="animate-fade-in w-full h-full"><Game key={gameKey} onEnd={handleEnd} /></div>;

    if (!result) return null;

    return (
        <div className="animate-fade-in w-full h-full">
            <ScoreScreen
                nodes={result.nodes}
                edges={result.edges}
                longestStreak={result.longestStreak}
                timeSurvived={result.timeSurvived}
                score={result.score}
                onRestart={handleRestart}
            />
        </div>
    );
}
