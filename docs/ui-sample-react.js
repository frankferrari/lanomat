import React, { useState, useEffect, useRef } from 'react';
import {
    Trophy,
    Plus,
    RotateCcw,
    Play,
    Trash2,
    Users,
    Tag,
    Gamepad2,
    ChevronUp,
    ChevronDown,
    Settings2,
    Dices,
    LayoutGrid
} from 'lucide-react';

// Sample games data for the UI Demo
const SAMPLE_GAMES = [
    { name: "Counter-Strike 2", genre: "FPS", price: "Free", maxPlayers: 10 },
    { name: "StarCraft II", genre: "RTS", price: "Free", maxPlayers: 8 },
    { name: "Unreal Tournament", genre: "Arena FPS", price: "$9.99", maxPlayers: 16 },
    { name: "Age of Empires II", genre: "RTS", price: "$19.99", maxPlayers: 8 },
    { name: "Left 4 Dead 2", genre: "Co-op FPS", price: "$9.99", maxPlayers: 4 },
    { name: "Warcraft III", genre: "RTS", price: "$29.99", maxPlayers: 12 },
    { name: "Rocket League", genre: "Sports", price: "Free", maxPlayers: 8 },
    { name: "Among Us", genre: "Party", price: "$4.99", maxPlayers: 15 }
].map((g, i) => ({ ...g, id: `sample-${i}`, votes: 0 }));

