import React, { useState, useEffect, useMemo } from "react";

const HabitTracker = () => {
  const [habitData, setHabitData] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  const habits = ["calisthenics", "cybersec", "money", "reading", "hobby"];
  const habitNames = [
    "Calisthenics",
    "CyberSec",
    "Para Disiplini",
    "Kitap Okuma",
    "Hobi",
  ];

  // Initialize data
  useEffect(() => {
    const initialData = {};
    for (let day = 1; day <= 115; day++) {
      initialData[day] = {
        calisthenics: false,
        cybersec: false,
        money: false,
        reading: false,
        hobby: false,
        notes: "",
      };
    }
    setHabitData(initialData);
  }, []);

  // Handle responsive design
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalDays = 115;
    let completedDays = 0;
    let currentStreak = 0;

    // Count completed days
    for (let day = 1; day <= totalDays; day++) {
      const dayCompleted = habits.every((habit) => habitData[day]?.[habit]);
      if (dayCompleted) completedDays++;
    }

    // Calculate current streak from the end
    for (let day = totalDays; day >= 1; day--) {
      const dayCompleted = habits.every((habit) => habitData[day]?.[habit]);
      if (dayCompleted) {
        currentStreak++;
      } else {
        break;
      }
    }

    const completionRate = Math.round((completedDays / totalDays) * 100);

    return {
      totalDays,
      completedDays,
      completionRate,
      currentStreak,
    };
  }, [habitData, habits]);

  // Calculate progress for each habit
  const progress = useMemo(() => {
    return habits.map((habit, index) => {
      const completed = Object.values(habitData).filter(
        (day) => day[habit]
      ).length;
      const percentage = Math.round((completed / 115) * 100);
      return {
        name: habitNames[index],
        key: habit,
        completed,
        percentage,
      };
    });
  }, [habitData, habits, habitNames]);

  const toggleHabit = (day, habit) => {
    setHabitData((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [habit]: !prev[day]?.[habit],
      },
    }));
  };

  const updateNotes = (day, notes) => {
    setHabitData((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        notes,
      },
    }));
  };

  const exportData = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent +=
      "Gün,Calisthenics,CyberSec,Para Disiplini,Kitap Okuma,Hobi,Notlar\n";

    for (let day = 1; day <= 115; day++) {
      const dayData = habitData[day] || {};
      const row = [
        day,
        dayData.calisthenics ? "✓" : "✗",
        dayData.cybersec ? "✓" : "✗",
        dayData.money ? "✓" : "✗",
        dayData.reading ? "✓" : "✗",
        dayData.hobby ? "✓" : "✗",
        '"' + (dayData.notes || "").replace(/"/g, '""') + '"',
      ].join(",");
      csvContent += row + "\n";
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "115_gunluk_takip.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const StatCard = ({ number, label }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-indigo-500 hover:shadow-md transition-shadow">
      <div className="text-2xl font-bold text-indigo-600 mb-1">{number}</div>
      <div className="text-sm text-gray-600 font-medium">{label}</div>
    </div>
  );

  const Checkbox = ({ checked, onClick, label }) => (
    <div
      className={`w-6 h-6 border-2 rounded cursor-pointer transition-all hover:scale-105 ${
        checked
          ? "bg-indigo-500 border-indigo-500"
          : "bg-white border-gray-300 hover:border-indigo-300"
      }`}
      onClick={onClick}
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {checked && (
        <svg
          className="w-full h-full text-white"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </div>
  );

  const DayRowDesktop = ({ day }) => {
    const dayData = habitData[day] || {};

    return (
      <div className="grid grid-cols-[60px_repeat(5,1fr)_2fr] gap-3 p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors items-center">
        <div className="flex items-center justify-center font-semibold text-gray-700 bg-white border border-gray-200 rounded h-10 text-sm">
          {day}
        </div>
        {habits.map((habit, index) => (
          <div key={habit} className="flex justify-center">
            <Checkbox
              checked={dayData[habit] || false}
              onClick={() => toggleHabit(day, habit)}
              label={habitNames[index]}
            />
          </div>
        ))}
        <input
          type="text"
          className="px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Notlarınız..."
          value={dayData.notes || ""}
          onChange={(e) => updateNotes(day, e.target.value)}
        />
      </div>
    );
  };

  const DayRowMobile = ({ day }) => {
    const dayData = habitData[day] || {};

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-3">
        <div className="bg-indigo-500 text-white px-3 py-1 rounded font-semibold text-sm mb-3 w-fit">
          Gün {day}
        </div>

        {habits.map((habit, index) => (
          <div
            key={habit}
            className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
          >
            <span className="font-medium text-gray-700 text-sm">
              {habitNames[index]}
            </span>
            <Checkbox
              checked={dayData[habit] || false}
              onClick={() => toggleHabit(day, habit)}
              label={habitNames[index]}
            />
          </div>
        ))}

        <div className="mt-3">
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Notlarınız..."
            value={dayData.notes || ""}
            onChange={(e) => updateNotes(day, e.target.value)}
          />
        </div>
      </div>
    );
  };

  const ProgressBar = ({ habit }) => (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium text-gray-700 text-sm">{habit.name}</span>
        <span className="font-semibold text-gray-800 text-sm">
          {habit.percentage}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${habit.percentage}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-center py-8 px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            115 Günlük Alışkanlık Takibi
          </h1>
          <p className="text-indigo-100 text-lg">
            Hedeflerinize ulaşmak için her gün bir adım daha
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50">
          <StatCard number={stats.totalDays} label="Toplam Gün" />
          <StatCard number={stats.completedDays} label="Tamamlanan" />
          <StatCard number={`${stats.completionRate}%`} label="Başarı Oranı" />
          <StatCard number={stats.currentStreak} label="Güncel Seri" />
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Habits Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Günlük Takip
            </h2>

            {!isMobile && (
              <div className="grid grid-cols-[60px_repeat(5,1fr)_2fr] gap-3 mb-4 px-3">
                <div className="font-semibold text-gray-700 text-center text-sm">
                  Gün
                </div>
                {habitNames.map((name) => (
                  <div
                    key={name}
                    className="font-semibold text-gray-700 text-center text-xs"
                  >
                    {name}
                  </div>
                ))}
                <div className="font-semibold text-gray-700 text-center text-sm">
                  Notlar
                </div>
              </div>
            )}

            <div
              className={`${
                !isMobile
                  ? "max-h-96 overflow-y-auto border border-gray-200 rounded-lg bg-gray-50"
                  : ""
              }`}
            >
              {Array.from({ length: 115 }, (_, i) => i + 1).map((day) =>
                isMobile ? (
                  <DayRowMobile key={day} day={day} />
                ) : (
                  <DayRowDesktop key={day} day={day} />
                )
              )}
            </div>
          </div>

          {/* Progress Section */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              İlerleme Durumu
            </h3>
            <div className="space-y-4">
              {progress.map((habit) => (
                <ProgressBar key={habit.key} habit={habit} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={exportData}
        className="fixed bottom-4 right-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 text-sm"
      >
        📊 Dışa Aktar
      </button>
    </div>
  );
};

export default HabitTracker;
