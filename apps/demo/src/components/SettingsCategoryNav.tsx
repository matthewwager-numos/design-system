import { Select, Tab, TabList, Tabs } from "@numosai/ui";

export interface SettingsCategory<T extends string> {
  id: T;
  label: string;
}

export interface SettingsCategoryNavProps<T extends string> {
  categories: SettingsCategory<T>[];
  value: T;
  onChange: (value: T) => void;
}

/**
 * Category switcher for the shared Settings List & Detail template
 * (see .settings-layout in app.css): a right-aligned vertical tab list
 * beside the card on desktop, collapsing to a single Select pinned above
 * the same continuous, always-visible detail below the breakpoint.
 */
export function SettingsCategoryNav<T extends string>({ categories, value, onChange }: SettingsCategoryNavProps<T>) {
  return (
    <>
      <Select
        className="settings-category-select"
        label={<span className="ds-sr-only">Category</span>}
        value={value}
        onChange={(next) => onChange(next as T)}
        options={categories.map((category) => ({ value: category.id, label: category.label }))}
      />
      <Tabs orientation="vertical" value={value} onValueChange={(next) => onChange(next as T)} className="settings-category-tabs">
        <TabList align="end">
          {categories.map((category) => (
            <Tab key={category.id} value={category.id}>
              {category.label}
            </Tab>
          ))}
        </TabList>
      </Tabs>
    </>
  );
}
