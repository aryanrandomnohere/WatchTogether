import { useEffect, useState } from 'react';

export default function SlideShow(): JSX.Element {
  const slides = [
    'https://image.tmdb.org/t/p/w500/kU98MbVVgi72wzceyrEbClZmMFe.jpg',
    'https://image.tmdb.org/t/p/w500/m4TUa2ciEWSlk37rOsjiSIvZDXE.jpg',
    'https://image.tmdb.org/t/p/w500/gc8PfyTqzqltKPW3X0cIVUGmagz.jpg',
    'https://image.tmdb.org/t/p/w500/zfbjgQE1uSd9wiPTX4VzsLi0rGG.jpg',
    'https://image.tmdb.org/t/p/w500/jlbUx0aHJupDVDlCo0R7UxSaUUd.jpg',
    'https://image.tmdb.org/t/p/w500/A6tMQAo6t6eRFCPhsrShmxZLqFB.jpg',
    'https://image.tmdb.org/t/p/w500/kU98MbVVgi72wzceyrEbClZmMFe.jpg',
    'https://image.tmdb.org/t/p/w500/m4TUa2ciEWSlk37rOsjiSIvZDXE.jpg',
    'https://image.tmdb.org/t/p/w500/gc8PfyTqzqltKPW3X0cIVUGmagz.jpg',
    'https://image.tmdb.org/t/p/w500/zfbjgQE1uSd9wiPTX4VzsLi0rGG.jpg',
    'https://image.tmdb.org/t/p/w500/jlbUx0aHJupDVDlCo0R7UxSaUUd.jpg',
    'https://image.tmdb.org/t/p/w500/A6tMQAo6t6eRFCPhsrShmxZLqFB.jpg',
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 8000); // Change slides every 8 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [slides.length]);

  return (
    <div className="relative w-full p-3.5">
      <div className="flex overflow-hidden w-full">
        {slides.map((imageUrl, index) => (
          <div
            key={index}
            className={` carousel-item relative w-fit transition-transform duration-1000 ease-in-out ${
              index === currentSlide ? 'translate-x-0' : '-translate-x-full'
            }`}
            style={{
              transform: `translateX(-${currentSlide * 100}%)`,
            }}
          >
            <img src={imageUrl} alt={`Slide ${index + 1}`} className="w-full rounded-lg  " />
          </div>
        ))}
      </div>

      {/* Navigation buttons (optional for manual control) */}
      <div className="absolute left-0 right-0 top-1/3 flex justify-between shadow-md">
        <button
          onClick={() => setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1))}
          className="btn-lg text-2xl"
        >
          ❮
        </button>
        <button
          onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)}
          className="btn-lg text-2xl"
        >
          ❯
        </button>
      </div>
    </div>
  );
}
