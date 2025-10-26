# JsonLogic Operations Reference

## Overview

JsonLogic allows you to build complex rules, serialize them as JSON, and share them between front-end and back-end systems. This document describes all available operations in the RuleFlow plugin's JsonLogic implementation.

## Accessing Data

### var

**Operator**: `var`
**Purpose**: Retrieve data from the provided data object
**Arguments**:
- `path` (string|array): Variable path or property name
- `defaultValue` (mixed, optional): Default value if variable doesn't exist

**Behavior**:
- Supports dot-notation for nested properties (`"user.name"`)
- Supports array index access (`1` for second element)
- Returns `defaultValue` if path doesn't exist
- Empty string path (`""`) returns entire data object
- Array paths support complex nested access

**Edge Cases**:
- Non-existent paths return `defaultValue` or `null`
- Numeric strings are treated as array indices when appropriate
- Null data objects return `defaultValue`

**Factory Methods**:
```php
JsonLogicRuleFactory::var('field_name')
JsonLogicRuleFactory::var('user.profile.name', 'Unknown')
JsonLogicRuleFactory::var(['nested', 'path'])
```

## Logic and Boolean Operations

### and

**Operator**: `and`
**Purpose**: Logical AND operation
**Arguments**:
- `rules` (array): Array of rules/values to AND together

**Behavior**:
- Returns first falsy argument or last argument if all truthy
- Short-circuits on first falsy value
- Empty array returns `true`
- Single argument returns that argument

**Edge Cases**:
- Empty arrays are falsy in JsonLogic
- String "0" is truthy (differs from PHP)
- `null` and `false` are falsy

**Factory Methods**:
```php
JsonLogicRuleFactory::and([rule1, rule2, rule3])
```

### or

**Operator**: `or`
**Purpose**: Logical OR operation
**Arguments**:
- `rules` (array): Array of rules/values to OR together

**Behavior**:
- Returns first truthy argument or last argument if all falsy
- Short-circuits on first truthy value
- Empty array returns `false`
- Single argument returns that argument

**Edge Cases**:
- Empty arrays are falsy
- String "0" is truthy
- Zero (0) is falsy

**Factory Methods**:
```php
JsonLogicRuleFactory::or([rule1, rule2, rule3])
```

### not (!)

**Operator**: `!`
**Purpose**: Logical negation
**Arguments**:
- `rule` (mixed): Value or rule to negate

**Behavior**:
- Returns boolean opposite of truthiness
- Follows JsonLogic truthiness rules
- Can accept single non-array argument

**Edge Cases**:
- Empty arrays are falsy, so `![]` returns `true`
- String "0" is truthy, so `!"0"` returns `false`

**Factory Methods**:
```php
JsonLogicRuleFactory::not(rule)
```

### !! (Double Bang)

**Operator**: `!!`
**Purpose**: Cast to boolean (double negation)
**Arguments**:
- `value` (mixed): Value to cast to boolean

**Behavior**:
- Converts value to boolean using JsonLogic truthiness rules
- Equivalent to `!(!value)`
- Useful for explicit boolean conversion

**Edge Cases**:
- Empty arrays return `false`
- String "0" returns `true`
- Whitespace strings return `true`

**Factory Methods**:
```php
JsonLogicRuleFactory::doubleBang(value)
JsonLogicRuleFactory::fieldNotEmpty('field_name') // Uses !! internally
```

### all

**Operator**: `all`
**Purpose**: Check if all elements in collection satisfy condition
**Arguments**:
- `collection` (array|JsonLogicRule): Collection to check
- `condition` (JsonLogicRule|array): Condition to evaluate for each element

**Behavior**:
- Returns `true` if all elements pass condition
- Returns `false` if any element fails condition
- Empty collections return `true`
- Condition evaluated with each element as context

**Edge Cases**:
- Empty arrays return `true`
- Non-array collections are converted to arrays
- Condition context uses `{"var":""}` to access current element

