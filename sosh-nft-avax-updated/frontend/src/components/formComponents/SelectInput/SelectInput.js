import React, {
  useState,
  forwardRef,
  useRef,
  useCallback,
  useMemo,
} from "react";

import { Dropdown, FormControl } from "react-bootstrap";
import { CustomMenuStyled, StyledChevron } from "./style";
import PropTypes from "prop-types";
import { useEffect } from "react";

import { CheckMark } from "../checkbox";
import { debounce } from "lodash";
import FormErrorMsg from "../FormErrorMsg/FormErrorMsg";
import TextInput from "../textInput";
import Chevron from "assets/icons/chevron";

const popperConfig = {
  modifiers: [
    {
      name: "offset",
      enabled: true,
      options: {
        offset: [0, 0],
      },
    },
    {
      name: "close",
    },
  ],
};

export const CustomToggle = forwardRef(
  (
    {
      onClick,
      label,
      isInvalid,
      showChevron = true,
      chevronColor,
      isOpen,
      error,
      colorTone,
      showError,
      helperText,
      ...rest
    },
    ref
  ) => {
    return (
      <div className="select-input-wrapper">
        <TextInput
          onClick={(e) => {
            onClick(e);
          }}
          onKeyDown={(e) => {
            if (e.which === 32) {
              e.preventDefault();
              onClick(e);
            }
          }}
          ref={ref}
          isInvalid={isInvalid}
          readOnly
          {...rest}
        />
        {showChevron && (
          <StyledChevron>
            <Chevron />
          </StyledChevron>
        )}
      </div>
    );
  }
);

CustomToggle.displayName = "CustomSelect";
CustomToggle.propTypes = {
  isInvalid: PropTypes.bool,
  onClick: PropTypes.func,
  label: PropTypes.string,
  error: PropTypes.string,
  labelProps: PropTypes.object,
  isOpen: PropTypes.bool,
  showChevron: PropTypes.bool,
  colorTone: PropTypes.string,
  chevronColor: PropTypes.oneOf(["white", "black"]),
  outline: PropTypes.bool,
  transparent: PropTypes.bool,
  showError: PropTypes.bool,
};

const CustomMenu = forwardRef(({ children, ...props }, ref) => {
  return (
    <CustomMenuStyled ref={ref} {...props}>
      {children}
    </CustomMenuStyled>
  );
});

CustomMenu.displayName = "CustomMenu";
CustomMenu.propTypes = {
  children: PropTypes.node,
};

