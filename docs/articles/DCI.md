---
title: Beyond MVC - Data, Context and Interaction in CakePHP
date: 2024-12-15
description: The Data-Context-Interaction (DCI) architectural pattern was introduced by Trygve Reenskaug, a Norwegian computer scientist and software engineer. Reenskaug is well known for his contributions to object-oriented programming and design. He is also famous for the development of the Model-View-Controller (MVC) design pattern.
tags:
  - CakePHP
  - DCI
  - Architecture
  - Design Patterns
  - MVC
---

## Introduction to the Creator of DCI

The [Data-Context-Interaction (DCI)](https://en.wikipedia.org/wiki/Data,_context_and_interaction) architectural pattern was introduced by [Trygve Reenskaug](https://en.wikipedia.org/wiki/Trygve_Reenskaug), a Norwegian computer scientist and software engineer. Reenskaug is well known for his contributions to object-oriented programming and design. He is also famous for the development of the **Model-View-Controller (MVC)** design pattern, which has become a foundational concept in software architecture, especially in web development.

### The Emergence of DCI

Reenskaug introduced the [DCI pattern](https://fulloo.info/Documents/ArtimaDCI.html) as a way to address some of the limitations he observed in traditional object-oriented programming. The DCI pattern aims to separate the concerns of data (the model), the context in which that data is used (the interaction), and the interactions themselves (the roles that objects play in specific scenarios). This separation allows for more maintainable, understandable, and flexible code, making it easier to adapt to changing business requirements.


### Classic Implementation

The classic example used to introduce the DCI pattern is the money transfer scenario. This example show how DCI separates the roles of data, context, and interaction, allowing for a clearer understanding of how objects interact in a system. By modeling the transfer of funds between accounts, we can see how the roles of TransferSource and TransferDestination are defined, encapsulating the behaviors associated with withdrawing and depositing money. This separation enhances code maintainability and readability, making it easier to adapt to changing business requirements.


<pre class="mermaid" style="display:flex; justify-content: center;">
classDiagram
    class TransferSource {
        +BigDecimal balance
        +updateBalance(newBalance: BigDecimal): Unit
        +withdraw(amount: BigDecimal): Unit
        +canWithdraw(amount: BigDecimal): Boolean
    }

    class TransferDestination {
        +BigDecimal balance
        +updateBalance(newBalance: BigDecimal): Unit
        +deposit(amount: BigDecimal): Unit
    }

    class Account {
        +String id
        +BigDecimal balance
    }

    class MoneyTransfer {
        +Account source
        +Account destination
        +BigDecimal amount
        +execute(): Unit
    }

    Account ..|> TransferSource : implements
    Account ..|> TransferDestination : implements
    MoneyTransfer --> TransferSource : uses
    MoneyTransfer --> TransferDestination : uses
</pre>

In the money transfer example, we typically have two accounts: a source account from which funds are withdrawn and a destination account where the funds are deposited. The DCI pattern allows us to define the behaviors associated with these roles separately from the data structure of the accounts themselves. This means that the logic for transferring money can be encapsulated in a context, such as a MoneyTransfer class, which orchestrates the interaction between the source and destination accounts. By doing so, we achieve a more modular and flexible design that can easily accommodate future changes or additional features, such as transaction logging or validation rules.

<pre class="mermaid" style="display:flex; justify-content: center;">
sequenceDiagram
    participant M as Main
    participant S as Source Account
    participant D as Destination Account
    participant MT as MoneyTransfer

    M->>S: new Account("1", 1000) with TransferSource
    M->>D: new Account("2", 500) with TransferDestination
    M->>MT: new MoneyTransfer(source, destination, 100)
    M->>MT: execute()
    MT->>S: canWithdraw(100)
    alt Source can withdraw
        S-->>MT: true
        MT->>S: withdraw(100)
        S->>S: updateBalance(900)
        MT->>D: deposit(100)
        D->>D: updateBalance(600)
    else Source cannot withdraw
        S-->>MT: false
        MT->>M: throw Exception("Source cannot withdraw")
    end
</pre>

First, I want to show the classic implementation in Scala. By Trygve the language is well suited for this pattern, as traits implementation allow to define the roles and the context in a very clean way and mixins traits into the objects allow explicitely define the roles of the each object.

```scala
trait TransferSource {
  def balance: BigDecimal
  def updateBalance(newBalance: BigDecimal): Unit

  def withdraw(amount: BigDecimal): Unit = {
    require(amount > 0, "Amount must be positive")
    require(balance >= amount, "Insufficient funds")

    updateBalance(balance - amount)
  }

  def canWithdraw(amount: BigDecimal): Boolean =
    amount > 0 && balance >= amount
}

trait TransferDestination {
  def balance: BigDecimal
  def updateBalance(newBalance: BigDecimal): Unit

  def deposit(amount: BigDecimal): Unit = {
    require(amount > 0, "Amount must be positive")
    updateBalance(balance + amount)
  }
}

case class Account(id: String, var balance: BigDecimal)

class MoneyTransfer(
    source: Account with TransferSource,
    destination: Account with TransferDestination,
    amount: BigDecimal
) {
  def execute(): Unit = {
    require(source.canWithdraw(amount), "Source cannot withdraw")

    source.withdraw(amount)
    destination.deposit(amount)
  }
}

object Main extends App {
  val source = new Account("1", 1000) with TransferSource
  val dest = new Account("2", 500) with TransferDestination

  val transfer = new MoneyTransfer(source, dest, 100)
  transfer.execute()
}
```

### Basic PHP Implementation

Some languages don't have the same level of flexibility and expressiveness as Scala. Most obvious approach is class wrapper definition for actor roles. I see both pros and cons of this approach.
The pros are that it's very easy to understand and implement. The cons are that it's not very flexible and it's not very easy to extend and require additional boilerplate code.

Here is the sequence diagram of the implementation:

<pre class="mermaid" style="display:flex; justify-content: center;">
sequenceDiagram
    participant MT as MoneyTransfer
    participant S as MoneySource
    participant D as MoneyDestination
    participant Source as Source Account
    participant Destination as Destination Account

    MT->>S: bind(Source)
    S->>Source: validatePlayer(Source)
    alt Player is valid
        S-->>MT: Player bound successfully
    else Player is invalid
        S-->>MT: throw Exception("Player does not meet role requirements")
    end

    MT->>D: bind(Destination)
    D->>Destination: validatePlayer(Destination)
    alt Player is valid
        D-->>MT: Player bound successfully
    else Player is invalid
        D-->>MT: throw Exception("Player does not meet role requirements")
    end

    MT->>S: withdraw(amount)
    S->>Source: getBalance()
    Source-->>S: balance
    alt Insufficient funds
        S-->>MT: throw Exception("Insufficient funds")
    else Sufficient funds
        S->>Source: setBalance(newBalance)
        S-->>MT: Withdrawal successful
    end

    MT->>D: deposit(amount)
    D->>Destination: getBalance()
    Destination-->>D: currentBalance
    D->>Destination: setBalance(newBalance)
    D-->>MT: Deposit successful

    MT->>S: unbind()
    MT->>D: unbind()
</pre>

1. First, let's create the Data part (domain objects):

```php
// /src/Model/Entity/Account.php
namespace App\Model\Entity;

use Cake\ORM\Entity;

class Account extends Entity
{
    protected $_accessible = [
        'balance' => true,
        'name' => true
    ];

    protected float $balance;

    public function getBalance(): float
    {
        return $this->get('balance');
    }

    public function setBalance(float $amount): void
    {
        $this->set('balance', $amount);
    }
}
```

2. Create Role management classes:

```php
// /src/Context/Contracts/RoleInterface.php
namespace App\Context\Contracts;

interface RoleInterface
{
    public function bind($player): void;
    public function unbind(): void;
    public function getPlayer();
}
```

```php
// /src/Context/Roles/AbstractRole.php
namespace App\Context\Roles;

use App\Context\Contracts\RoleInterface;

abstract class AbstractRole implements RoleInterface
{
    protected $player;

    public function bind($player): void
    {
        if (!$this->validatePlayer($player)) {
            throw new \InvalidArgumentException('Player does not meet role requirements');
        }
        $this->player = $player;
    }

    public function unbind(): void
    {
        $this->player = null;
    }

    public function getPlayer()
    {
        return $this->player;
    }

    abstract protected function validatePlayer($player): bool;
}
```

3. Create roles that define transfer behaviors:

```php
// /src/Context/Roles/MoneySource.php
namespace App\Context\Roles;

use App\Model\Entity\Account;

class MoneySource extends AbstractRole
{
    protected function validatePlayer($player): bool
    {
        return $player instanceof Account
            && method_exists($player, 'getBalance')
            && method_exists($player, 'setBalance');
    }

    public function withdraw(float $amount): void
    {
        $balance = $this->player->getBalance();
        if ($balance < $amount) {
            throw new \Exception('Insufficient funds');
        }
        $this->player->setBalance($balance - $amount);
    }
}
```

```php
// /src/Context/Roles/MoneyDestination.php
namespace App\Context\Roles;

use App\Model\Entity\Account;

class MoneyDestination extends AbstractRole
{
    protected function validatePlayer($player): bool
    {
        return $player instanceof Account
            && method_exists($player, 'getBalance')
            && method_exists($player, 'setBalance');
    }

    public function deposit(float $amount): void
    {
        $currentBalance = $this->player->getBalance();
        $this->player->setBalance($currentBalance + $amount);
    }
}
```

4. Create the context that orchestrates the transfer:

```php
// /src/Context/MoneyTransfer.php

namespace App\Context;

use App\Model\Entity\Account;
use App\Context\Roles\MoneySource;
use App\Context\Roles\MoneyDestination;

class MoneyTransfer
{
    private MoneySource $sourceRole;
    private MoneyDestination $destinationRole;
    private float $amount;

    public function __construct(Account $source, Account $destination, float $amount)
    {
        $this->sourceRole = new MoneySource();
        $this->sourceRole->bind($source);

        $this->destinationRole = new MoneyDestination();
        $this->destinationRole->bind($destination);

        $this->amount = $amount;
    }

    public function execute(): void
    {
        try {
            $this->sourceRole->withdraw($this->amount);
            $this->destinationRole->deposit($this->amount);
        } finally {
            $this->sourceRole->unbind();
            $this->destinationRole->unbind();
        }
    }

    public function __destruct()
    {
        $this->sourceRole->unbind();
        $this->destinationRole->unbind();
    }
}
```

5. Implements controller logic

```php
// /src/Controller/AccountsController.php

namespace App\Controller;

use App\Context\MoneyTransfer;

class AccountsController extends AppController
{

    public $Accounts;

    public function initialize(): void
    {
        parent::initialize();
        $this->Accounts = $this->fetchTable('Accounts');

    }

    public function transfer()
    {
        if ($this->request->is(['post'])) {
            $sourceAccount = $this->Accounts->get($this->request->getData('source_id'));
            $destinationAccount = $this->Accounts->get($this->request->getData('destination_id'));
            $amount = (float)$this->request->getData('amount');
            try {
                $context = new MoneyTransfer($sourceAccount, $destinationAccount, $amount);
                $context->execute();

                $this->Accounts->saveMany([
                    $sourceAccount,
                    $destinationAccount
                ]);

                $this->Flash->success('Transfer completed successfully');
            } catch (\Exception $e) {
                $this->Flash->error($e->getMessage());
            }
            return $this->redirect(['action' => 'transfer']);
        }

        $this->set('accounts', $this->Accounts->find('list', valueField: ['name'])->all());
    }
}
```

### Implementing DCI pattern in CakePHP philosophy way

One can look at the roles like a behaviors for table records. We can't use table behaviors directly, becasue it completely break conception of methods separation based on the roles. In case of talbe behaviors we can't define methods for different roles for same instance as all class objects will have access to all roles methods.

So we going to implement the behaviors like roles on the entity level.

1. RoleBehavior layer that mimics CakePHP's behavior system but for entities:

<pre class="mermaid" style="display:flex; justify-content: center;">
classDiagram
    class RoleBehavior {
        #EntityInterface _entity
        #array _config
        #array _defaultConfig
        +__construct(entity: EntityInterface, config: array)
        +initialize(config: array): void
        +getConfig(key: string|null, default: mixed): mixed
        hasProperty(property: string): bool
        getProperty(property: string): mixed
        setProperty(property: string, value: mixed): void
        +implementedMethods(): array
        +implementedEvents(): array
    }

    class ObjectRegistry {
        #_resolveClassName(class: string): string
        #_create(class: string, alias: string, config: array): object
        #_resolveKey(name: string): string
        +clear(): void
    }

    class RoleRegistry {
        -EntityInterface _entity
        +__construct(entity: EntityInterface)
        #_resolveClassName(class: string): string
        #_create(class: string, alias: string, config: array): RoleBehavior
        #_resolveKey(name: string): string
        +clear(): void
        #_throwMissingClassError(class: string, plugin: string|null): void
    }

    class RoleAwareEntity {
        -RoleRegistry|null _roles
        -array _roleMethods
        #_getRoleRegistry(): RoleRegistry
        +addRole(role: string, config: array): void
        +removeRole(role: string): void
        +hasRole(role: string): bool
        #getRole(role: string): RoleBehavior
        +__call(method: string, arguments: array)
        +hasMethod(method: string): bool
    }

    ObjectRegistry <|-- RoleRegistry
    RoleAwareEntity o-- RoleRegistry
    RoleRegistry o-- RoleBehavior
    RoleAwareEntity ..> RoleBehavior
</pre>

```php
// /src/Model/Role/RoleBehavior.php
namespace App\Model\Role;

use Cake\Datasource\EntityInterface;
use Cake\Event\EventDispatcherInterface;
use Cake\Event\EventDispatcherTrait;

abstract class RoleBehavior implements EventDispatcherInterface
{
    use EventDispatcherTrait;

    protected EntityInterface $_entity;
    protected array $_config;

    protected $_defaultConfig = [];

    public function __construct(EntityInterface $entity, array $config = [])
    {
        $this->_entity = $entity;
        $this->_config = array_merge($this->_defaultConfig, $config);
        $this->initialize($config);
    }

    /**
     * Initialize hook - like CakePHP behaviors
     */
    public function initialize(array $config): void
    {
    }

    /**
     * Get behavior config
     */
    public function getConfig(?string $key = null, $default = null): mixed
    {
        if ($key === null) {
            return $this->_config;
        }
        return $this->_config[$key] ?? $default;
    }

    /**
     * Check if entity has specific property/method
     */
    protected function hasProperty(string $property): bool
    {
        return $this->_entity->has($property);
    }

    /**
     * Get entity property
     */
    protected function getProperty(string $property): mixed
    {
        return $this->_entity->get($property);
    }

    /**
     * Set entity property
     */
    protected function setProperty(string $property, mixed $value): void
    {
        $this->_entity->set($property, $value);
    }

    /**
     * Get implemented methods - similar to CakePHP behaviors
     */
    public function implementedMethods(): array
    {
        return [];
    }

    /**
     * Get implemented events
     */
    public function implementedEvents(): array
    {
        return [];
    }
}
```

2. Now we can create a RoleRegistry to manage roles for entities:

```php
// /src/Model/Role/RoleRegistry.php
namespace App\Model\Role;

use Cake\Core\ObjectRegistry;
use Cake\Datasource\EntityInterface;
use InvalidArgumentException;

class RoleRegistry extends ObjectRegistry
{
    private EntityInterface $_entity;

    public function __construct(EntityInterface $entity)
    {
        $this->_entity = $entity;
    }

    /**
     * Should return a string identifier for the object being loaded.
     *
     * @param string $class The class name to register.
     * @return string
     */
    protected function _resolveClassName(string $class): string
    {
        if (class_exists($class)) {
            return $class;
        }

        $className = 'App\\Model\\Role\\' . $class . 'Role';
        if (!class_exists($className)) {
            throw new InvalidArgumentException("Role class for '{$class}' not found");
        }

        return $className;
    }

    /**
     * Create an instance of a role.
     *
     * @param string $class The class to create.
     * @param string $alias The alias of the role.
     * @param array $config The config array for the role.
     * @return \App\Model\Role\RoleBehavior
     */
    protected function _create($class, string $alias, array $config): RoleBehavior
    {
        return new $class($this->_entity, $config);
    }

    /**
     * Get the key used to store roles in the registry.
     *
     * @param string $name The role name to get a key for.
     * @return string
     */
    protected function _resolveKey(string $name): string
    {
        return strtolower($name);
    }

    /**
     * Clear all roles from the registry.
     *
     * @return void
     */
    public function clear(): void
    {
        $this->reset();
    }

    /**
     * @inheritDoc
     */
    protected function _throwMissingClassError(string $class, ?string $plugin): void
    {
        throw new InvalidArgumentException("Role class for '{$class}' not found");
    }
}
```

3. And add role support to Entity:

```php
// /src/Model/Entity/RoleAwareEntity.php
namespace App\Model\Entity;

use App\Model\Role\RoleBehavior;
use App\Model\Role\RoleRegistry;
use Cake\ORM\Entity;
use BadMethodCallException;

class RoleAwareEntity extends Entity
{
    private ?RoleRegistry $_roles = null;
    private array $_roleMethods = [];

    protected function _getRoleRegistry(): RoleRegistry
    {
        if ($this->_roles === null) {
            $this->_roles = new RoleRegistry($this);
        }
        return $this->_roles;
    }

    public function addRole(string $role, array $config = []): void
    {
        $roleInstance = $this->_getRoleRegistry()->load($role, $config);

        foreach ($roleInstance->implementedMethods() as $method => $callable) {
            $this->_roleMethods[$method] = $role;
        }
    }

    public function removeRole(string $role): void
    {
        $this->_roleMethods = array_filter(
            $this->_roleMethods,
            fn($roleType) => $roleType !== $role
        );

        $this->_getRoleRegistry()->unload($role);
    }

    public function hasRole(string $role): bool
    {
        return $this->_getRoleRegistry()->has($role);
    }

    protected function getRole(string $role): RoleBehavior
    {
        return $this->_getRoleRegistry()->load($role);
    }

    public function __call(string $method, array $arguments)
    {
        if (isset($this->_roleMethods[$method])) {
            $role = $this->getRole($this->_roleMethods[$method]);
            return $role->$method(...$arguments);
        }

        throw new BadMethodCallException(sprintf(
            'Method %s::%s does not exist',
            static::class,
            $method
        ));
    }

    public function hasMethod(string $method): bool
    {
        return isset($this->_roleMethods[$method]);
    }
}
```

4. Now our Account entity can use roles:
```php
// /src/Model/Entity/ComplexAccount.php
namespace App\Model\Entity;

    /**
     * @method void withdraw(float $amount)
     * @method bool canWithdraw(float $amount)
     * @method void deposit(float $amount)
     * @method bool canDeposit(float $amount)
     * @method void logOperation(string $operation, array $data)
     * @method void notify(string $type, array $data)
     */
    class ComplexAccount extends RoleAwareEntity
    {
        protected array $_accessible = [
            'balance' => true,
            'account_type' => true,
            'status' => true,
            'is_frozen' => true,
            'created' => true,
            'modified' => true
        ];
    }
```

5. Let's rewrite the money transfer example using our new role layer system:

<pre class="mermaid" style="display:flex; justify-content: center;">
classDiagram
    class AuditableBehavior {
        #Table _auditLogsTable
        +initialize(config: array): void
        +logOperation(table: Table, foreignKey: int, operation: string, data: array)
    }

    class RoleBehavior {
        #EntityInterface _entity
        #array _config
        #array _defaultConfig
        +initialize(config: array)
        +getConfig(key: string|null): mixed
        #hasProperty(property: string): bool
        #getProperty(property: string): mixed
        #setProperty(property: string, value: mixed)
    }

    class AuditableRole {
        +implementedMethods(): array
        +logOperation(operation: string, data: array): void
    }

    class TransferSourceRole {
        #ComplexAccount _entity
        #_defaultConfig: array
        +implementedMethods(): array
        +withdraw(amount: float): void
        +canWithdraw(amount: float): bool
    }

    class TransferDestinationRole {
        #ComplexAccount _entity
        #_defaultConfig: array
        +implementedMethods(): array
        +deposit(amount: float): void
        +canDeposit(amount: float): bool
    }

    class MoneyTransferContext {
        -ComplexAccount source
        -ComplexAccount destination
        -float amount
        -ComplexAccountsTable ComplexAccounts
        +__construct(ComplexAccountsTable, source, destination, amount, config)
        -attachRoles(config: array): void
        +execute(): void
        -detachRoles(): void
    }

    class ComplexAccountsController {
        +ComplexAccounts
        +initialize(): void
        +transfer()
    }

    RoleBehavior <|-- AuditableRole
    RoleBehavior <|-- TransferSourceRole
    RoleBehavior <|-- TransferDestinationRole

    MoneyTransferContext --> TransferSourceRole : uses
    MoneyTransferContext --> TransferDestinationRole : uses
    MoneyTransferContext --> AuditableRole : uses
    ComplexAccountsController --> MoneyTransferContext : creates
    AuditableRole ..> AuditableBehavior : uses

    note for TransferSourceRole "Handles withdrawal operations\nand balance validation"
    note for TransferDestinationRole "Handles deposit operations\nand deposit limits"
    note for AuditableRole "Provides audit logging\ncapabilities"
    note for MoneyTransferContext "Orchestrates money transfer\nwith role management"
</pre>

#### TransferSourceRole

```php
// /src/Model/Role/TransferSourceRole.php
namespace App\Model\Role;

use App\Model\Entity\ComplexAccount;
use Cake\Datasource\EntityInterface;

class TransferSourceRole extends RoleBehavior
{

    /**
     * @var ComplexAccount
     */
    protected EntityInterface $_entity;

    protected $_defaultConfig = [
        'field' => 'balance',
        'minimumBalance' => 0
    ];

    public function implementedMethods(): array
    {
        return [
            'withdraw' => 'withdraw',
            'canWithdraw' => 'canWithdraw'
        ];
    }

    public function withdraw(float $amount): void
    {
        if (!$this->canWithdraw($amount)) {
            throw new \InvalidArgumentException('Cannot withdraw: insufficient funds or invalid amount');
        }

        $balanceField = $this->getConfig('field');
        $currentBalance = $this->getProperty($balanceField);

        $this->_entity->logOperation('pre_withdrawal', [
            'amount' => $amount,
            'current_balance' => $currentBalance
        ]);

        $this->setProperty($balanceField, $currentBalance - $amount);

        $this->_entity->logOperation('post_withdrawal', [
            'amount' => $amount,
            'new_balance' => $this->getProperty($balanceField)
        ]);
    }

    public function canWithdraw(float $amount): bool
    {
        if ($amount <= 0) {
            return false;
        }

        $balanceField = $this->getConfig('field');
        $minimumBalance = $this->getConfig('minimumBalance');

        return $this->getProperty($balanceField) - $amount >= $minimumBalance &&
               $this->getProperty('status') === 'active' &&
               !$this->getProperty('is_frozen');
    }
}
```

#### TransferDestinationRole

```php
// /src/Model/Role/TransferDestinationRole.php
namespace App\Model\Role;

use Cake\Datasource\EntityInterface;

class TransferDestinationRole extends RoleBehavior
{
    /**
     * @var ComplexAccount
     */
    protected EntityInterface $_entity;

    protected $_defaultConfig = [
        'field' => 'balance',
        'maxDeposit' => null
    ];

    public function implementedMethods(): array
    {
        return [
            'deposit' => 'deposit',
            'canDeposit' => 'canDeposit'
        ];
    }

    public function deposit(float $amount): void
    {
        if (!$this->canDeposit($amount)) {
            throw new \InvalidArgumentException('Cannot deposit: invalid amount or limit exceeded');
        }

        $balanceField = $this->getConfig('field');
        $currentBalance = $this->getProperty($balanceField);

        $this->_entity->logOperation('pre_deposit', [
            'amount' => $amount,
            'current_balance' => $currentBalance
        ]);

        $this->setProperty($balanceField, $currentBalance + $amount);

        $this->_entity->logOperation('post_deposit', [
            'amount' => $amount,
            'new_balance' => $this->getProperty($balanceField)
        ]);
    }

    public function canDeposit(float $amount): bool
    {
        if ($amount <= 0) {
            return false;
        }

        $maxDeposit = $this->getConfig('maxDeposit');
        return ($maxDeposit === null || $amount <= $maxDeposit) &&
               $this->getProperty('status') === 'active' &&
               !$this->getProperty('is_frozen');
    }
}
```

6. Lets implement audit functionality to show more complex role usage.

#### AuditableRole

```php
// /src/Model/Role/AuditableRole.php
namespace App\Model\Role;

use Cake\ORM\TableRegistry;

class AuditableRole extends RoleBehavior
{
    public function implementedMethods(): array
    {
        return [
            'logOperation' => 'logOperation'
        ];
    }

    public function logOperation(string $operation, array $data): void
    {
        $table = TableRegistry::getTableLocator()->get($this->_entity->getSource());
        $table->logOperation($table, $this->_entity->id, $operation, $data);
    }
}
```

#### AuditableBehavior

```php
// /src/Model/Behavior/AuditableBehavior.php
namespace App\Model\Behavior;

use Cake\ORM\Behavior;
use Cake\ORM\Table;
use Cake\ORM\TableRegistry;

class AuditableBehavior extends Behavior
{
    protected array $_defaultConfig = [
        'implementedMethods' => [
            'logOperation' => 'logOperation',
        ],
    ];

    protected Table $_auditLogsTable;

    public function initialize(array $config): void
    {
        parent::initialize($config);
        $this->_auditLogsTable = TableRegistry::getTableLocator()->get('AuditLogs');
    }

    public function logOperation(Table $table, int $foreignKey, string $operation, array $data = [])
    {
        $log = $this->_auditLogsTable->newEntity([
            'model' => $table->getAlias(),
            'foreign_key' => $foreignKey,
            'operation' => $operation,
            'data' => json_encode($data),
            'created' => new \DateTime()
        ]);

        return $this->_auditLogsTable->save($log);
    }
}
```

6. Lets take a look on improved context implementation.

```php
// /src/Context/MoneyTransfer/MoneyTransferContext.php
namespace App\Context\MoneyTransfer;

use App\Model\Entity\ComplexAccount;
use App\Model\Table\ComplexAccountsTable;

class MoneyTransferContext
{
    private readonly ComplexAccount $source;
    private readonly ComplexAccount $destination;
    private readonly float $amount;
    private readonly ComplexAccountsTable $ComplexAccounts;

    public function __construct(
        ComplexAccountsTable $ComplexAccounts,
        ComplexAccount $source,
        ComplexAccount $destination,
        float $amount,
        array $config = []
    ) {
        $this->source = $source;
        $this->destination = $destination;
        $this->amount = $amount;
        $this->ComplexAccounts = $ComplexAccounts;
        $this->attachRoles($config);
    }

    private function attachRoles(array $config): void
    {
        $this->source->addRole('Auditable');
        $this->source->addRole('TransferSource', $config['source'] ?? []);

        $this->destination->addRole('Auditable');
        $this->destination->addRole('TransferDestination', $config['destination'] ?? []);
    }

    public function execute(): void
    {
        try {
            $this->ComplexAccounts->getConnection()->transactional(function() {
                if (!$this->source->canWithdraw($this->amount)) {
                    throw new \InvalidArgumentException('Source cannot withdraw this amount');
                }

                if (!$this->destination->canDeposit($this->amount)) {
                    throw new \InvalidArgumentException('Destination cannot accept this deposit');
                }

                $this->source->withdraw($this->amount);
                $this->destination->deposit($this->amount);

                // This code will not able to work! Methods not attached not available, and logic errors does not possible to perform in context.
                // $this->source->deposit($this->amount);
                // $this->destination->withdraw($this->amount);


                $this->ComplexAccounts->saveMany([
                    $this->source,
                    $this->destination
                ]);
            });
        } finally {
            $this->detachRoles();
        }
    }

    private function detachRoles(): void
    {
        $this->source->removeRole('TransferSource');
        $this->source->removeRole('Auditable');

        $this->destination->removeRole('TransferDestination');
        $this->destination->removeRole('Auditable');
    }
}
```

7. And finally lets implements controller logic.

```php
// /src/Controller/ComplexAccountsController.php
namespace App\Controller;

use App\Context\MoneyTransfer\MoneyTransferContext as MoneyTransfer;

class ComplexAccountsController extends AppController
{

    public $ComplexAccounts;

    public function initialize(): void
    {
        parent::initialize();
        $this->ComplexAccounts = $this->fetchTable('ComplexAccounts');

    }

    public function transfer()
    {
        if ($this->request->is(['post'])) {
            try {
                $source = $this->ComplexAccounts->get($this->request->getData('source_id'));
                $destination = $this->ComplexAccounts->get($this->request->getData('destination_id'));
                $amount = (float)$this->request->getData('amount');

                $transfer = new MoneyTransfer($this->ComplexAccounts, $source, $destination, $amount);

                $transfer->execute();

                $this->Flash->success('Transfer completed successfully');

            } catch (\InvalidArgumentException $e) {
                $this->Flash->error($e->getMessage());
            }
            $this->redirect(['action' => 'transfer']);
        }

        $this->set('complexAccounts', $this->ComplexAccounts->find('list', valueField: ['account_type', 'id'])->all());
    }
}
```

The money transfer flow is shown in the following diagram:

<pre class="mermaid" style="display:flex; justify-content: center;">
sequenceDiagram
    participant CC as ComplexAccountsController
    participant MT as MoneyTransferContext
    participant SA as Source Account
    participant DA as Destination Account
    participant TSR as TransferSourceRole
    participant TDR as TransferDestinationRole
    participant AR as AuditableRole
    participant AB as AuditableBehavior
    participant DB as Database

    CC->>MT: new MoneyTransfer(accounts, source, destination, amount)
    activate MT

    MT->>SA: addRole('Auditable')
    MT->>SA: addRole('TransferSource')
    MT->>DA: addRole('Auditable')
    MT->>DA: addRole('TransferDestination')

    CC->>MT: execute()

    MT->>SA: canWithdraw(amount)
    SA->>TSR: canWithdraw(amount)
    TSR->>SA: getProperty('balance')
    TSR->>SA: getProperty('status')
    TSR->>SA: getProperty('is_frozen')
    TSR-->>MT: true/false

    alt Can Withdraw
        MT->>DA: canDeposit(amount)
        DA->>TDR: canDeposit(amount)
        TDR->>DA: getProperty('balance')
        TDR->>DA: getProperty('status')
        TDR->>DA: getProperty('is_frozen')
        TDR-->>MT: true/false

        alt Can Deposit
            MT->>SA: withdraw(amount)
            SA->>TSR: withdraw(amount)
            TSR->>SA: logOperation('pre_withdrawal')
            SA->>AR: logOperation('pre_withdrawal')
            AR->>AB: logOperation(table, id, operation, data)
            AB->>DB: save audit log

            TSR->>SA: setProperty(balance, newBalance)

            TSR->>SA: logOperation('post_withdrawal')
            SA->>AR: logOperation('post_withdrawal')
            AR->>AB: logOperation(table, id, operation, data)
            AB->>DB: save audit log

            MT->>DA: deposit(amount)
            DA->>TDR: deposit(amount)
            TDR->>DA: logOperation('pre_deposit')
            DA->>AR: logOperation('pre_deposit')
            AR->>AB: logOperation(table, id, operation, data)
            AB->>DB: save audit log

            TDR->>DA: setProperty(balance, newBalance)

            TDR->>DA: logOperation('post_deposit')
            DA->>AR: logOperation('post_deposit')
            AR->>AB: logOperation(table, id, operation, data)
            AB->>DB: save audit log

            MT->>DB: saveMany([source, destination])
        else Cannot Deposit
            MT-->>CC: throw InvalidArgumentException
        end
    else Cannot Withdraw
        MT-->>CC: throw InvalidArgumentException
    end

    MT->>SA: removeRole('TransferSource')
    MT->>SA: removeRole('Auditable')
    MT->>DA: removeRole('TransferDestination')
    MT->>DA: removeRole('Auditable')
    deactivate MT

    alt Success
        CC->>CC: Flash.success('Transfer completed')
    else Error
        CC->>CC: Flash.error(error.message)
    end

    CC->>CC: redirect(['action' => 'transfer'])
</pre>


## Conclusion

DCI pattern helps us write safer code by controlling what objects can do at any given time. Like in our money transfer example, we make sure the source account can only take money out and the destination account can only receive money. This prevents mistakes and makes the code more secure.

Context is a great way to keep code organized and focused. It serves as an excellent implementation of the Single Responsibility Principle. Each context, like our MoneyTransferContext, does just one thing and does it well. This makes the code easier to understand and test because each piece has a clear job to do.

Even though PHP isn't as flexible as some other programming languages (for example, we can't change object behavior on the fly), we found good ways to make DCI work. Our RoleBehavior and RoleRegistry classes give us a solid way to manage different roles for our objects. CakePHP turns out to be a great framework for using the DCI pattern. We were able to build on CakePHP's existing features, like its behavior system, to create our role-based approach.


## Demo Project for Article

The examples used in this article are located at https://github.com/skie/cakephp-dci and available for testing.