**Factory Methods**:
```php
JsonLogicRuleFactory::all(collection, condition)
```

### some

**Operator**: `some`
**Purpose**: Check if any element in collection satisfies condition
**Arguments**:
- `collection` (array|JsonLogicRule): Collection to check
- `condition` (JsonLogicRule|array): Condition to evaluate for each element

**Behavior**:
- Returns `true` if any element passes condition
- Returns `false` if no elements pass condition
- Empty collections return `false`
- Short-circuits on first passing element

**Edge Cases**:
- Empty arrays return `false`
- Non-array collections are converted to arrays
- Condition context uses `{"var":""}` to access current element

**Factory Methods**:
```php
JsonLogicRuleFactory::some(collection, condition)
```

### none

**Operator**: `none`
**Purpose**: Check if no elements in collection satisfy condition
**Arguments**:
- `collection` (array|JsonLogicRule): Collection to check
- `condition` (JsonLogicRule|array): Condition to evaluate for each element

**Behavior**:
- Returns `true` if no elements pass condition
- Returns `false` if any element passes condition
- Empty collections return `true`
- Equivalent to `!some(collection, condition)`

**Edge Cases**:
- Empty arrays return `true`
- Non-array collections are converted to arrays

**Factory Methods**:
```php
JsonLogicRuleFactory::none(collection, condition)
```


## Comparison Operations

### == (Equals)

**Operator**: `==`
**Purpose**: Equality comparison with type coercion
**Arguments**:
- `left` (mixed): Left operand
- `right` (mixed): Right operand

**Behavior**:
- Performs loose equality comparison
- Type coercion applied (similar to JavaScript `==`)
- `1 == "1"` returns `true`
- `0 == false` returns `true`

**Edge Cases**:
- `null == undefined` behavior varies by implementation
- Empty arrays may equal `false` or `0`
- String-to-number coercion follows JavaScript rules

**Factory Methods**:
```php
JsonLogicRuleFactory::equals(left, right)
JsonLogicRuleFactory::fieldEquals('field', value)
JsonLogicRuleFactory::fieldsEquals('field1', 'field2')
```

### === (Strict Equals)

**Operator**: `===`
**Purpose**: Strict equality comparison without type coercion
**Arguments**:
- `left` (mixed): Left operand
- `right` (mixed): Right operand

**Behavior**:
- No type coercion performed
- Both value and type must match
- `1 === "1"` returns `false`

**Edge Cases**:
- `NaN === NaN` returns `false` (JavaScript behavior)
- Object/array comparison by reference, not value

**Factory Methods**:
```php
JsonLogicRuleFactory::strictEquals(left, right)
```

### != (Not Equals)

**Operator**: `!=`
**Purpose**: Inequality comparison with type coercion
**Arguments**:
- `left` (mixed): Left operand
- `right` (mixed): Right operand

**Behavior**:
- Opposite of `==` operator
- Type coercion applied
- `1 != "2"` returns `true`

**Edge Cases**:
- Same coercion rules as `==` but negated result

**Factory Methods**:
```php
JsonLogicRuleFactory::notEquals(left, right)
```

### !== (Strict Not Equals)

**Operator**: `!==`
**Purpose**: Strict inequality comparison without type coercion
**Arguments**:
- `left` (mixed): Left operand
- `right` (mixed): Right operand

**Behavior**:
- Opposite of `===` operator
- No type coercion
- `1 !== "1"` returns `true`

**Edge Cases**:
- Same strict comparison rules as `===` but negated

**Factory Methods**:
```php
JsonLogicRuleFactory::strictNotEquals(left, right)
```

### > (Greater Than)

**Operator**: `>`
**Purpose**: Greater than comparison
**Arguments**:
- `left` (mixed): Left operand
- `right` (mixed): Right operand

**Behavior**:
- Numeric comparison when possible
- String comparison for non-numeric values
- Type coercion to numbers when appropriate

