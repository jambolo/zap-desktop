import { defineMessages } from 'react-intl'

/* eslint-disable max-len */
export default defineMessages({
  amount: 'Amount',
  created: 'Created',
  current_value: 'Current value',
  button_text: 'Request',
  copy_button_text: 'Copy invoice',
  cancel_button_text: 'Cancel invoice',
  settle_button_text: 'Settle invoice',
  address_copied_notification_title: 'Address copied',
  address_copied_notification_description: 'Payment request has been copied to your clipboard',
  payment_request: 'Payment request',
  payment_request_keysend: 'Received via pubkey (keysend)',
  total: 'Total',
  memo: 'Memo',
  fallback_address: 'Fallback address',
  memo_placeholder: 'For example "Dinner last night"',
  add_error: 'An error has occurred',
  routing_hints_label: 'Include routing hints',
  routing_hints_tooltip: 'Whether this invoice should include routing hints for private channels.',
  hold_invoice_label: 'Hold invoice',
  hold_invoice_tooltip: 'Enables manual control the invoice settlement process.',
  preimage_placeholder: 'Preimage (required to settle invoice)',
  memo_tooltip:
    'Add some describer text to your payment request for the recipient to see when paying.',
  not_paid: 'not paid',
  cancelled: 'cancelled',
  paid: 'paid',
  settled: 'settled',
  qrcode: 'QR-Code',
  status: 'Request Status',
  title: 'Receive',
  description:
    'Zap will generate a QR-Code and a lightning invoice so that you can receive {chain} ({ticker}) through the Lightning Network.',
  expires: 'Expires',
  expired: 'Expired',
  max_capacity_warning:
    'Request is above your maximum one time receive capacity of {capacity} {unit}',
  request_settle_dialog_confirm_button_text: 'Confirm',
  request_settle_dialog_cancel_button_text: 'Cancel',
  request_settle_dialog_dialog_header: 'Settle invoice',
  request_settle_dialog_body:
    'This invoice has been paid and needs to be manually settled in order to finalise the payment.',
  request_settle_dialog_preimage_description:
    'pre-image that should be used to settle the invoice.',
})
