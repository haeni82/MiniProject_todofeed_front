import LV1 from "@/features/Home/assets/images/LV1.png";
import LV2 from "@/features/Home/assets/images/LV2.png";
import LV3 from "@/features/Home/assets/images/LV3.png";
import LV4 from "@/features/Home/assets/images/LV4.png";
import LV5 from "@/features/Home/assets/images/LV5.png";
import { getLocalStorage } from "@/shared/localStorage";
import styled from "styled-components";
import { useEffect, useState } from "react";

const CharacterContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const CharacterSize = styled.img`
  height: 30vh;
`;

function CharacterImage() {
  let [level, setLevel] = useState(0);
  useEffect(() => {
    const storedLevel = Number(getLocalStorage("level")) || 0;
    setLevel(storedLevel);
  }, []);

  const chooseImage = () => {
    switch (level) {
      case 0:
      case 1:
        return LV1;
      case 2:
        return LV2;
      case 3:
        return LV3;
      case 4:
        return LV4;
      case 5:
        return LV5;
      default:
        return LV1;
    }
  };

  return (
    <CharacterContainer>
      <CharacterSize src={chooseImage()} />
    </CharacterContainer>
  );
}

export default CharacterImage;