**Edge Cases**:
- String comparisons are lexicographic
- `null` and `undefined` coercion varies
- Date comparisons depend on implementation

**Factory Methods**:
```php
JsonLogicRuleFactory::greaterThan(left, right)
```

### >= (Greater Than or Equal)

**Operator**: `>=`
**Purpose**: Greater than or equal comparison
**Arguments**:
- `left` (mixed): Left operand
- `right` (mixed): Right operand

**Behavior**:
- Combines `>` and `==` logic
- Numeric comparison when possible
- Returns `true` if left > right OR left == right

**Edge Cases**:
- Same as `>` operator plus equality cases

**Factory Methods**:
```php
JsonLogicRuleFactory::greaterThanOrEqual(left, right)
```

### < (Less Than)

**Operator**: `<`
**Purpose**: Less than comparison, also supports between operations
**Arguments**:
- `first` (mixed): First operand (or minimum for between)
- `second` (mixed): Second operand
- `third` (mixed, optional): Third value for maximum for between operation

**Behavior**:
- Two arguments: standard less than comparison
- Three arguments: between operation (first < second < third)
- Numeric comparison when possible

**Edge Cases**:
- Between operation creates AND of two comparisons
- String comparisons are lexicographic
- Type coercion follows JavaScript rules

**Factory Methods**:
```php
JsonLogicRuleFactory::lessThan(first, second)
JsonLogicRuleFactory::between(first, second, third) // Exclusive between
```

### <= (Less Than or Equal)

**Operator**: `<=`
**Purpose**: Less than or equal comparison, also supports between operations
**Arguments**:
- `first` (mixed): First operand (or minimum for between)
- `second` (mixed): Second operand
- `third` (mixed, optional): Third value for maximum for between operation

**Behavior**:
- Two arguments: standard less than or equal comparison
- Three arguments: between operation (first <= third <= second)
- Combines `<` and `==` logic

**Edge Cases**:
- Between operation creates AND of two comparisons
- Inclusive boundaries for between operation

**Factory Methods**:
```php
JsonLogicRuleFactory::lessThanOrEqual(first, second)
JsonLogicRuleFactory::betweenInclusive(first, second, third) // Inclusive between
```


## Numeric Operations

### max

**Operator**: `max`
**Purpose**: Find maximum value from array of values
**Arguments**:
- `values` (array): Array of values to compare

**Behavior**:
- Returns largest numeric value
- String-to-number coercion applied
- Single value arrays return that value
- Empty arrays return `-Infinity` or implementation-specific minimum

**Edge Cases**:
- Non-numeric values may cause unexpected results
- `NaN` values affect comparison
- Mixed types follow JavaScript coercion rules

**Factory Methods**:
```php
JsonLogicRuleFactory::max([value1, value2, value3])
```

### min

**Operator**: `min`
**Purpose**: Find minimum value from array of values
**Arguments**:
- `values` (array): Array of values to compare

**Behavior**:
- Returns smallest numeric value
- String-to-number coercion applied
- Single value arrays return that value
- Empty arrays return `Infinity` or implementation-specific maximum

**Edge Cases**:
- Non-numeric values may cause unexpected results
- `NaN` values affect comparison
- Mixed types follow JavaScript coercion rules

**Factory Methods**:
```php
JsonLogicRuleFactory::min([value1, value2, value3])
```


## Math Operations

### + (Addition)

**Operator**: `+`
**Purpose**: Addition or numeric casting
**Arguments**:
- `values` (array): Array of values to add

