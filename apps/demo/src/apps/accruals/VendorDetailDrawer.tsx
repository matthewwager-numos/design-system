import { Header, Modal, ModalBody, Setting, SettingsCard } from "@numosai/ui";
import { accrualCurrency, vendorTotals } from "../../data/accruals";
import type { AccrualVendor } from "../../data/accruals";

export interface VendorDetailDrawerProps {
  vendor: AccrualVendor | null;
  onClose: () => void;
}

/**
 * Vendor details, opened from a vendor name link — modeled on
 * `TaskDetailDrawer`'s own drawer structure (`Header variant="modal"` +
 * one or more `SettingsCard`s), but fully read-only: unlike tasks or
 * employees, `ACCRUAL_VENDORS` is static seed data, not a `useState`/
 * Context store, so there's nothing here to actually save back to —
 * `editing={false}` locks both cards out of edit mode rather than
 * offering a Save that would silently do nothing.
 */
export function VendorDetailDrawer({ vendor, onClose }: VendorDetailDrawerProps) {
  const totals = vendor ? vendorTotals(vendor) : null;

  return (
    <Modal variant="drawer" side="right" open={vendor !== null} onOpenChange={(next) => !next && onClose()}>
      {vendor && totals ? (
        <>
          <Header variant="modal" title={vendor.name} onClose={onClose} />
          <ModalBody>
            <div className="drawer-body-stack">
              <SettingsCard title="Accrual summary" editing={false}>
                <Setting label="Total accrual" value={accrualCurrency.format(totals.accrualAmount)} />
                <Setting label="YTD actual" value={accrualCurrency.format(totals.ytdActual)} />
              </SettingsCard>

              <SettingsCard title="Subsidiaries" editing={false}>
                {vendor.subsidiaries.map((subsidiary) => (
                  <Setting
                    key={subsidiary.id}
                    label={subsidiary.name}
                    value={`${accrualCurrency.format(subsidiary.accrualAmount)} · ${subsidiary.category}`}
                  />
                ))}
              </SettingsCard>
            </div>
          </ModalBody>
        </>
      ) : null}
    </Modal>
  );
}
