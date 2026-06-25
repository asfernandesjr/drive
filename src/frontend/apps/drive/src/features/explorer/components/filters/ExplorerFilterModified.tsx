import { Filter, FilterOption } from "@gouvfr-lasuite/ui-kit";
import { CalendarRange } from "@gouvfr-lasuite/cunningham-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Key } from "react-aria-components";
import {
  DatePreset,
  DateRange,
  presetRange,
} from "@/features/explorer/utils/dateFilters";
import { ALL, getResetOption } from "./filterUtils";

const MODIFIED_PRESETS: DatePreset[] = [
  "today",
  "last_7_days",
  "last_30_days",
  "this_year",
  "more_than_a_year",
];
const MODIFIED_CUSTOM = "custom";

export const ExplorerFilterModified = (props: {
  value: DateRange | null;
  onChange: (range: DateRange | null) => void;
}) => {
  const { t } = useTranslation();
  const [preset, setPreset] = useState<Key | null>(null);
  const [range, setRange] = useState<DateRange | null>(null);

  // Reset the local selection when the range is cleared from outside ( top down ).
  useEffect(() => {
    if (!props.value) {
      setPreset(null);
      setRange(null);
    }
  }, [props.value]);

  const onChangeRef = useRef(props.onChange);
  onChangeRef.current = props.onChange;

  const options: FilterOption[] = useMemo(
    () => [
      { ...getResetOption(t), showSeparator: true },
      ...MODIFIED_PRESETS.map((value) => ({
        label: t(`explorer.filters.modified.options.${value}`),
        value,
        render: () => (
          <div className="explorer__filters__item">
            {t(`explorer.filters.modified.options.${value}`)}
          </div>
        ),
      })),
      {
        label: range
          ? `${range.updated_at_after} - ${range.updated_at_before}`
          : t("explorer.filters.modified.options.custom"),
        value: MODIFIED_CUSTOM,
        render: () => (
          <div className="explorer__filters__item">
            {range
              ? `${range.updated_at_after} - ${range.updated_at_before}`
              : t("explorer.filters.modified.options.custom")}
          </div>
        ),
        subContent: ({ select, close }) => (
          <CalendarRange
            onChange={(range) => {
              const rangeFormatted =
                range?.start && range?.end
                  ? {
                      updated_at_after: range.start.toString(),
                      updated_at_before: range.end.toString(),
                    }
                  : null;
              onChangeRef.current(rangeFormatted);
              setRange(rangeFormatted);
              select();
            }}
            onOk={() => {
              select();
              close();
            }}
            onCancel={close}
          />
        ),
      },
    ],
    [t, range],
  );

  const onSelectionChange = (key: Key | null) => {
    if (key === ALL) {
      setPreset(null);
      setRange(null);
      props.onChange(null);
      return;
    }
    if (key === MODIFIED_CUSTOM) {
      setPreset(key);
      return;
    }
    setPreset(key);
    setRange(null);
    props.onChange(presetRange(key as DatePreset));
  };

  return (
    <Filter
      label={t("explorer.filters.modified.label")}
      options={options}
      value={preset}
      onChange={onSelectionChange}
    />
  );
};
