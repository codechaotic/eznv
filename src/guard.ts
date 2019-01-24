export namespace Guard {
  export function isBool (x: any): x is boolean {
    return typeof x === 'boolean'
  }

  export function isString (x: any): x is string {
    return typeof x === 'string'
  }

  export function isNumber (x: any): x is number {
    return typeof x === 'number'
  }

  export function isInteger (x: any): boolean {
    return isNumber(x) && Number.isInteger(x)
  }

  export function isRegExp (x: any): boolean {
    try {
      new RegExp(x).test('')
      return true
    } catch (e) {
      return false
    }
  }

  export function isUndefined (x: any): boolean {
    return x === undefined
  }

  export function isDefined (x: any): boolean {
    return !isUndefined(x)
  }
}
