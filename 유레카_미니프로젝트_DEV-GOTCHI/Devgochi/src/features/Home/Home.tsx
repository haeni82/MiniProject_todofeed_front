import styled from "styled-components";
import background from "@/features/Home/assets/images/Background.png";
import BottomTab from "@/features/Home/components/BottomTab";
import CharacterImage from "@/features/Home/components/CharacterImage";
import CharacterInfo from "@/features/Home/components/CharacterInfo";

const HomeBackground = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-image: url(${background});
`;

function Home() {
  return (
    <HomeBackground>
      <CharacterInfo />
      <CharacterImage />
      <BottomTab />
    </HomeBackground>
  );
}

export default Home;
