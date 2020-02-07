import { EZBoolean, EZBooleanOptions } from './EZBoolean'
import { EZString, EZStringOptions } from './EZString'
import { EZInteger, EZIntegerOptions } from './EZInteger'
import { EZNumber, EZNumberOptions } from './EZNumber'
import { EZLoadType, EZSchema, EZProperties } from './EZSchema'

export namespace EZ {
  export type LoadType <S extends EZSchema<any>> = S extends EZSchema<infer U> ? EZLoadType<U> : never

  export function Schema <P extends EZProperties> (properties: P) {
    return new EZSchema<P>(properties)
  }

  export function Boolean (options?: EZStringOptions<never | true, never | null>): EZBoolean<true, false>
  export function Boolean (options?: EZBooleanOptions<never | true, boolean>): EZBoolean<true, true>
  export function Boolean (options?: EZBooleanOptions<false, never | null>): EZBoolean<false, false>
  export function Boolean (options?: EZBooleanOptions<false, boolean>): EZBoolean<false, true>
  export function Boolean (options: EZBooleanOptions<any, any> = {}) {
    return new EZBoolean(options)
  }

  export function Integer (options?: EZIntegerOptions<never | true, never | null>): EZInteger<true, false>
  export function Integer (options?: EZIntegerOptions<never | true, number>): EZInteger<true, true>
  export function Integer (options?: EZIntegerOptions<false, never | null>): EZInteger<false, false>
  export function Integer (options?: EZIntegerOptions<false, number>): EZInteger<false, true>
  export function Integer (options: EZIntegerOptions<any, any> = {}) {
    return new EZInteger(options)
  }

  export function Number (options?: EZNumberOptions<never | true, never | null>): EZNumber<true, false>
  export function Number (options?: EZNumberOptions<never | true, number>): EZNumber<true, true>
  export function Number (options?: EZNumberOptions<false, never | null>): EZNumber<false, false>
  export function Number (options?: EZNumberOptions<false, number>): EZNumber<false, true>
  export function Number (options: EZNumberOptions<any, any> = {}) {
    return new EZNumber(options)
  }

  export function String (options?: EZStringOptions<never | true, never | null>): EZString<true, false>
  export function String (options?: EZStringOptions<never | true, string>): EZString<true, true>
  export function String (options?: EZStringOptions<false, never | null>): EZString<false, false>
  export function String (options?: EZStringOptions<false, string>): EZString<false, true>
  export function String (options: EZStringOptions<any, any> = {}) {
    return new EZString(options)
  }
}

export default EZ
