export default function Series({ imdbId }: { imdbId: string }) {
  if (!imdbId) {
      return (
          <div className="flex justify-center items-center text-lg md:text-2xl lg:text-3xl mt-36 lg:mt-72 text-center px-4">
              There is no media link or any IMDb ID present
          </div>
      );
  } else {
      if (imdbId[0] === "t") {
          return (
              <iframe
                  className="w-full h-64 sm:h-96 md:h-[450px] lg:h-[600px] rounded"
                  src={`https://www.2embed.cc/embedtvfull/${imdbId}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
              ></iframe>
          );
      } else {
          return (
              <video controls className="w-full h-64 sm:h-96 md:h-[450px] lg:h-[600px] rounded">
                  <source src={imdbId} type="video/mp4" />
                  Your browser does not support the video tag.
              </video>
          );
      }
  }
}
