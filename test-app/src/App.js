import { useState, useEffect, useRef } from "react";

/* ---------------- Questions Config ---------------- */

const questions = [
  [
    { label: "Name", key: "recipient" },
    { label: "Age", key: "age" },
    { label: "Gender", key: "gender" },
  ],
  [
    { label: "Hobbies", key: "hobbies", textarea: true },
    { label: "Personality", key: "personality", textarea: true },
  ],
  [
    { label: "Budget", key: "budget" },
    { label: "Occasion", key: "occasion" },
  ],
];

const initialForm = {
  recipient: "",
  age: "",
  gender: "",
  hobbies: "",
  personality: "",
  budget: "",
  occasion: "",
};

/* ---------------- App ---------------- */

export default function App() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState(initialForm);

  const onChange = (k, v) =>
    setFormData((p) => ({ ...p, [k]: v }));

  const Page = questions[step];

  return step < questions.length ? (
    <QuestionPage
      fields={Page}
      formData={formData}
      onChange={onChange}
      onNext={() => setStep(step + 1)}
    />
  ) : (
    <GiftSwiper />
  );
}

/* ---------------- Question Page ---------------- */

function QuestionPage({ fields, formData, onChange, onNext }) {
  return (
    <div className="min-h-screen bg-pink-200 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full">

        {fields.map((f) => (
          <div key={f.key} className="mb-4">
            <label className="block mb-2 font-medium">
              {f.label}
            </label>

            {f.textarea ? (
              <textarea
                className="w-full border-2 rounded-xl p-3"
                value={formData[f.key]}
                onChange={(e) => onChange(f.key, e.target.value)}
              />
            ) : (
              <input
                className="w-full border-2 rounded-xl p-3"
                value={formData[f.key]}
                onChange={(e) => onChange(f.key, e.target.value)}
              />
            )}
          </div>
        ))}

        <button
          onClick={onNext}
          className="w-full bg-black text-white rounded-xl py-3 mt-6"
        >
          Next
        </button>
      </div>
    </div>
  );
}

/* ---------------- Gift Swiper ---------------- */

function GiftSwiper() {
  const [current, setCurrent] = useState(1);
  const [saved, setSaved] = useState([]);
  const [offset, setOffset] = useState(0);

  const startX = useRef(0);
  const dragging = useRef(false);

  /* ---------- Storage ---------- */

  useEffect(() => {
    const s = JSON.parse(localStorage.getItem("gifts") || "{}");
    setSaved(s.saved || []);
    setCurrent(s.current || 1);
  }, []);

  useEffect(() => {
    localStorage.setItem("gifts", JSON.stringify({ saved, current }));
  }, [saved, current]);

  /* ---------- Swipe ---------- */

  const swipe = (dir) => {
    if (dir === "right") setSaved((p) => [...p, current]);
    setCurrent((p) => p + 1);
    setOffset(0);
  };

  const onDown = (e) => {
    dragging.current = true;
    startX.current = e.clientX;
  };

  const onMove = (e) =>
    dragging.current && setOffset(e.clientX - startX.current);

  const onUp = () => {
    dragging.current = false;
    offset > 100 ? swipe("right") :
    offset < -100 ? swipe("left") :
    setOffset(0);
  };

  const remove = (n) => setSaved(saved.filter((x) => x !== n));

  return (
    <div className="min-h-screen bg-pink-200 p-6">
      <h1 className="text-4xl font-bold text-center mb-8">
        Gift Swiper
      </h1>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">

        {/* Card */}

        <div className="flex justify-center">
          <div
            className="w-80 h-80 bg-white rounded-3xl shadow-xl flex items-center justify-center text-8xl font-bold cursor-grab"
            style={{
              transform: `translateX(${offset}px) rotate(${offset / 20}deg)`
            }}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerLeave={onUp}
          >
            {current}
          </div>
        </div>

        {/* Recommendations */}

        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h2 className="text-2xl font-bold mb-4">
            Gift Recommendations
          </h2>

          {saved.length === 0 && (
            <p className="text-gray-400">No gifts yet</p>
          )}

          <div className="grid grid-cols-2 gap-4">
            {saved.map((n) => (
              <div
                key={n}
                className="bg-pink-100 rounded-xl p-4 relative text-center text-4xl font-bold"
              >
                {n}
                <button
                  onClick={() => remove(n)}
                  className="absolute top-1 right-2 text-red-500"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
