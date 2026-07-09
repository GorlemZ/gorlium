import { type ReactNode, useState } from "react";
import Marquee from "react-fast-marquee";

interface BannerProps {
  children: ReactNode;
}

function Banner({ children }: BannerProps) {
  const [isPaused, setIsPaused] = useState(false);

  const handleTap = () => {
    setIsPaused((prev) => !prev); // Toggle between paused and running
  };
  return (
    <div onTouchStart={handleTap} onClick={handleTap}>
      <Marquee
        pauseOnHover={false}
        play={!isPaused}
        loop={0}
        autoFill={true}
        style={{ alignSelf: "right", height: "5vh", color: "white" }}
      >
        {children}
      </Marquee>
    </div>
  );
}

export default Banner;
