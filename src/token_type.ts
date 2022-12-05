export enum TokenType {
  // Single Char Tokens
  LEFT_PAREN,
  RIGHT_PAREN,
  LEFT_BRACE,
  RIGHT_BRACE,
  SEMICOLON,
  COMMA,
  DOT,
  MINUS,
  PLUS,
  STAR,
  SLASH,
  MOD,
  // Single or double-char tokens
  BANG,
  BANG_EQUAL,
  EQUAL,
  EQUAL_EQUAL,
  GREATER,
  GREATER_EQUAL,
  LESS,
  LESS_EQUAL,
  // Literals
  IDENTIFIER,
  STRING,
  NUMBER,
  // Keywords
  AND,
  OR,
  NOT,
  TRUE,
  FALSE,
  NIL,
  IF,
  ELSE,
  CLASS,
  FUN,
  FOR,
  WHILE,
  RETURN,
  SUPER,
  THIS,
  VAR,
  // Special Tokens
  EOF,
}
