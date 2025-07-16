import React from 'react';

import PropTypes from 'prop-types';

import styled from 'styled-components';
import { FormControl } from 'react-bootstrap';

const FormFeedbackStyled = styled(FormControl.Feedback)`
  color: ${(props) => props.theme.palette.text.error};
  font-size: ${(props) => props.theme.typography.subText2};
  font-weight: 500;
  line-height: 112.1%;
  margin-top: 1.2rem;
  display: block;
`;

const StyledError = styled.div`
  color: ${(props) => props.theme.palette.text.error};
  font-size: ${(props) => props.theme.typography.subText2};
  font-weight: 500;
  line-height: 112.1%;
  margin-top: 1.2rem;
  width: 100%;
`;

const FormErrorMsg = ({ children, outSideContainer = false, className }) => (
  <>
    {outSideContainer ? (
      <StyledError className={className}>{children}</StyledError>
    ) : (
      <FormFeedbackStyled type="invalid" className={className}>
        {children}
      </FormFeedbackStyled>
    )}
  </>
);

FormErrorMsg.propTypes = {
  children: PropTypes.string,
  outSideContainer: PropTypes.bool,
  className: PropTypes.string,
};

export default FormErrorMsg;
