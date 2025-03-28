import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RecommendationFrame from "../RecommendationFrame";
import {  FaArrowLeft, FaArrowRight } from "react-icons/fa";


const popular = [
  {
    "backdrop_path": "/gc8PfyTqzqltKPW3X0cIVUGmagz.jpg",
    "id": 1396,
    "name": "Breaking Bad",
    "original_name": "Breaking Bad",
    "overview": "Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer and given a prognosis of only two years left to live. He becomes filled with a sense of fearlessness and an unrelenting desire to secure his family's financial future at any cost as he enters the dangerous world of drugs and crime.",
    "poster_path": "/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg",
    "media_type": "tv",
    "adult": false,
    "original_language": "en",
    "genre_ids": [
        18,
        80
    ],
    "popularity": 842.173,
    "first_air_date": "2008-01-20",
    "vote_average": 8.918,
    "vote_count": 14811,
    "origin_country": [
        "US"
    ]
},
  {
    "backdrop_path": "/yvKrycViRMQcIgdnjsM5JGNWU4Q.jpg",
    "id": 1429,
    "name": "Attack on Titan",
    "original_name": "進撃の巨人",
    "overview": "Many years ago, the last remnants of humanity were forced to retreat behind the towering walls of a fortified city to escape the massive, man-eating Titans that roamed the land outside their fortress. Only the heroic members of the Scouting Legion dared to stray beyond the safety of the walls – but even those brave warriors seldom returned alive. Those within the city clung to the illusion of a peaceful existence until the day that dream was shattered, and their slim chance at survival was reduced to one horrifying choice: kill – or be devoured!",
    "poster_path": "/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg",
    "media_type": "tv",
    "adult": false,
    "original_language": "ja",
    "genre_ids": [
        16,
        10765,
        10759
    ],
    "popularity": 120.232,
    "first_air_date": "2013-04-07",
    "vote_average": 8.666,
    "vote_count": 6506,
    "origin_country": [
        "JP"
    ]
},
{
  "backdrop_path": "/xuJ0F9RfKvVSJNDg2usurQ9WvY5.jpg",
  "id": 46260,
  "name": "Naruto",
  "original_name": "ナルト",
  "overview": "Naruto Uzumaki, a mischievous adolescent ninja, struggles as he searches for recognition and dreams of becoming the Hokage, the village's leader and strongest ninja.",
  "poster_path": "/xppeysfvDKVx775MFuH8Z9BlpMk.jpg",
  "media_type": "tv",
  "adult": false,
  "original_language": "ja",
  "genre_ids": [
      16,
      10759,
      10765
  ],
  "popularity": 502.152,
  "first_air_date": "2002-10-03",
  "vote_average": 8.363,
  "vote_count": 5543,
  "origin_country": [
      "JP"
  ]
},
{
  "backdrop_path": "/8HM3NtsejczRKDz7agUVFdppicJ.jpg",
  "id": 88803,
  "name": "Vinland Saga",
  "original_name": "ヴィンランド・サガ",
  "overview": "For a thousand years, the Vikings have made quite a name and reputation for themselves as the strongest families with a thirst for violence. Thorfinn, the son of one of the Vikings' greatest warriors, spends his boyhood in a battlefield enhancing his skills in his adventure to redeem his most-desired revenge after his father was murdered.",
  "poster_path": "/vUHlpA5c1NXkds59reY3HMb4Abs.jpg",
  "media_type": "tv",
  "adult": false,
  "original_language": "ja",
  "genre_ids": [
      16,
      10768
  ],
  "popularity": 104.228,
  "first_air_date": "2019-07-08",
  "vote_average": 8.5,
  "vote_count": 725,
  "origin_country": [
      "JP"
  ]
},
{
  "backdrop_path": "/z0YhJvomqedHF85bplUJEotkN5l.jpg",
  "id": 31910,
  "name": "Naruto Shippūden",
  "original_name": "ナルト 疾風伝",
  "overview": "After 2 and a half years Naruto finally returns to his village of Konoha, and sets about putting his ambitions to work. It will not be easy though as he has amassed a few more dangerous enemies, in the likes of the shinobi organization; Akatsuki.",
  "poster_path": "/71mASgFgSiPl9QUexVH8BubU0lD.jpg",
  "media_type": "tv",
  "adult": false,
  "original_language": "ja",
  "genre_ids": [
      16,
      10759,
      10765
  ],
  "popularity": 275.791,
  "first_air_date": "2007-02-15",
  "vote_average": 8.5,
  "vote_count": 8177,
  "origin_country": [
      "JP"
  ]
}
]


export default function Recommendation() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Increased duration to 4 seconds

    return () => clearInterval(interval);
  }, [currentIndex]);

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % popular.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + popular.length) % popular.length);
  };

  return (
    <div className="relative md:min-h-[35rem] min-h-52 w-full bg-slate-200 dark:bg-slate-950 flex justify-center items-center overflow-hidden">
      <div className="relative w-full h-full flex justify-center items-center">
        <AnimatePresence custom={direction} mode="popLayout">
          {popular.length > 0 && (
            <>
              {/* Outgoing Frame */}
              <motion.div
                key={`old-${popular[currentIndex]?.id}`}
                initial={{ x: "0%", opacity: 1 }}
                animate={{ x: direction === 1 ? "-100%" : "100%", opacity: 0 }}
                exit={{ x: direction === 1 ? "-100%" : "100%", opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute w-full h-full flex justify-center"
              >
                <RecommendationFrame show={popular[currentIndex]} />
              </motion.div>

              {/* Incoming Frame */}
              <motion.div
                key={`new-${popular[(currentIndex + 1) % popular.length]?.id}`}
                initial={{ x: direction === 1 ? "100%" : "-100%", opacity: 0 }}
                animate={{ x: "0%", opacity: 1 }}
                exit={{ x: "0%", opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute w-full h-full flex justify-center"
              >
                <RecommendationFrame show={popular[(currentIndex + 1) % popular.length]} />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons (Stacked) */}
      <div className="absolute bottom-1.5 md:right-0.5 right-2 sm:mr-3 flex flex-col space-y-2">
       
        <button
          onClick={nextSlide}
          className="bg-slate-700 text-slate-100 p-1 md:p-2 bg-opacity-50 rounded shadow-lg hover:bg-slate-600 transition"
        >
         <FaArrowRight className="md:text-2xl" />
        </button>
        <button
          onClick={prevSlide}
          className="bg-slate-700 bg-opacity-50 text-slate-100 p-1 md:p-2 rounded shadow-lg hover:bg-slate-600 transition"
        >
          <FaArrowLeft className="md:text-2xl" />
        </button>
      </div>
    </div>
  );
}