const SelectInput = ({
  options,
  outline = false,
  extraItem = null,
  multiple = false,
  searchable = false,
  inputElement = CustomToggle,
  onSingleSelect,
  onMultipleSelect,
  onDelete,
  disabled = false,
  optionComponent: OptionComponent,
  error,
  containerClassName,
  initialValue,
  ...rest
}) => {
  const [open, setOpen] = useState(false);

  const [value, setValue] = useState(multiple ? [] : "");
  const [labelValue, setLabelValue] = useState("");

  const targetRef = useRef(null);
  const menuRef = useRef(null);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [mappedOptions, setMappedOptions] = useState({});

  useEffect(() => {
    if (multiple) {
      if (typeof initialValue === "object") {
        setValue(initialValue);
      } else {
        setValue([initialValue]);
      }
    } else {
      setValue(initialValue);
    }
  }, [initialValue, multiple]);

  useEffect(() => {
    const _mappedOptions = {};

    options.forEach((option) => {
      _mappedOptions[option.value] = option;
    });
    setMappedOptions(_mappedOptions);
  }, [options]);

  useEffect(() => {
    let label = "";
    if (multiple) {
      if (inputElement === CustomToggle) {
        label = value.reduce((_label, _value) => {
          try {
            _label += `${mappedOptions[_value]?.label}, `;
            return _label;
          } catch (error) {
            return _label;
          }
        }, "");
      } else {
        label = value.map((_value) => {
          try {
            return mappedOptions[_value];
          } catch (error) {
            return "";
          }
        });
      }
    } else {
      for (let option of options) {
        if (option.value == value) {
          label = option.label;
          break;
        }
      }
    }
    setLabelValue(label);
  }, [value, options, multiple, mappedOptions, inputElement]);

  const toggleDropdown = (isOpen, event) => {
    if (disabled) {
      return 0;
    }
    if (multiple && event?.source === "select") {
      return 0;
    } else {
      setOpen(isOpen);
    }
  };

  const onSingleSelectHandler = (_value) => {
    onSingleSelect && onSingleSelect(_value);

    setValue(_value);
  };

  const onMultipleSelectHandler = (_value) => {
    let values = new Set(value);
    if (values.has(_value)) {
      values.delete(_value);
    } else {
      values.add(_value);
    }
    values = Array.from(values);
    setValue(values);
    onMultipleSelect && onMultipleSelect(_value);
  };

  const onSelectHandler = (_value) => {
    if (multiple) {
      onMultipleSelectHandler(_value);
    } else {
      onSingleSelectHandler(_value);
    }
  };

  useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  const filterResults = useCallback(() => {
    const input = targetRef?.current;
    if (input) {
      if (input.value) {
        const filteredList = options.filter(({ label }) => {
          try {
            const regex = new RegExp(input.value.toLowerCase(), "gi");
            return label.toLowerCase().match(regex);
          } catch (error) {
            return false;
          }
        });
        setFilteredOptions(filteredList);
      } else {
        setFilteredOptions(options);
      }
    }
  }, [options]);

  const debouncedFiltering = useMemo(
    () => debounce(filterResults, 250),
    [filterResults]
  );

  const deleteHandler = (_value) => {
    let values = new Set(value);

    if (values.has(_value)) {
      values.delete(_value);
    }
    values = Array.from(values);
    setValue(values);
    onDelete && onDelete(_value);
  };

  const dropdownToggleProps = multiple
    ? { onDelete: deleteHandler }
    : { showError: false };

  return (
    <>
      <Dropdown
        show={open}
        onToggle={toggleDropdown}
        onSelect={onSelectHandler}
        focusFirstItemOnShow="keyboard"
        className={`custom-select ${containerClassName ?? ""}`}
        drop="down"
      >
        <Dropdown.Toggle
          as={inputElement}
          id="custom-toggle"
          outline={outline}
          isInvalid={!!error}
          value={labelValue}
          error={error}
          disabled={disabled}
          className="select-input"
          {...dropdownToggleProps}
          {...rest}
        />
        <Dropdown.Menu
          popperConfig={{ ...popperConfig, ref: menuRef }}
          $data={options}
          as={CustomMenu}
        >
          <div className="menu-wrapper">
            {searchable && (
              <div className="search-wrapper">
                <FormControl
                  id="selectSearch"
                  name="selectSearch"
                  ref={targetRef}
                  placeholder="Enter keyword"
                  color="white"
                  $outline
                  className="search-input"
                  onChange={debouncedFiltering}
                />
              </div>
            )}
            {filteredOptions?.map((el) => (
              <Dropdown.Item
                key={el.value}
                as="div"
                active={value === el.value}
                eventKey={el.value}
              >
                {multiple && (
                  <CheckMark
                    target={""}
                    width="1.5rem"
                    color={"#fff"}
                    value={value?.includes(el.value)}
                  />
                )}
                {OptionComponent ? (
                  <OptionComponent {...el} setSelectVisibility={setOpen} />
                ) : (
                  <p>{el.label}</p>
                )}
              </Dropdown.Item>
            ))}
            {searchable && filteredOptions?.length === 0 && (
              <Dropdown.Item disabled as="div">
                <p>No results found</p>
              </Dropdown.Item>
            )}
            {extraItem}
          </div>
        </Dropdown.Menu>
      </Dropdown>
      {error && <FormErrorMsg outSideContainer>{error}</FormErrorMsg>}
    </>
  );
};

SelectInput.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({ label: PropTypes.string, value: PropTypes.string })
  ),
  outline: PropTypes.bool,
  extraItem: PropTypes.node,
  multiple: PropTypes.bool,
  searchable: PropTypes.bool,
  inputElement: PropTypes.elementType,
  onSingleSelect: PropTypes.func,
  onMultipleSelect: PropTypes.func,
  onDelete: PropTypes.func,
  validate: PropTypes.func,
  disabled: PropTypes.bool,
  optionComponent: PropTypes.elementType,
  helperText: PropTypes.string,
  initialValue: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  error: PropTypes.string,
  containerClassName: PropTypes.string,
};

export default SelectInput;
