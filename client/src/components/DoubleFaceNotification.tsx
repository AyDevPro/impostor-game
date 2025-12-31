import { useEffect, useState } from 'react';

interface DoubleFaceNotificationProps {
  username: string;
}

export function DoubleFaceNotification({ username }: DoubleFaceNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-4 rounded-lg shadow-2xl border-2 border-yellow-300">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎭</span>
          <div>
            <p className="font-bold text-lg">Double-Face révélé !</p>
            <p className="text-sm">{username} s'est révélé comme Double-Face</p>
          </div>
        </div>
      </div>
    </div>
  );
}