export default function App() {
    const [games, setGames] = useState(SAMPLE_GAMES);
    const [activeTab, setActiveTab] = useState('vote');
    const [wheelFilter, setWheelFilter] = useState('top5');
    const [selectedGenre, setSelectedGenre] = useState('All');
    const [winner, setWinner] = useState(null);
    const [newGame, setNewGame] = useState({ name: '', genre: '', price: '', maxPlayers: '' });

    // Actions
    const addVote = (gameId, amount) => {
        setGames(prev => prev.map(g =>
            g.id === gameId ? { ...g, votes: Math.max(0, g.votes + amount) } : g
        ));
    };

    const resetVotes = () => {
        if (confirm("Clear all votes for a new round?")) {
            setGames(prev => prev.map(g => ({ ...g, votes: 0 })));
            setWinner(null);
        }
    };

    const handleAddGame = (e) => {
        e.preventDefault();
        if (!newGame.name) return;

        const gameToAdd = {
            id: Date.now(),
            name: newGame.name,
            genre: newGame.genre || 'General',
            price: newGame.price || 'Free',
            maxPlayers: parseInt(newGame.maxPlayers) || 0,
            votes: 0,
            createdAt: Date.now()
        };

        setGames([...games, gameToAdd]);
        setNewGame({ name: '', genre: '', price: '', maxPlayers: '' });
    };

    const deleteGame = (gameId) => {
        if (confirm("Delete this game from the library?")) {
            setGames(prev => prev.filter(g => g.id !== gameId));
        }
    };

    // Derived Data
    const sortedGames = [...games].sort((a, b) => b.votes - a.votes || (a.name > b.name ? 1 : -1));
    const genres = ['All', ...new Set(games.map(g => g.genre))].filter(Boolean);
    const filteredGames = selectedGenre === 'All'
        ? sortedGames
        : sortedGames.filter(g => g.genre === selectedGenre);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500/30 pb-20">
            <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-purple-600 p-2 rounded-lg shadow-lg">
                            <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="font-bold text-xl tracking-tight hidden sm:block">LAN-O-MAT</h1>
                    </div>

                    <nav className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700">
                        {[
                            { id: 'vote', icon: Trophy, label: 'Voting' },
                            { id: 'wheel', icon: Dices, label: 'Decider' },
                            { id: 'manage', icon: Settings2, label: 'Manage' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                <tab.icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={resetVotes}
                            className="p-2 text-slate-400 hover:text-red-400 transition-colors bg-slate-800/50 rounded-lg border border-slate-700"
                            title="Reset All Votes"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-4 sm:p-6">
                {activeTab === 'vote' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <LayoutGrid className="w-6 h-6 text-purple-500" />
                                    Voting Room
                                </h2>
                                <p className="text-slate-400 text-sm">UI Prototype Mode</p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {genres.map(genre => (
                                    <button
                                        key={genre}
                                        onClick={() => setSelectedGenre(genre)}
                                        className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest border transition-all ${selectedGenre === genre ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                                    >
                                        {genre.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredGames.length > 0 ? filteredGames.map((game, index) => {
                                const isOverallWinner = sortedGames[0].id === game.id && game.votes > 0;
                                return (
                                    <div
                                        key={game.id}
                                        className={`relative group bg-slate-900 rounded-2xl border transition-all duration-300 p-5 flex flex-col justify-between ${isOverallWinner ? 'border-yellow-500/50 ring-1 ring-yellow-500/20 shadow-xl' : 'border-slate-800 hover:border-slate-700'}`}
                                    >
                                        {isOverallWinner && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-slate-950 text-[10px] font-black uppercase px-3 py-0.5 rounded-full flex items-center gap-1 shadow-lg z-10">
                                                <Trophy className="w-3 h-3" /> Leading
                                            </div>
                                        )}

                                        <div className="flex justify-between items-start mb-4">
                                            <div className="pr-12">
                                                <h3 className="font-bold text-lg leading-tight group-hover:text-purple-400 transition-colors truncate">{game.name}</h3>
                                                <span className="text-[10px] text-slate-400 font-bold bg-slate-800 px-2 py-0.5 rounded-md uppercase tracking-wider">{game.genre}</span>
                                            </div>
                                            <div className="flex flex-col items-center bg-slate-950 border border-slate-800 p-2 rounded-xl min-w-[54px]">
                                                <button
                                                    onClick={() => addVote(game.id, 1)}
                                                    className="p-1 hover:text-green-400 transition-colors"
                                                >
                                                    <ChevronUp className="w-5 h-5" />
                                                </button>
                                                <span className="text-xl font-black text-white">{game.votes}</span>
                                                <button
                                                    onClick={() => addVote(game.id, -1)}
                                                    className="p-1 hover:text-red-400 transition-colors"
                                                >
                                                    <ChevronDown className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/50 flex items-center gap-2">
                                                <Tag className="w-3.5 h-3.5 text-purple-500" />
                                                <span className="text-xs text-slate-300 truncate">{game.price}</span>
                                            </div>
                                            <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/50 flex items-center gap-2">
                                                <Users className="w-3.5 h-3.5 text-blue-500" />
                                                <span className="text-xs text-slate-300">{game.maxPlayers || '∞'} Max</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="col-span-full py-20 text-center text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl italic">
                                    No games in this category yet.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'wheel' && (
                    <div className="flex flex-col items-center justify-center space-y-8 py-10">
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                                THE DECIDER
                            </h2>
                            <div className="flex justify-center gap-2 bg-slate-900 p-1 rounded-full border border-slate-800">
                                <button
                                    onClick={() => setWheelFilter('top5')}
                                    className={`px-4 py-1 rounded-full text-[10px] font-black tracking-widest transition-all ${wheelFilter === 'top5' ? 'bg-purple-600 text-white' : 'text-slate-500'}`}
                                >
                                    TOP 5 VOTED
                                </button>
                                <button
                                    onClick={() => setWheelFilter('all')}
                                    className={`px-4 py-1 rounded-full text-[10px] font-black tracking-widest transition-all ${wheelFilter === 'all' ? 'bg-purple-600 text-white' : 'text-slate-500'}`}
                                >
                                    ALL GAMES
                                </button>
                            </div>
                        </div>

                        <Wheel
                            games={wheelFilter === 'top5' ? sortedGames.filter(g => g.votes > 0).slice(0, 5) : games}
                            onWinner={setWinner}
                        />

                        {winner && (
                            <div className="bg-slate-900 p-8 rounded-3xl border-2 border-green-500 shadow-2xl text-center max-w-sm w-full animate-in zoom-in duration-300">
                                <p className="text-green-400 text-[10px] font-black uppercase tracking-widest mb-2">Selected Game</p>
                                <h3 className="text-4xl font-black mb-1">{winner.name}</h3>
                                <p className="text-slate-400 text-sm mb-6">{winner.genre} • {winner.maxPlayers} Players</p>
                                <button
                                    onClick={() => setWinner(null)}
                                    className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-black rounded-xl transition-all shadow-lg active:scale-95 uppercase tracking-widest"
                                >
                                    Ready to Rumble
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'manage' && (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold">Game Management</h2>
                                <p className="text-slate-400 text-sm">Global library shared by everyone</p>
                            </div>
                        </div>

                        <form onSubmit={handleAddGame} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div className="space-y-1 sm:col-span-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Title</label>
                                <input required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none transition-all" placeholder="Quake III Arena" value={newGame.name} onChange={e => setNewGame({ ...newGame, name: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Genre</label>
                                <input className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none transition-all" placeholder="Arena FPS" value={newGame.genre} onChange={e => setNewGame({ ...newGame, genre: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Price</label>
                                <input className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none transition-all" placeholder="Free" value={newGame.price} onChange={e => setNewGame({ ...newGame, price: e.target.value })} />
                            </div>
                            <div className="flex items-end gap-2">
                                <div className="space-y-1 flex-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Max Players</label>
                                    <input type="number" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none transition-all" placeholder="16" value={newGame.maxPlayers} onChange={e => setNewGame({ ...newGame, maxPlayers: e.target.value })} />
                                </div>
                                <button type="submit" className="bg-purple-600 hover:bg-purple-500 p-3 rounded-xl shadow-lg">
                                    <Plus className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </form>

                        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-950 text-slate-500 uppercase text-[10px] font-black tracking-widest border-b border-slate-800">
                                        <tr>
                                            <th className="px-6 py-4">Game Title</th>
                                            <th className="px-6 py-4">Genre</th>
                                            <th className="px-6 py-4">Price</th>
                                            <th className="px-6 py-4">Max Players</th>
                                            <th className="px-6 py-4 text-right">Delete</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {games.map(game => (
                                            <tr key={game.id} className="hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4 font-bold text-slate-200">{game.name}</td>
                                                <td className="px-6 py-4"><span className="bg-slate-800 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter">{game.genre}</span></td>
                                                <td className="px-6 py-4 text-slate-400">{game.price}</td>
                                                <td className="px-6 py-4 text-slate-400">{game.maxPlayers}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => deleteGame(game.id)} className="p-2 text-slate-600 hover:text-red-500 transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <footer className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-md border-t border-slate-800 py-4 px-4 z-40">
                <div className="max-w-6xl mx-auto flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-slate-500">
                    <div className="flex gap-6">
                        <span className="flex items-center gap-2"><Gamepad2 className="w-3 h-3 text-purple-500" /> {games.length} Games</span>
                        <span className="flex items-center gap-2"><Dices className="w-3 h-3 text-pink-500" /> {games.reduce((acc, g) => acc + g.votes, 0)} Local Votes</span>
                    </div>
                    <div className="hidden sm:block opacity-50">
                        UI Prototype Mode
                    </div>
                </div>
            </footer>
        </div>
    );
}

function Wheel({ games, onWinner }) {
    const canvasRef = useRef(null);
    const [spinning, setSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);

    const colors = ['#7c3aed', '#db2777', '#2563eb', '#059669', '#d97706', '#dc2626', '#4f46e5', '#0891b2'];

    const drawWheel = () => {
        const canvas = canvasRef.current;
        if (!canvas || games.length === 0) return;
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = canvas.width / 2 - 10;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const sliceAngle = (Math.PI * 2) / games.length;

        games.forEach((game, i) => {
            const angle = i * sliceAngle + rotation;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, angle, angle + sliceAngle);
            ctx.fillStyle = colors[i % colors.length];
            ctx.fill();
            ctx.strokeStyle = '#020617';
            ctx.lineWidth = 4;
            ctx.stroke();

            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(angle + sliceAngle / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = 'white';
            ctx.font = 'black 12px Inter, sans-serif';
            const displayName = game.name.length > 15 ? game.name.substring(0, 12) + '...' : game.name;
            ctx.fillText(displayName.toUpperCase(), radius - 40, 5);
            ctx.restore();
        });

        // Hub
        ctx.beginPath(); ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a'; ctx.fill();
        ctx.strokeStyle = '#7c3aed'; ctx.lineWidth = 4; ctx.stroke();
    };

    useEffect(() => { drawWheel(); }, [games, rotation]);

    const spin = () => {
        if (spinning || games.length === 0) return;
        setSpinning(true);
        onWinner(null);
        const spinDuration = 4000;
        const spinForce = 30 + Math.random() * 20;
        const startTime = performance.now();
        const startRotation = rotation;

        const animate = (time) => {
            const elapsed = time - startTime;
            const progress = Math.min(elapsed / spinDuration, 1);
            const easeOut = (t) => 1 - Math.pow(1 - t, 4);
            const currentRotation = startRotation + (spinForce * easeOut(progress));
            setRotation(currentRotation);
            if (progress < 1) requestAnimationFrame(animate);
            else {
                setSpinning(false);
                const normalizedRotation = currentRotation % (Math.PI * 2);
                const sliceAngle = (Math.PI * 2) / games.length;
                const winningIndex = Math.floor(((Math.PI * 1.5) - normalizedRotation + (Math.PI * 200)) / sliceAngle) % games.length;
                onWinner(games[winningIndex]);
            }
        };
        requestAnimationFrame(animate);
    };

    return (
        <div className="relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-white z-10 filter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
            <div className={`p-4 rounded-full bg-slate-900 border-8 border-slate-800 shadow-2xl transition-all duration-300 ${spinning ? 'scale-105' : ''}`}>
                <canvas ref={canvasRef} width={450} height={450} className="max-w-[85vw] sm:max-w-md h-auto rounded-full" />
                <button
                    onClick={spin}
                    disabled={spinning}
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center text-white shadow-xl disabled:opacity-50 z-20`}
                >
                    {spinning ? <RotateCcw className="w-8 h-8 animate-spin" /> : <Play className="w-8 h-8 ml-1" />}
                </button>
            </div>
        </div>
    );
}