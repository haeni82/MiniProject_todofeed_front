import styled from "styled-components";
import { useNavigate } from "react-router";

interface RetroButtonProps {
  label: string;
  moveTo: string;
  image?: string;
}

const ButtonContainer = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60%;
  margin: 10px;
  padding: 10px 5px;
  background-color: #c0c0c0;

  font-family: "Courier New", Courier, monospace;
  font-size: 16px;
  font-weight: 900;
  color: #000;

  /* 입체 테두리 */
  border-top: 2px solid #ffffff;
  border-left: 2px solid #ffffff;
  border-right: 2px solid #000000;
  border-bottom: 2px solid #000000;

  cursor: pointer;
  outline: none;
  box-sizing: border-box;
  transition: all 0.1s;

  &:hover {
    background-color: #d4d4d4;
  }

  &:active {
    border-top: 2px solid #000000;
    border-left: 2px solid #000000;
    border-right: 2px solid #ffffff;
    border-bottom: 2px solid #ffffff;
    background-color: #a0a0a0;
    transform: translate(1px, 1px);
  }
`;

const ImageWrapper = styled.div`
  margin-right: 8px;
  display: flex;
  flex-direction: row;
  align-items: center;

  img {
    width: 40px;
    height: 40px;
    image-rendering: pixelated; /* 도트 깨짐 방지 */
  }
`;

const RetroButton = ({ label, moveTo, image }: RetroButtonProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (moveTo) {
      navigate(moveTo);
    }
  };

  return (
    <ButtonContainer onClick={handleClick}>
      {image && (
        <ImageWrapper>
          <img src={image} alt={`${label} icon`} />
        </ImageWrapper>
      )}
      {label}
    </ButtonContainer>
  );
};

export default RetroButton;