**Behavior**:
- Multiple values: sum all values
- Single value: cast to number (unary plus)
- String-to-number coercion applied
- Associative operation (order doesn't matter for pure numbers)

**Edge Cases**:
- Empty array returns `0`
- Non-numeric strings may return `NaN`
- `null` coerces to `0`
- `undefined` coerces to `NaN`

**Factory Methods**:
```php
JsonLogicRuleFactory::add([value1, value2, value3])
```

### - (Subtraction)

**Operator**: `-`
**Purpose**: Subtraction or numeric negation
**Arguments**:
- `values` (array): Array of values (first minus rest, or single value for negation)

**Behavior**:
- Multiple values: first value minus sum of remaining values
- Single value: arithmetic negation (additive inverse)
- String-to-number coercion applied

**Edge Cases**:
- Empty array behavior varies by implementation
- Single value returns its negative
- Non-numeric strings may return `NaN`

**Factory Methods**:
```php
JsonLogicRuleFactory::subtract([minuend, subtrahend1, subtrahend2])
```

### * (Multiplication)

**Operator**: `*`
**Purpose**: Multiplication
**Arguments**:
- `values` (array): Array of values to multiply

**Behavior**:
- Multiplies all values together
- String-to-number coercion applied
- Associative operation
- Empty array typically returns `1` (multiplicative identity)

**Edge Cases**:
- Any `0` value makes result `0`
- `NaN` values make result `NaN`
- Non-numeric strings may return `NaN`

**Factory Methods**:
```php
JsonLogicRuleFactory::multiply([value1, value2, value3])
```

### / (Division)

**Operator**: `/`
**Purpose**: Division
**Arguments**:
- `dividend` (mixed): Dividend (numerator)
- `divisor` (mixed): Divisor (denominator)

**Behavior**:
- Divides dividend by divisor
- String-to-number coercion applied
- Returns floating-point result

**Edge Cases**:
- Division by zero returns `Infinity` or `-Infinity`
- `0 / 0` returns `NaN`
- Non-numeric strings may return `NaN`

**Factory Methods**:
```php
JsonLogicRuleFactory::divide(dividend, divisor)
```

### % (Modulo)

**Operator**: `%`
**Purpose**: Modulo operation (remainder after division)
**Arguments**:
- `dividend` (mixed): Dividend
- `divisor` (mixed): Divisor

**Behavior**:
- Returns remainder after dividend is divided by divisor
- String-to-number coercion applied
- Sign of result typically matches dividend

**Edge Cases**:
- Modulo by zero returns `NaN`
- Negative numbers follow JavaScript modulo rules
- Non-integer values supported

**Factory Methods**:
```php
JsonLogicRuleFactory::modulo(dividend, divisor)
```


## Array Operations

### map

**Operator**: `map`
**Purpose**: Transform each element of an array
**Arguments**:
- `array` (array|JsonLogicRule): Array to transform
- `transform` (JsonLogicRule|array): Transformation logic

**Behavior**:
- Applies transformation to each array element
- Returns new array with transformed values
- Transform logic has access to current element via `{"var":""}`
- Preserves array length

**Edge Cases**:
- Empty arrays return empty arrays
- Non-array inputs are converted to arrays
- Transform context includes current element and index

**Factory Methods**:
```php
JsonLogicRuleFactory::map(array, transformLogic)
```

### filter

**Operator**: `filter`
**Purpose**: Filter array elements based on condition
**Arguments**:
- `array` (array|JsonLogicRule): Array to filter
- `filter` (JsonLogicRule|array): Filter condition

**Behavior**:
- Returns new array with elements that pass filter condition
- Filter logic has access to current element via `{"var":""}`
- Maintains relative order of passing elements
- Reindexes result array starting from 0

**Edge Cases**:
- Empty arrays return empty arrays
- All elements failing filter returns empty array
- Non-array inputs are converted to arrays

**Factory Methods**:
```php
JsonLogicRuleFactory::filter(array, filterLogic)
```

### reduce

**Operator**: `reduce`
**Purpose**: Reduce array to single value using accumulator
**Arguments**:
- `array` (array|JsonLogicRule): Array to reduce
- `reducer` (JsonLogicRule|array): Reducer logic
- `initial` (mixed): Initial accumulator value

**Behavior**:
- Applies reducer to each element with accumulator
- Reducer has access to `{"var":"current"}` and `{"var":"accumulator"}`
- Returns final accumulator value
- Initial value used as starting accumulator

**Edge Cases**:
- Empty arrays return initial value
- No initial value may cause errors in some implementations
- Reducer context includes current element and accumulator

**Factory Methods**:
```php
JsonLogicRuleFactory::reduce(array, reducerLogic, initialValue)
```

Example:
```json
Logic: { "reduce": [ {"var": ""}, {"+": [{"var": "current"}, {"var": "accumulator"}]}, 0 ] }
Data: [1, 2, 3, 4, 5]
Result: 15
```

### merge

**Operator**: `merge`
**Purpose**: Merge multiple arrays into one
**Arguments**:
- `arrays` (array): Array of arrays to merge

**Behavior**:
- Concatenates all arrays into single array
- Non-array values are converted to single-element arrays
- Maintains order of elements
- Flattens one level only

**Edge Cases**:
- Empty input returns empty array
- Single array returns copy of that array
- Non-array values become single-element arrays

**Example**:
```json
Logic: { "merge": [ {"var": ""}, [2, 3], 4, [5] ] }
Data: [1]
Result: [1, 2, 3, 4, 5]
```

**Factory Methods**:
```php
JsonLogicRuleFactory::merge([array1, array2, array3])
```

### in (Array Includes)

**Operator**: `in`
**Purpose**: Check if value exists in array
**Arguments**:
- `value` (mixed): Value to search for (needle)
- `collection` (array): Array to search in (haystack)

**Behavior**:
- Checks if value is array element
- Uses loose equality for searches
- Returns boolean result

**Edge Cases**:
- Empty arrays return `false`
- `null` and `undefined` handling varies
- Numeric strings may match numbers

**Example**:
```json
Logic: { "in": [ 5, {"var": ""} ] }
Data: [1, 2, 3, 4, 5]
Result: true
```

**Factory Methods**:
```php
JsonLogicRuleFactory::in(needle, haystack)
```

### length (Array Length)

**Operator**: `length`
**Purpose**: Get array length
**Arguments**:
- `array` (array): Array to measure

**Behavior**:
- Returns element count
- Non-array inputs may be converted to arrays

**Edge Cases**:
- Empty arrays return 0
- Non-array values may return 1 or error

**Example**:
```json
Logic: { "length": {"var": ""} }
Data: [1]
Result: 1
```

**Factory Methods**:
```php
JsonLogicRuleFactory::length(array)
```


## Collection Operations

### in

**Operator**: `in`
**Purpose**: Check if value exists in collection or substring in string
**Arguments**:
- `value` (mixed): Value to search for (needle)
- `collection` (array|string): Collection to search in (haystack)

**Behavior**:
- Array collections: checks if value is array element
- String collections: checks if value is substring
- Uses loose equality for array searches
- Case-sensitive for string searches

**Edge Cases**:
- Empty collections return `false`
- `null` and `undefined` handling varies
- Numeric strings may match numbers in arrays

**Factory Methods**:
```php
JsonLogicRuleFactory::in(needle, haystack)
```

### missing

**Operator**: `missing`
**Purpose**: Find missing keys in data object
**Arguments**:
- `keys` (array): Array of keys to check for

**Behavior**:
- Returns array of keys that don't exist in data
- Empty return array means all keys exist
- Checks top-level keys only (no dot notation)
- Case-sensitive key matching

**Edge Cases**:
- Empty key array returns empty array
- Non-object data may return all keys as missing
- `null` and `undefined` values are considered missing

**Factory Methods**:
```php
JsonLogicRuleFactory::missing(['key1', 'key2', 'key3'])
```

### missing_some

**Operator**: `missing_some`
**Purpose**: Check if minimum number of keys exist
**Arguments**:
- `minRequired` (int): Minimum number of keys required
- `keys` (array): Array of keys to check

**Behavior**:
- Returns empty array if minimum requirement met
- Returns array of missing keys if requirement not met
- Useful for "N of M" validation scenarios
- Counts existing keys, not missing ones

**Edge Cases**:
- `minRequired` of 0 always returns empty array
- `minRequired` greater than key count may return all keys
- Negative `minRequired` treated as 0

**Factory Methods**:
```php
JsonLogicRuleFactory::missingSome(minRequired, ['key1', 'key2', 'key3'])
```


## String Operations

### cat

**Operator**: `cat`
**Purpose**: Concatenate strings
**Arguments**:
- `strings` (array): Array of values to concatenate

**Behavior**:
- Converts all values to strings and concatenates
- No separator or "glue" string used
- Maintains order of arguments
- Non-string values converted using string coercion

**Edge Cases**:
- Empty array returns empty string
- `null` and `undefined` conversion varies by implementation
- Numbers converted to string representation

**Example**:
```json
Logic: { "cat": [ "Hello, ", {"var": ""}, "!" ] }
Data: "World"
Result: "Hello, World!"
```

**Factory Methods**:
```php
JsonLogicRuleFactory::cat(['string1', 'string2', 'string3'])
```

### in (String Includes)

**Operator**: `in`
**Purpose**: Check if value exists in collection or substring in string
**Arguments**:
- `value` (mixed): Value to search for (needle)
- `collection` (array|string): Collection to search in (haystack)

**Behavior**:
- Array collections: checks if value is array element
- String collections: checks if value is substring
- Uses loose equality for array searches
- Case-sensitive for string searches

**Edge Cases**:
- Empty collections return `false`
- `null` and `undefined` handling varies
- Numeric strings may match numbers in arrays

**String Example**:
```json
Logic: { "in": [ {"var": ""}, "hello" ] }
Data: "e"
Result: true
```

**Array Example**:
```json
Logic: { "in": [ 5, {"var": ""} ] }
Data: [1, 2, 3, 4, 5]
Result: true
```

**Factory Methods**:
```php
JsonLogicRuleFactory::in(needle, haystack)
```

### length

**Operator**: `length`
**Purpose**: Get string length
**Arguments**:
- `string` (mixed): String to get length of

**Behavior**:
- Returns character count
- Non-string inputs converted to strings

**Edge Cases**:
- Empty strings return 0

**Example**:
```json
Logic: { "length": {"var": ""} }
Data: "Hello"
Result: 5
```

### match

**Operator**: `match`
**Purpose**: Regular expression matching
**Arguments**:
- `string` (mixed): String to match against
- `pattern` (mixed): Regular expression pattern
- `flags` (mixed, optional): Regex flags

**Behavior**:
- Returns match results or boolean
- Pattern syntax depends on implementation
- Flags control case sensitivity, global matching, etc.
- May return first match or all matches

**Factory Methods**:
```php
JsonLogicRuleFactory::match(string, pattern, flags)
```

**Edge Cases**:

- Regex implementation in PHP and JavaScript may differ as uses different engines: PHP uses PCRE, JavaScript uses ECMAScript.

Example:
```json
Logic: { "match": [ {"var": ""}, "^[a-z]+$", "i" ] }
Data: "Hello"
Result: true
```

### substr

**Operator**: `substr`
**Purpose**: Extract substring
**Arguments**:
- `string` (mixed): String to extract from
- `start` (mixed): Start position (0-based index)
- `length` (mixed, optional): Length of substring

**Behavior**:
- Positive start: index from beginning
- Negative start: index from end
- Positive length: number of characters to extract
- Negative length: stop that many characters before end
- No length: extract to end of string

**Edge Cases**:
- Start beyond string length returns empty string
- Negative start beyond string length starts from beginning
- Length of 0 returns empty string
- Non-string inputs converted to strings

**Example**:
```json
Logic: { "substr": [ {"var": "text"}, {"var": "start"}, {"var": "end"} ] }
Data: {
  "text": "json-logic-engine",
  "start": 5,
  "end": -7
}
Result: "logic"
```

**Factory Methods**:
```php
JsonLogicRuleFactory::substr(string, start, length)
```

### length

**Operator**: `length`
**Purpose**: Get string or array length
**Arguments**:
- `string` (mixed): String or array to measure

**Behavior**:
- Strings: returns character count
- Arrays: returns element count
- Objects: may return property count or error
- Non-string/array values converted appropriately

**Edge Cases**:
- Empty strings return 0
- Empty arrays return 0
- `null` and `undefined` may return 0 or error

**String Example**:
```json
Logic: { "length": {"var": ""} }
Data: "Hello"
Result: 5
```

**Array Example**:
```json
Logic: { "length": {"var": ""} }
Data: [1]
Result: 1
```

**Factory Methods**:
```php
JsonLogicRuleFactory::length(stringOrArray)
```

### match

**Operator**: `match`
**Purpose**: Regular expression matching
**Arguments**:
- `string` (mixed): String to match against
- `pattern` (mixed): Regular expression pattern
- `flags` (mixed, optional): Regex flags

**Behavior**:
- Returns match results or boolean
- Pattern syntax depends on implementation
- Flags control case sensitivity, global matching, etc.
- May return first match or all matches

**Edge Cases**:
- Invalid patterns may throw errors
- Non-string inputs converted to strings
- Flag support varies by implementation

**Factory Methods**:
```php
JsonLogicRuleFactory::match(string, pattern, flags)
```


## Conditional Operations

### if

**Operator**: `if`
**Purpose**: Conditional branching (if-then-else)
**Arguments**:
- `branches` (array): Array of condition-result pairs plus optional else

**Behavior**:
- Minimum 2 arguments: condition and then-result
- 3 arguments: condition, then-result, else-result
- More arguments: if-then, elseif-then, elseif-then, ..., else
- Evaluates conditions in order until one is truthy
- Returns corresponding result for first truthy condition

**Edge Cases**:
- No truthy conditions and no else returns `null` or `false`
- Single argument may cause error
- Conditions use JsonLogic truthiness rules

**Factory Methods**:
```php
JsonLogicRuleFactory::if([condition, thenResult, elseResult])
```


## Edge Cases and Special Behaviors

### Truthiness Rules

JsonLogic follows specific truthiness rules that may differ from other languages:

**Falsy Values**:
- `false`
- `null`
- `undefined` (if supported)
- `0`
- `""`  (empty string)
- `[]` (empty array)

**Truthy Values**:
- `true`
- Non-zero numbers
- Non-empty strings (including `"0"`)
- Non-empty arrays
- Objects

### Type Coercion

JsonLogic performs automatic type coercion in many operations:

**String to Number**:
- Numeric strings convert to numbers
- Non-numeric strings convert to `NaN`
- Empty strings convert to `0`

**Boolean Conversion**:
- Uses truthiness rules above
- Explicit conversion via `!!` operator

**Array Conversion**:
- Non-arrays may be wrapped in arrays for some operations
- Objects may be converted to arrays of values

### Error Handling

Different implementations may handle errors differently:

**Common Error Scenarios**:
- Division by zero
- Invalid regular expressions
- Type mismatches in strict operations
- Missing required arguments

**Error Responses**:
- May return `null`, `false`, or `NaN`
- May throw exceptions
- May return error objects

### Performance Considerations

**Optimization Tips**:
- Use appropriate operators for data types
- Avoid unnecessary type coercion
- Consider short-circuiting in `and`/`or` operations
- Cache complex rule evaluations when possible

**Memory Usage**:
- Large arrays in `map`/`filter`/`reduce` operations
- Deep nesting of rules
- Circular references in data objects


## Implementation Notes

This documentation describes the JsonLogic operations as implemented in the CakeDC Admin plugin. Some behaviors may vary from the standard JsonLogic specification or other implementations. Always test operations with your specific data and use cases to ensure expected behavior.

For factory method usage and PHP-specific implementation details, refer to the `JsonLogicRuleFactory` class and individual rule classes in the `src/Rule/` directory.
