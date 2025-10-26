# RuleFlow Plugin Documentation

## Overview

The **RuleFlow Plugin** is a CakePHP plugin that seamlessly transforms server-side validation rules into client-side JSON Logic validation. It provides automatic form validation without requiring separate client-side validation code, maintaining consistency between server and client validation rules.

## What is JSON Logic?

[JSON Logic](http://jsonlogic.com/) is a lightweight rule engine expressed in JSON format. It allows you to write conditional logic and validation rules in a structured, language-independent format that can be evaluated both server-side and client-side.

### JSON Logic Examples:
```json
// Simple comparison: age > 18
{">" : [{"var" : "age"}, 18]}

// Complex logic: name is not empty AND (age > 18 OR hasPermit is true)
{
  "and": [
    {"!=": [{"var": "name"}, ""]},
    {
      "or": [
        {">": [{"var": "age"}, 18]},
        {"var": "hasPermit"}
      ]
    }
  ]
}
```

## CakePHP Rules Transformation

The plugin automatically converts CakePHP validation rules to JSON Logic format using the `ValidationRuleConverter` class.

### Supported CakePHP Validation Rules

#### Basic Validation Rules
- `notBlank` / `notEmpty` → JSON Logic field presence validation
- `equals` / `notEquals` → Comparison operations (`==`, `!=`)
- `greaterThan` / `lessThan` → Numeric comparisons (`>`, `<`)
- `greaterThanOrEqual` / `lessThanOrEqual` → Inclusive comparisons (`>=`, `<=`)

#### Field Comparison Rules
- `compareFields` → Cross-field validation
- `sameAs` / `notSameAs` → Field equality validation

#### String/Length Rules
- `minLength` / `maxLength` → String length validation
- `lengthBetween` → String length range validation

#### List/Array Rules
- `inList` / `notInList` → Value inclusion/exclusion validation
- `range` / `between` → Numeric range validation

#### Collection Rules (Advanced)
- `hasAtLeast` / `hasAtMost` → Array element count validation
- `multipleOptions` → Multiple selection validation

### Transformation Example

**CakePHP Validator Code:**
```php
$validator
    ->notBlank('username')
    ->minLength('username', 3)
    ->maxLength('username', 50)
    ->greaterThan('age', 18)
    ->inList('status', ['active', 'inactive']);
```

**Generated JSON Logic:**
```json
{
  "username": {
    "rules": [
      {
        "rule": {"!=": [{"var": "username"}, ""]},
        "message": "Username cannot be blank"
      },
      {
        "rule": {">=": [{"length": {"var": "username"}}, 3]},
        "message": "Username must be at least 3 characters"
      },
      {
        "rule": {"<=": [{"length": {"var": "username"}}, 50]},
        "message": "Username cannot exceed 50 characters"
      }
    ]
  },
  "age": {
    "rules": [
      {
        "rule": {">": [{"var": "age"}, 18]},
        "message": "Age must be greater than 18"
      }
    ]
  },
  "status": {
    "rules": [
      {
        "rule": {"in": [{"var": "status"}, ["active", "inactive"]]},
        "message": "Status must be either active or inactive"
      }
    ]
  }
}
```

## RuleComponent - Controller Integration

The `RuleComponent` is responsible for extracting validation rules from your table validators and making them available to views.

### Usage in Controller

```php
// Load the component
public function initialize(): void
{
    parent::initialize();
    $this->loadComponent('RuleFlow.Rule');
}

// In your action
public function add()
{
    $article = $this->Articles->newEmptyEntity();

    // Configure validation rules for the form
    $this->Rule->configureFormRules($this->Articles);

    // The rules are now available in the view as $jsonLogic variable
    $this->set(compact('article'));
}

// Using custom validator
public function edit($id = null)
{
    $article = $this->Articles->get($id);

    // Use a specific validator (e.g., 'update' validator)
    $this->Rule->configureFormRules($this->Articles, 'update');

    $this->set(compact('article'));
}
```

### What the Component Does

1. **Extracts Validator**: Gets the specified validator from your table
2. **Converts Rules**: Uses `ValidationRuleConverter` to transform CakePHP rules to JSON Logic
3. **Sets View Variable**: Makes the `$jsonLogic` variable available in your view templates

## FormHelper Integration

The plugin provides an enhanced `FormHelper` that automatically integrates validation rules with forms.

### Using the Enhanced FormHelper

**In your AppView.php:**
```php
public function initialize(): void
{
    parent::initialize();
    // Replace default FormHelper with RuleFlow FormHelper
    $this->loadHelper('RuleFlow.Form');
}
```

**In your templates:**
```php
<?= $this->Form->create($article) ?>
<!-- Form will automatically have data-json-logic="#json-logic-rules" attribute -->

<?= $this->Form->control('title') ?>
<?= $this->Form->control('content') ?>
<?= $this->Form->control('status', ['type' => 'select', 'options' => $statusOptions]) ?>

<?= $this->Form->button('Submit') ?>
<?= $this->Form->end() ?>
```

### What the FormHelper Does

1. **Automatic Attribute**: Adds `data-json-logic="#json-logic-rules"` to form elements
2. **Rule Embedding**: Uses `RuleLogicTrait` to embed JSON script block in page
3. **Script Generation**: Creates `<script id="json-logic-rules" type="application/json">` with validation rules

## Manual Integration (Without FormHelper)

If you prefer not to use the enhanced FormHelper, you can manually integrate validation rules:

### Manual Form Attributes

```php
<?= $this->Form->create($article, ['data-json-logic' => '#json-logic-rules']) ?>
<!-- Your form fields -->
<?= $this->Form->end() ?>

<!-- Manual script block -->
<script id="json-logic-rules" type="application/json">
<?= json_encode($jsonLogic ?? []) ?>
</script>
```

### Individual Field Validation Attributes

```php
<?= $this->Form->control('username', [
    'validation-rule' => json_encode([
        'type' => 'json-logic',
        'rules' => [
            [
                'rule' => ['!=', [['var' => 'username'], '']],
                'message' => 'Username is required'
            ],
            [
                'rule' => ['>=', [['length' => ['var' => 'username']], 3]],
                'message' => 'Username must be at least 3 characters'
            ]
        ]
    ])
]) ?>
```

### Available Attributes

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `data-json-logic` | References script element containing all form rules | `#json-logic-rules` |
| `validation-rule` | Inline validation rules for specific field | JSON-encoded rule object |
| `data-field-name` | Override field name for validation | Custom field identifier |

## Auto Watch Functionality

The **Auto Watch** system (`form-watcher-auto.js`) automatically initializes client-side validation for forms without requiring manual setup.

### How Auto Watch Works

1. **Automatic Detection**: Scans page for forms with `data-json-logic` attributes
2. **Rule Loading**: Loads validation rules from referenced script elements
3. **Validator Creation**: Creates field validators using JSON Logic evaluation
4. **Event Binding**: Automatically binds validation to form field events
5. **Form Submission**: Prevents submission if validation fails

### Auto Watch Configuration

```javascript
// Initialize with default options
initializeFormWatcherAuto();

// Initialize with custom options
initializeFormWatcherAuto({
    showValidationSummary: true,        // Show summary of all errors
    summaryAutoRemoveTimeout: 5000,     // Auto-remove summary after 5 seconds
    focusFirstErrorField: true          // Focus first field with error
});
```

### Autoload Configuration

The Auto Watch system can be configured to initialize automatically when the page loads, or you can control initialization manually:

#### Automatic Initialization (Default)
```javascript
// The system automatically initializes when the page loads
// No additional configuration needed
```

#### Manual Initialization Control
```javascript
// Disable automatic initialization
window.FormWatcherAutoConfig = {
    autoInit: false  // Prevents automatic initialization
};

// Then manually initialize when needed
document.addEventListener('DOMContentLoaded', function() {
    initializeFormWatcherAuto({
        showValidationSummary: true,
        focusFirstErrorField: true
    });
});
```

#### Complete Disable
```javascript
// Completely disable the Auto Watch system
window.FormWatcherAutoConfig = {
    enabled: false  // Disables all Auto Watch functionality
};
```

### Auto Watch Features

- **Zero Configuration**: Works automatically with enhanced FormHelper
- **Multiple Forms**: Handles multiple forms on same page
- **Real-time Validation**: Validates fields as user types/changes values
- **Form Submission Prevention**: Blocks form submission when validation fails
- **Error Display**: Shows validation messages near form fields
- **Validation Summary**: Optional summary of all validation errors
- **Configurable Autoload**: Control when and how the system initializes

## Auto Rules Loader

The **Auto Rules Loader** (`ValidationRuleLoader` class) handles the loading and parsing of validation rules from various sources.

### Rule Sources

1. **Data Attributes**: Rules embedded in `data-json-logic` attributes
2. **Script Elements**: Rules in `<script type="application/json">` elements
3. **Inline Attributes**: Rules in `validation-rule` attributes on form fields

### Rule Loading Process

```javascript
const loader = new ValidationRuleLoader();

// Load rules from form's data-json-logic attribute
const rules = loader.parseAllValidationRules(form);

// Create validator for specific field
const validator = loader.createValidator('username');

// Use validator
const result = validator(inputValue, formData);
if (result !== true) {
    console.log('Validation errors:', result);
}
```

### Rule Loader Features

- **Caching**: Caches parsed rules for performance
- **Error Handling**: Graceful handling of malformed JSON
- **Multiple Sources**: Combines rules from different sources
- **Field Mapping**: Maps HTML field names to internal validation names

## Dynamic Fields Support

The **Dynamic Form Watcher** (`form-watcher-dynamic.js`) provides advanced support for dynamically added form fields.

### Dynamic Field Patterns

The system uses pattern matching to apply validation rules to dynamically added fields:

```javascript
// Original field: articles.0.title
// Pattern: articles.*.title
// Matches: articles.1.title, articles.2.title, etc.
```

### Dynamic Field Features

1. **Pattern Recognition**: Automatically detects field naming patterns
2. **Rule Inheritance**: New fields inherit validation rules from pattern
3. **Mutation Observer**: Watches for DOM changes and new fields
4. **Auto-Validation**: Automatically applies validation to new fields

### Dynamic Field Example

**Original Form Field:**
```html
<input name="items[0][name]" validation-rule='{"type":"json-logic","rules":[...]}'>
```

**Dynamically Added Field:**
```html
<input name="items[1][name]">
<!-- Automatically inherits validation rules from items[0][name] pattern -->
```

### Using Dynamic Form Watcher

```javascript
// Initialize dynamic form watcher
const dynamicWatcher = initializeFormWatcherWithDynamic({
    showValidationSummary: true,
    focusFirstErrorField: true
});

// The system automatically:
// 1. Detects existing field patterns
// 2. Watches for new fields
// 3. Applies matching validation rules
// 4. Validates new fields in real-time
```

## Configuration Parameters

### Global Configuration (FormWatcherAutoConfig)

The Auto Watch system can be configured globally using the `FormWatcherAutoConfig` object:

```javascript
window.FormWatcherAutoConfig = {
    // Enable/disable the entire Auto Watch system
    enabled: true,

    // Control automatic initialization on page load
    autoInit: true,

    // Default options for all forms
    showValidationSummary: false,
    summaryAutoRemoveTimeout: 0,
    focusFirstErrorField: true,

    // Custom operations for validation
    customOperations: {
        // Add custom validation functions here
        custom_rule: function(value) {
            return /* validation logic */;
        }
    }
};
```

### Auto Watch Options

```javascript
const options = {
    // Show validation summary panel
    showValidationSummary: false,

    // Auto-remove validation summary after N milliseconds (0 = no auto-remove)
    summaryAutoRemoveTimeout: 0,

    // Focus first field with validation error
    focusFirstErrorField: true,

    // Custom error display callback
    errorDisplayHandler: function(fieldName, errors) {
        // Custom error display logic
    },

    // Custom form validation callback
    formValidationHandler: function(form, isValid, errors) {
        // Custom form-level validation handling
    }
};
```

### Dynamic Field Options

```javascript
const dynamicOptions = {
    // All auto watch options plus:

    // Debounce timeout for DOM mutation handling (milliseconds)
    mutationDebounceTimeout: 300,

    // Pattern detection sensitivity
    patternMatchStrict: false,

    // Custom field name conversion
    fieldNameConverter: function(htmlName) {
        return htmlName.replace(/\[(\d+)\]/g, '.$1');
    }
};
```

## Error Messaging and Display

### Error Message Sources

1. **CakePHP Validator Messages**: Original validation rule messages
2. **Custom Rule Messages**: Override messages in JSON Logic rules
3. **Default Messages**: Fallback messages for undefined rules

### Error Display Methods

#### Automatic Error Display
```javascript
// Errors automatically displayed near form fields
// Uses CSS classes: validation-error, field-error, error-message
```

#### Custom Error Display
```javascript
initializeFormWatcherAuto({
    errorDisplayHandler: function(fieldName, errors) {
        // Custom error display implementation
        const field = document.querySelector(`[name="${fieldName}"]`);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'custom-error';
        errorDiv.textContent = Array.isArray(errors) ? errors.join(', ') : errors;
        field.parentNode.appendChild(errorDiv);
    }
});
```

### Error CSS Classes

- `.validation-error`: Applied to fields with validation errors
- `.field-error`: Container for error messages
- `.error-message`: Individual error message elements
- `.validation-summary`: Validation summary panel
- `.error-list`: List of errors in summary

### Error Message Customization

**In CakePHP Validator:**
```php
$validator
    ->notBlank('username', 'Please enter a username')
    ->minLength('username', 3, 'Username is too short');
```

**In JSON Logic Rules:**
```json
{
  "rule": {"!=": [{"var": "username"}, ""]},
  "message": "Custom error message for this specific rule"
}
```

## Complete Integration Example

### 1. Controller Setup
```php
class ArticlesController extends AppController
{
    public function initialize(): void
    {
        parent::initialize();
        $this->loadComponent('RuleFlow.Rule');
    }

    public function add()
    {
        $article = $this->Articles->newEmptyEntity();

        if ($this->request->is('post')) {
            $article = $this->Articles->patchEntity($article, $this->request->getData());
            if ($this->Articles->save($article)) {
                $this->Flash->success('Article saved successfully.');
                return $this->redirect(['action' => 'index']);
            }
            $this->Flash->error('Unable to save article.');
        }

        // Configure client-side validation rules
        $this->Rule->configureFormRules($this->Articles);

        $this->set(compact('article'));
    }
}
```

### 2. View Template
```php
<?= $this->Form->create($article) ?>
    <fieldset>
        <legend><?= __('Add Article') ?></legend>
        <?= $this->Form->control('title') ?>
        <?= $this->Form->control('content', ['type' => 'textarea']) ?>
        <?= $this->Form->control('status', [
            'type' => 'select',
            'options' => ['draft' => 'Draft', 'published' => 'Published']
        ]) ?>
    </fieldset>
<?= $this->Form->button('Submit') ?>
<?= $this->Form->end() ?>

<!-- Include validation JavaScript -->
<?= $this->Html->script('RuleFlow.validate/json-logic') ?>
<?= $this->Html->script('RuleFlow.validate/form-watcher') ?>
<?= $this->Html->script('RuleFlow.validate/form-watcher-auto') ?>

<script>
document.addEventListener('DOMContentLoaded', function() {
    initializeFormWatcherAuto({
        showValidationSummary: true,
        focusFirstErrorField: true
    });
});
</script>
```

### 3. Table Validation Rules
```php
class ArticlesTable extends Table
{
    public function validationDefault(Validator $validator): Validator
    {
        $validator
            ->notBlank('title', 'Title is required')
            ->maxLength('title', 255, 'Title cannot exceed 255 characters')
            ->notEmpty('content', 'Content cannot be empty')
            ->inList('status', ['draft', 'published'], 'Invalid status');

        return $validator;
    }
}
```

This setup provides complete server-to-client validation rule transformation with automatic form validation, error display, and user feedback.