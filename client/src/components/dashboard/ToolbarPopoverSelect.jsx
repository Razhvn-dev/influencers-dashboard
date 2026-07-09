import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Icon, OptionList, Popover, Text } from '@shopify/polaris';
import { SelectIcon } from '@shopify/polaris-icons';

const MENU_ROW_HEIGHT = 40;
const MENU_CHROME_HEIGHT = 12;
const OPEN_AFTER_SCROLL_MS = 180;

export default function ToolbarPopoverSelect({
  label,
  options,
  value,
  onChange,
  className = '',
  labelHidden = false,
  compact = false,
}) {
  const [open, setOpen] = useState(false);
  const activatorRef = useRef(null);
  const openTimerRef = useRef(null);

  const selectedLabel = useMemo(() => {
    const match = options.find((option) => option.value === value);
    return match?.label || options[0]?.label || '';
  }, [options, value]);

  useEffect(
    () => () => {
      if (openTimerRef.current) {
        window.clearTimeout(openTimerRef.current);
      }
    },
    []
  );

  const toggleOpen = useCallback(() => {
    if (open) {
      setOpen(false);
      return;
    }

    const activator = activatorRef.current;
    const menuHeight = Math.min(options.length * MENU_ROW_HEIGHT + MENU_CHROME_HEIGHT, 320);

    if (activator) {
      const rect = activator.getBoundingClientRect();
      const availableBelow = window.innerHeight - rect.bottom;

      if (availableBelow < menuHeight + 16) {
        activator.scrollIntoView({ block: 'center', behavior: 'smooth' });

        if (openTimerRef.current) {
          window.clearTimeout(openTimerRef.current);
        }

        openTimerRef.current = window.setTimeout(() => {
          setOpen(true);
          openTimerRef.current = null;
        }, OPEN_AFTER_SCROLL_MS);
        return;
      }
    }

    setOpen(true);
  }, [open, options.length]);

  const close = useCallback(() => setOpen(false), []);

  const handleChange = useCallback(
    (selected) => {
      onChange(selected[0] ?? '');
      close();
    },
    [close, onChange]
  );

  const activator = (
    <button
      ref={activatorRef}
      type="button"
      className={`crm-v2-toolbar-popover-select__activator${open ? ' crm-v2-toolbar-popover-select__activator--open' : ''}`}
      aria-expanded={open}
      aria-haspopup="listbox"
      onClick={toggleOpen}
    >
      <span className="crm-v2-toolbar-popover-select__value">{selectedLabel}</span>
      <span className="crm-v2-toolbar-popover-select__chevron" aria-hidden="true">
        <Icon source={SelectIcon} tone="subdued" />
      </span>
    </button>
  );

  return (
    <Box
      className={`crm-v2-toolbar__field crm-v2-toolbar-popover-select${compact ? ' crm-v2-toolbar-popover-select--compact' : ''} ${className}`.trim()}
    >
      {labelHidden ? null : (
        <Text as="span" variant="bodySm" tone="subdued">
          {label}
        </Text>
      )}
      <Popover
        active={open}
        activator={activator}
        onClose={close}
        preferredAlignment="left"
        preferredPosition="below"
        zIndexOverride={520}
      >
        <Box className="crm-v2-toolbar-popover-select__menu">
          <OptionList
            options={options.map((option) => ({
              value: option.value,
              label: option.label,
              active: option.value === value,
            }))}
            selected={value ? [value] : ['']}
            onChange={handleChange}
          />
        </Box>
      </Popover>
    </Box>
  );
}
