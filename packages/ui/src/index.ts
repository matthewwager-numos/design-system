// Public API of @numosai/ui — everything consumers can import lives here.

export { Button } from "./Button";
export type { ButtonProps } from "./Button";

export { Badge } from "./Badge";
export type { BadgeProps, BadgeStatus, BadgeSize } from "./Badge";

export { Label } from "./Label";
export type { LabelProps, LabelStatus, LabelSize } from "./Label";

export { FieldLabel } from "./FieldLabel";
export type { FieldLabelProps, FieldLabelSize } from "./FieldLabel";

export { AppIcon } from "./AppIcon";
export type { AppIconProps, AppIconName } from "./AppIcon";

export { TextInput } from "./TextInput";
export type { TextInputProps, TextInputSize, TextInputStatus } from "./TextInput";

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "./DropdownMenu";
export type {
  DropdownMenuProps,
  DropdownMenuTriggerProps,
  DropdownMenuContentProps,
  DropdownMenuItemProps,
  DropdownMenuSize,
  DropdownMenuPlacement,
} from "./DropdownMenu";

export { Select } from "./Select";
export type { SelectProps, SelectOption, SelectSize, SelectStatus } from "./Select";

export { Banner } from "./Banner";
export type { BannerProps, BannerStatus } from "./Banner";

export { Alert } from "./Alert";
export type { AlertProps, AlertStatus, AlertPosition } from "./Alert";

export { ProgressBar } from "./ProgressBar";
export type { ProgressBarProps, ProgressBarStatus, ProgressBarScaleDirection, ProgressBarMode } from "./ProgressBar";

export { Avatar } from "./Avatar";
export type { AvatarProps, AvatarSize, AvatarType, AvatarColor } from "./Avatar";

export { AvatarGroup } from "./AvatarGroup";
export type { AvatarGroupProps, AvatarGroupOrientation } from "./AvatarGroup";

export { Tooltip } from "./Tooltip";
export type { TooltipProps, TooltipPlacement, TooltipTriggerMode } from "./Tooltip";

export { Tabs, TabList, Tab, TabPanel } from "./Tabs";
export type { TabsProps, TabsOrientation, TabListProps, TabProps, TabPanelProps } from "./Tabs";

export { Navigation, NavSection, NavItem, NavUser } from "./Navigation";
export type { NavigationProps, NavSectionProps, NavItemProps, NavSubItem, NavUserProps } from "./Navigation";

export { Header } from "./Header";
export type { HeaderProps, HeaderVariant } from "./Header";

export { DetailHeader } from "./DetailHeader";
export type { DetailHeaderProps } from "./DetailHeader";

export { Checkbox, CheckboxGroup } from "./Checkbox";
export type { CheckboxProps, CheckboxSize, CheckboxGroupProps, CheckboxGroupSize } from "./Checkbox";

export { Radio, RadioGroup } from "./Radio";
export type { RadioProps, RadioGroupProps, RadioGroupOrientation, RadioGroupSize } from "./Radio";

export { SegmentedControl, SegmentedControlOption } from "./SegmentedControl";
export type { SegmentedControlProps, SegmentedControlSize, SegmentedControlOptionProps } from "./SegmentedControl";

export { Toggle } from "./Toggle";
export type { ToggleProps, ToggleSize, ToggleLabelPlacement } from "./Toggle";

export { Textarea } from "./Textarea";
export type { TextareaProps, TextareaSize, TextareaStatus } from "./Textarea";

export { ButtonGroup } from "./ButtonGroup";
export type { ButtonGroupProps, ButtonGroupOrientation } from "./ButtonGroup";

export { Form, FormHeader, FormBody, FormFooter } from "./Form";
export type { FormProps, FormHeaderProps, FormBodyProps, FormFooterProps } from "./Form";

export { ProgressIndicator } from "./ProgressIndicator";
export type { ProgressIndicatorProps, ProgressIndicatorOrientation, ProgressIndicatorStepState, ProgressIndicatorStep } from "./ProgressIndicator";

export { Modal, ModalBody, ModalFooter } from "./Modal";
export type { ModalProps, ModalVariant, ModalSide, ModalBodyProps, ModalFooterProps } from "./Modal";

export { Wizard } from "./Wizard";
export type { WizardProps, WizardStep } from "./Wizard";

export { Slider } from "./Slider";
export type { SliderProps, SliderSize, SliderValue } from "./Slider";

export { Cell } from "./Cell";
export type { CellProps, CellType, CellAction } from "./Cell";

export { Column } from "./Column";
export type { ColumnProps } from "./Column";

export { SearchInput } from "./SearchInput";
export type { SearchInputProps, SearchInputSize, SearchInputStatus, SearchInputOption } from "./SearchInput";

export { Pagination } from "./Pagination";
export type { PaginationProps } from "./Pagination";

export { MobileNav } from "./MobileNav";
export type { MobileNavProps } from "./MobileNav";

export { MobileAppHeader } from "./MobileAppHeader";
export type { MobileAppHeaderProps } from "./MobileAppHeader";

export { Setting } from "./Setting";
export type { SettingProps, SettingType, SettingOption } from "./Setting";

export { SettingsCard } from "./SettingsCard";
export type { SettingsCardProps } from "./SettingsCard";

// Not a component — a small utility `<Wizard>` uses internally to pin its
// own footer, and that consuming apps can reuse for the same "fixed chrome
// needs a real measured height, not a guess" problem (e.g. a fixed mobile
// nav bar).
export { useMeasuredHeightVar } from "./hooks/useMeasuredHeightVar";
