import { useState } from "react";
import StartScreen from "./components/StartScreen";
import Game from "./components/Game";
import ScoreScreen from "./components/ScoreScreen";
import type { Settings } from "./components/SettingsPanel";
import type { GraphNode, GraphEdge, GamePhase } from "./types";

interface GameResult {
    nodes: GraphNode[];
    edges: GraphEdge[];
    longestStreak: number;
    timeSurvived: number;
    score: number;
}

const DEFAULT_SETTINGS: Settings = {
    contentMode: 'movies',
    streakEnabled: true,
    baseTime: 45,
    maxTimeEnabled: false,
    maxTime: 120,
}

export default function App() {
    const [phase, setPhase] = useState<GamePhase>("start");
    const [gameKey, setGameKey] = useState(0);
    const [result, setResult] = useState<GameResult | null>(null);
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

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

    function handleMainMenu() {
        setResult(null);
        setPhase("start");
    }

    if (phase === "start") return <div className="animate-fade-in w-full h-full"><StartScreen settings={settings} onSettingsChange={setSettings} onStart={handleStart} /></div>;

    if (phase === "playing") return <div className="animate-fade-in w-full h-full"><Game key={gameKey} settings={settings} onEnd={handleEnd} /></div>;

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
                onMainMenu={handleMainMenu}
            />
        </div>
    );
}
