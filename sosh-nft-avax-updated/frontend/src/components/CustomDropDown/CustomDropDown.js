import React from "react";
import PropTypes from "prop-types";

import { Dropdown } from "react-bootstrap";
import { StyledDropdown } from "./style";

const CustomDropDown = (props) => {
  const {
    toggleElement,
    children,
    containerProps,
    toggleProps,
    menuProps,
    menuItems,
    $width,
  } = props;
  return (
    <StyledDropdown $width={$width} {...containerProps}>
      <Dropdown.Toggle as="div" {...toggleProps}>
        {toggleElement}
      </Dropdown.Toggle>
      {(children || menuItems?.length) && (
        <Dropdown.Menu renderOnMount flip align="end" {...menuProps}>
          {menuItems?.length > 0 ? (
            <>
              {menuItems.map(
                ({ id, icon: Icon, label, action, ...restOptions }, index) => {
                  return (
                    <Dropdown.Item
                      key={id + index}
                      eventKey={id}
                      onClick={(...params) => action && action(...params)}
                      {...restOptions}
                    >
                      {Icon && <Icon className="dropdown-item-icon" />}
                      {label}
                    </Dropdown.Item>
                  );
                }
              )}
            </>
          ) : (
            children
          )}
        </Dropdown.Menu>
      )}
    </StyledDropdown>
  );
};

export default CustomDropDown;

CustomDropDown.propTypes = {
  toggleElement: PropTypes.node,
  children: PropTypes.node,
  containerProps: PropTypes.shape(Dropdown.propTypes),
  toggleProps: PropTypes.shape(Dropdown.Toggle.propTypes),
  menuProps: PropTypes.shape(Dropdown.Menu.propTypes),
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
      action: PropTypes.func,
      as: PropTypes.oneOfType([PropTypes.string, PropTypes.elementType]),
    })
  ),
  $width: PropTypes.string,
};
