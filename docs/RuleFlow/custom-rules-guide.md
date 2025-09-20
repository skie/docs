# Custom Rules and Functions Guide

## Overview

This guide explains how to add custom validation rules and functions to the RuleFlow plugin.

## Custom Rules (Server-side PHP)

Custom rules extend server-side validation with your own business logic.

### Creating a Custom Rule

1. **Create a rule class** that implements `CustomRuleInterface`:

```php
<?php
declare(strict_types=1);

namespace App\Rule\Custom;

use RuleFlow\CustomRuleInterface;
use RuleFlow\Rule\AbstractJsonLogicRule;

class AgeVerificationRule extends AbstractJsonLogicRule implements CustomRuleInterface
{
    protected int $minAge;

    public function __construct(int $minAge = 18)
    {
        $this->operator = 'age_verification';
        $this->minAge = $minAge;
    }

    /**
     * Evaluate rule against resolved values and data context
     *
     * @param mixed $resolvedValues The resolved operand values from JSON Logic
     * @param mixed $data The original data context
     * @return mixed Rule evaluation result
     */
    public function evaluate(mixed $resolvedValues, mixed $data): mixed
    {
        // $resolvedValues contains the resolved operands
        // $data contains the original data context

        $birthDate = $resolvedValues; // Single operand
        if (!$birthDate) {
            return false;
        }

        $age = (new \DateTime())->diff(new \DateTime($birthDate))->y;
        return $age >= $this->minAge;
    }

    protected function getOperands(): mixed
    {
        return $this->minAge;
    }
}
```

2. **Register the rule**:

```php
use RuleFlow\CustomRuleRegistry;
use App\Rule\Custom\AgeVerificationRule;

// Register the custom rule
CustomRuleRegistry::registerRule(AgeVerificationRule::class);
```

3. **Use in JsonLogic**:

```php
$rule = ['age_verification' => [21, ['var' => 'birth_date']]];
$data = ['birth_date' => '1990-05-15'];

$evaluator = new JsonLogicEvaluator();
$result = $evaluator->evaluate($rule, $data); // true or false
```

### Built-in Custom Rules

The plugin includes these ready-to-use custom rules:

#### LengthRule
```php
// Register built-in rules
CustomRuleRegistry::registerRule(\RuleFlow\Rule\String\LengthRule::class);

// Usage
$rule = ['length' => ['var' => 'password']];
$rule = ['>=', [['length' => ['var' => 'password']], 8]]; // Min length 8
```

#### MatchRule (Regex)
```php
CustomRuleRegistry::registerRule(\RuleFlow\Rule\String\MatchRule::class);

// Usage
$rule = ['match' => [['var' => 'email'], '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$']];
```

## Custom Functions (Client-side JavaScript)

Extend client-side validation with custom JavaScript functions.

### Method 1: Global Registration (Before Library Load)

```javascript
// Define before the FormWatcher library loads
window.FormWatcherCustomOperations = {
    age_verification: function(minAge, birthDate) {
        if (!birthDate) return false;
        const today = new Date();
        const birth = new Date(birthDate);
        const age = Math.floor((today - birth) / (365.25 * 24 * 60 * 60 * 1000));
        return age >= minAge;
    },

    strong_password: function(password) {
        if (!password || password.length < 8) return false;
        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasDigit = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        return hasLower && hasUpper && hasDigit && hasSpecial;
    }
};
```

### Method 2: Runtime Registration

```javascript
// Register after library loads
document.addEventListener('DOMContentLoaded', function() {
    if (window.FormWatcherAuto) {
        FormWatcherAuto.registerCustomFunction('age_verification', function(minAge, birthDate) {
            if (!birthDate) return false;
            const today = new Date();
            const birth = new Date(birthDate);
            const age = Math.floor((today - birth) / (365.25 * 24 * 60 * 60 * 1000));
            return age >= minAge;
        });
    }
});
```

### Method 3: Configuration-based

```javascript
window.FormWatcherAutoConfig = {
    autoInit: true,
    customOperations: {
        credit_card: function(cardNumber) {
            if (!cardNumber) return false;
            // Luhn algorithm implementation
            const digits = cardNumber.replace(/\D/g, '');
            let sum = 0;
            let isEven = false;
            for (let i = digits.length - 1; i >= 0; i--) {
                let digit = parseInt(digits[i]);
                if (isEven) {
                    digit *= 2;
                    if (digit > 9) digit -= 9;
                }
                sum += digit;
                isEven = !isEven;
            }
            return sum % 10 === 0;
        }
    }
};
```

## Usage in Forms

### Server-side (Controller)
```php
$rules = [
    'email' => [
        ['match' => [['var' => 'email'], '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$']]
    ],
    'birth_date' => [
        ['age_verification' => [18, ['var' => 'birth_date']]]
    ]
];

$evaluator = new JsonLogicEvaluator();
$result = $evaluator->evaluate($rules['email'][0], $data);
```

### Client-side (HTML)
```html
<form data-json-logic="#validation-rules">
    <input name="email" type="email" required>
    <input name="birth_date" type="date" required>
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
    "birth_date": {
        "rules": [{
            "rule": {"age_verification": [18, {"var": "birth_date"}]},
            "message": "You must be at least 18 years old"
        }]
    }
}
</script>
```

## Library Control

### Disable Auto-initialization
```javascript
window.FormWatcherAutoConfig = {
    autoInit: false
};

// Manual initialization
document.addEventListener('DOMContentLoaded', function() {
    FormWatcherAuto.init();
});
```

### Completely Disable
```javascript
window.FormWatcherAutoConfig = {
    enabled: false
};
```

## Common Patterns

### Email Validation
```javascript
// Cross-platform email pattern
const emailPattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';

// PHP
$rule = ['match' => [['var' => 'email'], $emailPattern]];

// JavaScript
window.FormWatcherCustomOperations = {
    email_format: function(email) {
        return new RegExp(emailPattern).test(email);
    }
};
```

### Password Strength
```javascript
window.FormWatcherCustomOperations = {
    strong_password: function(password) {
        if (!password || password.length < 8) return false;
        return /[a-z]/.test(password) &&
               /[A-Z]/.test(password) &&
               /[0-9]/.test(password) &&
               /[!@#$%^&*(),.?":{}|<>]/.test(password);
    }
};
```

### Phone Number
```javascript
window.FormWatcherCustomOperations = {
    phone_international: function(phone) {
        return /^\+[1-9]\d{1,14}$/.test(phone);
    }
};
```
