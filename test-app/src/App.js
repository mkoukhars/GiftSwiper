import { useState, useEffect, useRef } from "react";

export default function GiftSwiper() {
  const [currentCard, setCurrentCard] = useState(1);
  const [recommendations, setRecommendations] = useState([]);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);

  const startPosRef = useRef({ x: 0, y: 0 });

  /* -------------------- Storage -------------------- */

  useEffect(() => {
    const saved = localStorage.getItem("giftRecommendations");
    if (!saved) return;

    try {
      const { recommendations = [], currentCard = 1 } = JSON.parse(saved);
      setRecommendations(recommendations);
      setCurrentCard(currentCard);
    } catch {
      console.error("Failed to load");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "giftRecommendations",
      JSON.stringify({ recommendations, currentCard })
    );
  }, [recommendations, currentCard]);

  /* -------------------- Swipe -------------------- */

  const handleSwipe = (direction) => {
    setSwipeDirection(direction);

    setTimeout(() => {
      if (direction === "right") {
        setRecommendations((prev) => [...prev, currentCard]);
      }
      setCurrentCard((prev) => prev + 1);
      setSwipeDirection(null);
      setDragOffset({ x: 0, y: 0 });
    }, 300);
  };

  /* -------------------- Pointer Events -------------------- */

  const handlePointerDown = (e) => {
    setIsDragging(true);
    startPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;

    setDragOffset({
      x: e.clientX - startPosRef.current.x,
      y: e.clientY - startPosRef.current.y,
    });
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragOffset.x > 100) handleSwipe("right");
    else if (dragOffset.x < -100) handleSwipe("left");
    else setDragOffset({ x: 0, y: 0 });
  };

  /* -------------------- Random -------------------- */

  const removeRecommendation = (cardNumber) =>
    setRecommendations((prev) => prev.filter((n) => n !== cardNumber));

  const clearAll = () =>
    window.confirm("Clear all recommendations?") &&
    setRecommendations([]);

  const rotation = isDragging ? dragOffset.x / 20 : 0;
  const opacity = isDragging
    ? Math.max(0.5, 1 - Math.abs(dragOffset.x) / 300)
    : 1;

  /* -------------------- UI -------------------- */

  return (
    <div className="min-h-screen bg-pink-200 p-6">
      <h1 className="text-5xl font-bold text-center mb-8 text-purple-800">
        Gift Swiper
      </h1>

      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Card */}
        <div className="flex flex-col items-center">
          <div className="relative w-80 h-80 mb-4">
            <div
              className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing transition-all"
              style={{
                transform: swipeDirection
                  ? swipeDirection === "right"
                    ? "translateX(400px) rotate(20deg)"
                    : "translateX(-400px) rotate(-20deg)"
                  : `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
                opacity: swipeDirection ? 0 : opacity,
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              <div className="w-full h-full bg-white rounded-3xl shadow-2xl flex items-center justify-center border-4 border-purple-200">
                <div className="text-9xl font-bold text-purple-600">
                  {currentCard}
                </div>
              </div>
            </div>
          </div>

          <p className="text-gray-600 text-sm">
            Make sure you are holding down. Swipe right to save, left to skip
          </p>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-3xl font-bold text-purple-800">
              Gift Recommendations
            </h2>
            {recommendations.length > 0 && (
              <button
                onClick={clearAll}
                className="text-red-500 text-sm underline"
              >
                Clear All
              </button>
            )}
          </div>

          {recommendations.length === 0 ? (
            <p className="text-gray-500 text-center mt-12">
              No gifts saved yet
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {recommendations.map((num, i) => (
                <div
                  key={`${num}-${i}`}
                  className="relative bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 flex justify-center shadow-md"
                >
                  <span className="text-5xl font-bold text-purple-600">
                    {num}
                  </span>
                  <button
                    onClick={() => removeRecommendation(num)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
