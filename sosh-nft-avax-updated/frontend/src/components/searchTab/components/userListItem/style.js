import styled from "styled-components";

export const StyledUserListItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${({ theme }) => theme.palette.text.primary};

  .default-avatar {
    color: ${({ theme }) => theme.palette.text.secondary};
  }

  .social-icon-wrap {
    display: flex;
    align-items: center;
  }
`;
