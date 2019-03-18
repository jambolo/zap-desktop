import { createSelector } from 'reselect'
import { send } from 'redux-electron-ipc'
import errorToUserFriendly from 'lib/utils/userFriendlyErrors'
import delay from 'lib/utils/delay'
import { fetchBalance } from './balance'
import { fetchChannels } from './channels'

// ------------------------------------
// Constants
// ------------------------------------
export const SET_PAYMENT = 'SET_PAYMENT'
export const GET_PAYMENTS = 'GET_PAYMENTS'
export const RECEIVE_PAYMENTS = 'RECEIVE_PAYMENTS'
export const SEND_PAYMENT = 'SEND_PAYMENT'
export const PAYMENT_SUCCESSFUL = 'PAYMENT_SUCCESSFUL'
export const PAYMENT_FAILED = 'PAYMENT_FAILED'
export const PAYMENT_COMPLETE = 'PAYMENT_COMPLETE'

// ------------------------------------
// Helpers
// ------------------------------------

// Decorate transaction object with custom/computed properties.
const decoratePayment = payment => {
  payment.type = 'payment'
  return payment
}

// ------------------------------------
// Actions
// ------------------------------------
export function setPayment(payment) {
  return {
    type: SET_PAYMENT,
    payment,
  }
}

export function getPayments() {
  return {
    type: GET_PAYMENTS,
  }
}

export function sendPayment(data) {
  const payment = Object.assign({}, data, {
    status: 'sending',
    timestamp: Math.round(new Date() / 1000),
  })
  return {
    type: SEND_PAYMENT,
    payment,
  }
}

// Send IPC event for payments
export const fetchPayments = () => dispatch => {
  dispatch(getPayments())
  dispatch(send('lnd', { msg: 'payments' }))
}

// Receive IPC event for payments
export const receivePayments = (event, { payments }) => dispatch => {
  payments.forEach(payment => {
    decoratePayment(payment)
  })
  dispatch({ type: RECEIVE_PAYMENTS, payments })
}

export const payInvoice = ({ payReq, amt, feeLimit }) => dispatch => {
  const data = { paymentRequest: payReq, feeLimit, amt }
  dispatch(send('lnd', { msg: 'sendPayment', data }))
  dispatch(sendPayment(data))
}

// Receive IPC event for successful payment.
export const paymentSuccessful = (event, { paymentRequest }) => async (dispatch, getState) => {
  const state = getState()
  const { timestamp } = state.payment.paymentsSending.find(p => p.paymentRequest === paymentRequest)

  // Ensure payment stays in sending state for at least 2 seconds.
  await delay(2000 - (Date.now() - timestamp * 1000))

  // Mark the payment as successful.
  dispatch({ type: PAYMENT_SUCCESSFUL, paymentRequest })

  // Wait for another second.
  await delay(1000)

  // Mark the payment as successful.
  dispatch({ type: PAYMENT_COMPLETE, paymentRequest })

  // Refetch payments.
  // TODO: dont do a full refetch, rather append new tx to list.
  dispatch(fetchPayments())

  // Fetch new balance.
  dispatch(fetchBalance())

  // Fetch updated channels.
  dispatch(fetchChannels())
}

// Receive IPC event for failed payment.
export const paymentFailed = (event, { paymentRequest, error }) => async (dispatch, getState) => {
  const state = getState()
  const { timestamp } = state.payment.paymentsSending.find(p => p.paymentRequest === paymentRequest)

  // Ensure payment stays in sending state for at least 2 seconds.
  await delay(2000 - (Date.now() - timestamp * 1000))

  // Mark the payment as failed.
  dispatch({ type: PAYMENT_FAILED, paymentRequest, error: errorToUserFriendly(error) })
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [GET_PAYMENTS]: state => ({ ...state, paymentLoading: true }),
  [RECEIVE_PAYMENTS]: (state, { payments }) => ({ ...state, paymentLoading: false, payments }),
  [SET_PAYMENT]: (state, { payment }) => ({ ...state, payment }),
  [SEND_PAYMENT]: (state, { payment }) => ({
    ...state,
    paymentsSending: [...state.paymentsSending, payment],
  }),
  [PAYMENT_SUCCESSFUL]: (state, { paymentRequest }) => {
    return {
      ...state,
      paymentsSending: state.paymentsSending.map(item => {
        if (item.paymentRequest !== paymentRequest) {
          return item
        }
        return {
          ...item,
          status: 'successful',
        }
      }),
    }
  },
  [PAYMENT_FAILED]: (state, { paymentRequest, error }) => {
    return {
      ...state,
      paymentsSending: state.paymentsSending.map(item => {
        if (item.paymentRequest !== paymentRequest) {
          return item
        }
        return {
          ...item,
          status: 'failed',
          error,
        }
      }),
    }
  },
  [PAYMENT_COMPLETE]: (state, { paymentRequest }) => {
    return {
      ...state,
      paymentsSending: state.paymentsSending.filter(item => item.paymentRequest !== paymentRequest),
    }
  },
}

const modalPaymentSelector = state => state.payment.payment

const paymentSelectors = {}

paymentSelectors.paymentModalOpen = createSelector(
  modalPaymentSelector,
  payment => !!payment
)

export { paymentSelectors }

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  paymentLoading: false,
  payment: null,
  payments: [],
  paymentsSending: [],
}

export default function paymentReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
