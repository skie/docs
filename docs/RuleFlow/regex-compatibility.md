# Regular Expression Compatibility Guide

## Table of Contents

1. [Overview](#overview)
2. [Built-in Regex Support](#built-in-regex-support)
   - [Server-side (PHP)](#server-side-php)
   - [Client-side (JavaScript)](#client-side-javascript)
3. [Cross-Platform Pattern Guidelines](#cross-platform-pattern-guidelines)
   - [Store Patterns Without Delimiters](#store-patterns-without-delimiters)
   - [Automatic Delimiter Handling](#automatic-delimiter-handling)
4. [Common Validation Patterns](#common-validation-patterns)
   - [Email Validation](#email-validation)
   - [Phone Number Validation](#phone-number-validation)
   - [Password Strength](#password-strength)
   - [Postal Code Validation](#postal-code-validation)
5. [Form Usage Examples](#form-usage-examples)
   - [HTML Form with Validation](#html-form-with-validation)
   - [Controller Validation](#controller-validation)
6. [Browser Compatibility](#browser-compatibility)
   - [Modern Features (Use with Caution)](#modern-features-use-with-caution)
   - [Legacy-Compatible Alternatives](#legacy-compatible-alternatives)
7. [Performance Tips](#performance-tips)
   - [Cache Compiled Patterns](#cache-compiled-patterns)
   - [Avoid Catastrophic Backtracking](#avoid-catastrophic-backtracking)
8. [Testing Patterns](#testing-patterns)
   - [Test Both Environments](#test-both-environments)
9. [Configuration Approach](#configuration-approach)
   - [Centralized Pattern Storage](#centralized-pattern-storage)
10. [Best Practices Summary](#best-practices-summary)
11. [Common Gotchas](#common-gotchas)
    - [Escaping Issues](#escaping-issues)
    - [Flag Differences](#flag-differences)


## Overview

This guide explains how to use regular expressions in RuleFlow for consistent validation between PHP (server-side) and JavaScript (client-side).

## Built-in Regex Support

RuleFlow provides built-in `match` operations that work consistently across both server and client:

### Server-side (PHP)
```php
use RuleFlow\CustomRuleRegistry;
use RuleFlow\Rule\String\MatchRule;

// Register the built-in match rule
CustomRuleRegistry::registerRule(MatchRule::class);

// Usage
$rule = ['match' => [['var' => 'email'], '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$']];
$data = ['email' => 'user@example.com'];

$evaluator = new JsonLogicEvaluator();
$result = $evaluator->evaluate($rule, $data); // true
```

### Client-side (JavaScript)
```javascript
// Built-in match operation (automatically available)
const rule = {
    "match": [
        {"var": "email"},
        "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
    ]
};

// Used in form validation automatically
```

## Cross-Platform Pattern Guidelines

### Store Patterns Without Delimiters

**✅ Recommended**: Store the core pattern without PHP delimiters:

```javascript
// ✅ Good - Works in both PHP and JavaScript
const emailPattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';
const phonePattern = '^\\+[1-9]\\d{1,14}$';
const passwordPattern = '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{8,}$';
```

**❌ Avoid**: PHP-specific delimiters in shared patterns:
```javascript
// ❌ Bad - PHP-specific delimiters
const badPattern = '/^pattern$/i';  // Don't include delimiters
```

### Automatic Delimiter Handling

The built-in `MatchRule` automatically handles delimiters:

- **PHP**: Adds `/` delimiters automatically if not present
- **JavaScript**: Uses patterns directly without delimiters

```php
// PHP - Both work the same:
$rule1 = ['match' => [['var' => 'text'], 'pattern']];        // Auto-adds delimiters
$rule2 = ['match' => [['var' => 'text'], '/pattern/']];      // Uses as-is
```

## Common Validation Patterns

### Email Validation
```javascript
// Cross-platform email pattern
const emailPattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';

// PHP usage
$rule = ['match' => [['var' => 'email'], $emailPattern]];

// JavaScript usage (custom function)
window.FormWatcherCustomOperations = {
    email_format: function(email) {
        return new RegExp(emailPattern).test(email);
    }
};
```

### Phone Number Validation
```javascript
// International phone (E.164 format)
const phonePattern = '^\\+[1-9]\\d{1,14}$';

// US phone number
const usPhonePattern = '^\\+?1?[2-9]\\d{2}[2-9]\\d{2}\\d{4}$';

// Usage in both PHP and JavaScript
const rule = {
    "match": [{"var": "phone"}, phonePattern]
};
```

### Password Strength
```javascript
// Strong password pattern
const strongPasswordPattern = '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{8,}$';

// Custom validation function
window.FormWatcherCustomOperations = {
    strong_password: function(password) {
        if (!password || password.length < 8) return false;

        // Check each requirement separately for better compatibility
        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasDigit = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return hasLower && hasUpper && hasDigit && hasSpecial;
    }
};
```

### Postal Code Validation
```javascript
// US ZIP code
const zipPattern = '^[0-9]{5}(-[0-9]{4})?$';

// Canadian postal code
const postalPattern = '^[A-Za-z]\\d[A-Za-z] \\d[A-Za-z]\\d$';

// UK postcode
const ukPostcodePattern = '^[A-Z]{1,2}[0-9][A-Z0-9]? [0-9][ABD-HJLNP-UW-Z]{2}$';
```

## Form Usage Examples

### HTML Form with Validation
```html
<form data-json-logic="#validation-rules">
    <input name="email" type="email" required>
    <input name="phone" type="tel" required>
    <input name="password" type="password" required>
    <button type="submit">Submit</button>
</form>

<script type="application/json" id="validation-rules">
{
    "email": {
        "rules": [{
            "rule": {"match": [{"var": "email"}, "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"]},
            "message": "Please enter a valid email address"
        }]
    },
    "phone": {
        "rules": [{
            "rule": {"match": [{"var": "phone"}, "^\\+[1-9]\\d{1,14}$"]},
            "message": "Please enter a valid international phone number"
        }]
    },
    "password": {
        "rules": [{
            "rule": {"strong_password": [{"var": "password"}]},
            "message": "Password must be at least 8 characters with uppercase, lowercase, number, and special character"
        }]
    }
}
</script>
```

### Controller Validation
```php
// In your CakePHP controller
use RuleFlow\JsonLogicEvaluator;
use RuleFlow\CustomRuleRegistry;
use RuleFlow\Rule\String\MatchRule;

// Register built-in rules
CustomRuleRegistry::registerRule(MatchRule::class);

public function validateUser($data) {
    $evaluator = new JsonLogicEvaluator();

    // Email validation
    $emailRule = ['match' => [['var' => 'email'], '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$']];
    $emailValid = $evaluator->evaluate($emailRule, $data);

    // Phone validation
    $phoneRule = ['match' => [['var' => 'phone'], '^\\+[1-9]\\d{1,14}$']];
    $phoneValid = $evaluator->evaluate($phoneRule, $data);

    return $emailValid && $phoneValid;
}
```

## Browser Compatibility

### Modern Features (Use with Caution)
```javascript
// ⚠️ Requires ES2018+ browsers
/(?<=prefix)pattern/     // Lookbehind
/pattern/s               // Dot-all flag
/\p{Script=Latin}/u      // Unicode property escapes
```

### Legacy-Compatible Alternatives
```javascript
// ✅ Works in all browsers
/pattern[\s\S]*/         // Instead of /pattern/s
/[a-zA-Z]/               // Instead of /\p{Script=Latin}/u

// For lookbehind, use string methods:
function hasPrefix(text, prefix) {
    return text.startsWith(prefix);
}
```

## Performance Tips

### Cache Compiled Patterns
```javascript
// ✅ Good - Compile once, use multiple times
class RegexValidator {
    constructor() {
        this.emailRegex = new RegExp('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$');
        this.phoneRegex = new RegExp('^\\+[1-9]\\d{1,14}$');
    }

    validateEmail(email) {
        return this.emailRegex.test(email);
    }

    validatePhone(phone) {
        return this.phoneRegex.test(phone);
    }
}

// ❌ Bad - Compiles regex every time
function validateEmail(email) {
    return new RegExp('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$').test(email);
}
```

### Avoid Catastrophic Backtracking
```javascript
// ❌ Bad - Can cause catastrophic backtracking
const badPattern = '^(a+)+b$';

// ✅ Good - More efficient
const goodPattern = '^a+b$';
```

## Testing Patterns

### Test Both Environments
```php
// PHP test
function testEmailPattern() {
    $pattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';
    $rule = ['match' => ['test@example.com', $pattern]];

    $evaluator = new JsonLogicEvaluator();
    $result = $evaluator->evaluate($rule, []);

    assert($result === true);
}
```

```javascript
// JavaScript test
function testEmailPattern() {
    const pattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';
    const regex = new RegExp(pattern);
    const result = regex.test('test@example.com');

    console.assert(result === true);
}
```

## Configuration Approach

### Centralized Pattern Storage
```php
// config/validation_patterns.php
return [
    'email' => '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    'phone_international' => '^\\+[1-9]\\d{1,14}$',
    'password_strong' => '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{8,}$',
    'postal_code_us' => '^[0-9]{5}(-[0-9]{4})?$',
];
```

```javascript
// js/validation_patterns.js
const VALIDATION_PATTERNS = {
    email: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    phone_international: '^\\+[1-9]\\d{1,14}$',
    password_strong: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{8,}$',
    postal_code_us: '^[0-9]{5}(-[0-9]{4})?$',
};
```

## Best Practices Summary

1. **Store patterns without delimiters** - Let the system add them
2. **Use compatible regex features** - Stick to widely supported syntax
3. **Test in both environments** - Verify PHP and JavaScript behavior
4. **Cache compiled patterns** - Don't recreate regex objects
5. **Avoid complex patterns** - Keep validation fast and reliable
6. **Use string methods for complex logic** - Sometimes simpler than regex

## Common Gotchas

### Escaping Issues
```javascript
// ✅ Correct escaping for both environments
const dotPattern = '\\.';           // Literal dot
const backslashPattern = '\\\\';    // Literal backslash

// ❌ Common mistakes
const wrongDot = '.';               // Matches any character
const wrongBackslash = '\\';        // Invalid escape
```

### Flag Differences
```javascript
// ✅ Safe flags (work everywhere)
/pattern/i                          // Case insensitive
/pattern/m                          // Multiline

// ⚠️ Modern flags (check browser support)
/pattern/s                          // Dot-all (ES2018+)
/pattern/u                          // Unicode (ES2015+)
```

By following these guidelines, you can create consistent regex validation that works reliably across both PHP and JavaScript environments.
