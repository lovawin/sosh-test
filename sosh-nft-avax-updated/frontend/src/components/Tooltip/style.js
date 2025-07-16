import styled, { css } from 'styled-components';

import { Tooltip } from 'react-bootstrap';

export const StyledToolTip = styled(Tooltip)`
  .tooltip-inner {
    border-radius: 0;
    font-size: ${(props) => props.theme.typography.subText3};
    ${({ variant, theme }) =>
      variant === 'light' &&
      css`
        background-color: ${theme.palette.white.light};
        color: ${theme.palette.text.dark};
      `}
  }
`;
