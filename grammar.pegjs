{
  function hexcode (d) {
    return String.fromCharCode(parseInt(d, 16))
  }

  function merge (a, b) {
    return Object.assign({}, a, b)
  }

  function str (s) {
    return s.join('')
  }

  function literal (s) {
    return { type: 'Literal', value: s }
  }

  function varsub (s) {
  	return { type: 'Variable', value: s }
  }

  function doc (b) {
    return { type: 'Document', body: b }
  }

  function assign (l,r) {
    return { type: 'Assignment', lhs: l, rhs: r }
  }

  function filter (l) {
    return l.filter(x=>x.value)
  }

  function trim (l) {
  	return l.filter(x=>x)
  }
}

Document
  = body:Body { return doc(body) }
Body
  = lines:(
      _ exp:Expression? _ Newline recur:Body { return [exp].concat(recur) }
    / _ exp:Expression? _ { return [exp] }
  )
  { return trim(lines) }

Newline
  = "\n"
  / "\r"
  / "\r\n"

Expression
  = assignment:Assignment _ Comment { return assignment }
  / Assignment
  / Comment

Comment
  = "#" _ comment:Character* { return null }

Assignment
  = key:Variable _ "=" _ value:Value { return assign(key, value) }

Value
  = DoubleQuoteValue
  / SingleQuoteValue
  / NoQuoteValue

NoQuoteValue
  = lit:NoQuoteLiteral { return [literal(lit)] }

DoubleQuoteValue
  = DoubleQuote value:DoubleQuoteTemplate DoubleQuote { return value }

DoubleQuoteTemplate
  = lit:DoubleQuoteLiteral sub:Sub recur:DoubleQuoteTemplate
    { return filter([literal(lit), varsub(sub)].concat(recur)) }

  / lit:DoubleQuoteLiteral "$" recur:DoubleQuoteTemplate
    { return filter([literal(lit+"$")].concat(recur)) }

  / lit:DoubleQuoteLiteral
    { return [literal(lit)] }

SingleQuoteValue
  = SingleQuote value:SingleQuoteTemplate SingleQuote { return value }

SingleQuoteTemplate
  = lit:SingleQuoteLiteral sub:Sub recur:SingleQuoteTemplate
    { return filter([literal(lit), varsub(sub)].concat(recur))}

  / lit:SingleQuoteLiteral "$" recur:SingleQuoteTemplate
    { return filter([literal(lit+"$")].concat(recur)) }

  / lit:SingleQuoteLiteral
    { return [literal(lit)] }

DoubleQuoteLiteral
  = value:DoubleQuoteSequence*
  { return str(value) }

SingleQuoteLiteral
  = value:SingleQuoteSequence*
  { return str(value) }

NoQuoteLiteral "raw value"
  = value:NoQuoteSequence*
  { return str(value) }

Sub
  = "$" variable:Variable { return variable }
  / "${" variable:Variable "}" { return variable }

Variable "variable" = name:VariableName { return name.join('_') }

VariableName "variable name"
  = word:VariableWord "_" words:VariableName { return [word].concat(words) }
  / word:VariableWord { return [word] }

VariableWord "variable word"
  = first:[A-Za-z] rest:[A-Za-z0-9]* { return first + rest.join('') }

NoQuoteSequence
  = NoQuoteSafeCharacter
  / NoQuoteEscapeSequence

DoubleQuoteSequence
  = DoubleQuoteSafeCharacter
  / DoubleQuoteEscapeSequence

SingleQuoteSequence
  = SingleQuoteSafeCharacter
  / SingleQuoteEscapeSequence

NoQuoteEscapeSequence
  = EscapeCharacter sequence:(
      EscapeCharacter
    / "#"
  )
  { return sequence }

DoubleQuoteEscapeSequence
  = QuoteEscapeSequence
  / EscapeCharacter sequence:(
      DoubleQuote
  )
  { return sequence }

SingleQuoteEscapeSequence
  = QuoteEscapeSequence
  / EscapeCharacter sequence:(
      SingleQuote
  )
  { return sequence }

QuoteEscapeSequence
  = EscapeCharacter sequence:(
      EscapeCharacter
    / "$"
    / "/"
    / "b" { return "\b"; }
    / "f" { return "\f"; }
    / "n" { return "\n"; }
    / "r" { return "\r"; }
    / "t" { return "\t"; }
    / "u" digits:HexSequence { return hexcode(digits) }
  )
  { return sequence }

NoQuoteSafeCharacter
  = SafeCharacter
  / SingleQuote
  / DoubleQuote
  / "$"

DoubleQuoteSafeCharacter
  = SafeCharacter
  / SingleQuote
  / "#"

SingleQuoteSafeCharacter
  = SafeCharacter
  / DoubleQuote
  / "#"

Character = [\x20-\u10FFFF]
SafeCharacter = [\x20-\x21\x25-\x26\x28-\x5B\x5D-\u10FFFF]
HexSequence = $(HexDigit HexDigit HexDigit HexDigit)
HexDigit = [0-9a-f]i

EscapeCharacter = "\\"
DoubleQuote = '"'
SingleQuote = "'"

_ = [ \t]*
