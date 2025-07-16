import styled from "styled-components";

export const OptionContainer = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
`;

export const Option = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  width: 45%;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover,
  &.selected {
    border-color: #3366ff;
    border-width: 2px;
    filter: blur(1px);
  }
`;

export const Icon = styled.div`
  font-size: 24px;
  margin-bottom: 10px;
`;

export const Button = styled.button`
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  width: 100%;
  font-size: 16px;
  cursor: pointer;
  transition: opacity 0.3s ease;
  margin-top: 10px;

  &:hover {
    opacity: 0.9;
  }
`;

export const ConfirmButton = styled(Button)`
  background: #3366ff;
  color: white;
`;

export const BackButton = styled(Button)`
  background: white;
  color: #3366ff;
  border: 1px solid #3366ff;
`;

export const FormContainer = styled.form`
  margin-top: 20px;

  .form-btn {
    margin-top: 50px;
    display: flex;
    gap: 10px;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  text-align: left;
  margin-top:20px ;
`;

export const ConfirmationMessage = styled.div`
  p {
    margin-top: 20px;
    font-size: 24px;
    font-weight: 700;
    line-height: 36px;
  }
`;
