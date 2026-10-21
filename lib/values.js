import {evaluationError} from './errors.js'
import {MIN_UINT, MAX_UINT} from './globals.js'

export class UnsignedInt {
  #value
  constructor(value) {
    this.verify(typeof value === 'bigint' ? value : BigInt(value))
  }

  get value() {
    return this.#value
  }

  valueOf() {
    return this.#value
  }

  toString() {
    return `${this.#value}`
  }

  verify(v) {
    if (v < MIN_UINT || v > MAX_UINT) {
      throw evaluationError('numeric_overflow', 'Unsigned integer overflow')
    }
    this.#value = v
  }

  get [Symbol.toStringTag]() {
    return `value = ${this.#value}`
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return `UnsignedInteger { value: ${this.#value} }`
  }
}

const billion = 1_000_000_000
const billionBigInt = 1_000_000_000n

export class Duration {
  #seconds
  #nanos

  constructor(seconds, nanos = 0) {
    this.#seconds = BigInt(seconds)
    this.#nanos = nanos
  }

  get seconds() {
    return this.#seconds
  }

  get nanos() {
    return this.#nanos
  }

  valueOf() {
    return Number(this.#seconds) * 1000 + this.#nanos / 1_000_000
  }

  static fromMilliseconds(ms) {
    const totalNanos = BigInt(Math.trunc(ms * 1_000_000))
    const seconds = totalNanos / billionBigInt
    const nanos = Number(totalNanos % billionBigInt)
    return new Duration(seconds, nanos)
  }

  addDuration(other) {
    const nanos = this.#nanos + other.nanos
    return new Duration(
      this.#seconds + other.seconds + BigInt(Math.floor(nanos / billion)),
      nanos % billion
    )
  }

  subtractDuration(other) {
    const nanos = this.#nanos - other.nanos
    return new Duration(
      this.#seconds - other.seconds + BigInt(Math.floor(nanos / billion)),
      (nanos + billion) % billion
    )
  }

  extendTimestamp(ts) {
    return new Date(
      ts.getTime() + Number(this.#seconds) * 1000 + Math.floor(this.#nanos / 1_000_000)
    )
  }

  subtractTimestamp(ts) {
    return new Date(
      ts.getTime() - Number(this.#seconds) * 1000 - Math.floor(this.#nanos / 1_000_000)
    )
  }

  toString() {
    const nanos = this.#nanos
      ? (this.#nanos / billion)
          .toLocaleString('en-US', {useGrouping: false, maximumFractionDigits: 9})
          .slice(1)
      : ''
    return `${this.#seconds}${nanos}s`
  }

  getHours() {
    return this.#seconds / 3600n
  }

  getMinutes() {
    return this.#seconds / 60n
  }

  getSeconds() {
    return this.#seconds
  }

  getMilliseconds() {
    return this.#seconds * 1000n + BigInt(Math.floor(this.#nanos / 1000000))
  }

  get [Symbol.toStringTag]() {
    return 'google.protobuf.Duration'
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return `google.protobuf.Duration { seconds: ${this.#seconds}, nanos: ${this.#nanos} }`
  }
}
