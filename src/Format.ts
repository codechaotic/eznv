export namespace Format {
  export interface Raw {
    [x: string]: string
  }

  export interface Document {
    type: 'Document',
    body: Assignment[]
  }

  export interface Assignment {
    type: 'Assignment'
    lhs: string
    rhs: Segment[]
  }

  export type Segment = Variable | Literal

  export interface Variable {
    type: 'Variable'
    value: string
  }

  export interface Literal {
    type: 'Literal'
    value: string
  }
}