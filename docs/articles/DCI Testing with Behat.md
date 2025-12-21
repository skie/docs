---
title: DCI Testing with Behat
date: 2024-12-19
description: In our previous article, we explored the Data-Context-Interaction (DCI) pattern and its implementation in PHP using CakePHP. Now, let's dive into testing DCI implementations using Behavior-Driven Development (BDD) with Behat, exploring a practical hotel room reservation system.
tags:
  - CakePHP
  - DCI
  - Testing
  - Behat
  - BDD
  - Behavior-Driven Development
---

In our [previous article](/articles/DCI), we explored the Data-Context-Interaction (DCI) pattern and its implementation in PHP using CakePHP. We demonstrated how DCI helps separate data structures from their runtime behaviors through roles and contexts, using a money transfer system as an example. Now, let's dive into testing DCI implementations using Behavior-Driven Development (BDD) with Behat, exploring a practical hotel room reservation system.

### Room Reservation System Overview

The room reservation system demonstrates DCI's power in managing complex business rules and interactions. In this system, rooms and guests are our core data objects, while the reservation process involves multiple roles and behaviors. A room can be reservable under certain conditions (availability, capacity), and guests can have different privileges based on their loyalty levels. The reservation context orchestrates these interactions, ensuring business rules are followed and the system maintains consistency.

### Database Structure

The database schema reflects our domain model with proper relationships between entities:

<pre class="mermaid" style="display:flex; justify-content: center;">
erDiagram
    rooms {
        id integer PK
        number varchar(10)
        type varchar(50)
        capacity integer
        base_price decimal
        status varchar(20)
        created datetime
        modified datetime
    }

    guests {
        id integer PK
        name varchar(100)
        email varchar(100)
        phone varchar(20)
        loyalty_level varchar(20)
        created datetime
        modified datetime
    }

    reservations {
        id integer PK
        room_id integer FK
        primary_guest_id integer FK
        check_in date
        check_out date
        status varchar(20)
        total_price decimal
        created datetime
        modified datetime
    }

    reservation_guests {
        id integer PK
        reservation_id integer FK
        guest_id integer FK
        created datetime
    }

    audit_logs {
        id integer PK
        model varchar(100)
        foreign_key integer
        operation varchar(50)
        data json
        created datetime
    }

    reservations ||--|| rooms : "has"
    reservations ||--|| guests : "primary guest"
    reservation_guests }|--|| reservations : "belongs to"
    reservation_guests }|--|| guests : "includes"
    audit_logs }|--|| reservations : "logs"
</pre>

Key aspects of this schema:
- Rooms table stores physical hotel rooms with their properties
- Guests table maintains customer information including loyalty status
- Reservations table handles booking details with pricing
- Reservation_guests enables multiple guests per reservation
- Audit_logs provides system-wide operation tracking



<pre class="mermaid" style="display:flex; justify-content: center;">
classDiagram
    class Room {
        +String number
        +String type
        +Integer capacity
        +Decimal basePrice
        +String status
    }

    class Guest {
        +String name
        +String email
        +String phone
        +String loyaltyLevel
    }

    class Reservation {
        +Room room
        +Guest primaryGuest
        +Date checkIn
        +Date checkOut
        +String status
        +Decimal totalPrice
    }

    class ReservationGuest {
        +Reservation reservation
        +Guest guest
    }

    Reservation --> Room
    Reservation --> Guest
    ReservationGuest --> Reservation
    ReservationGuest --> Guest
</pre>

The class diagram above shows our core data model. Each entity has specific attributes that define its state, but the interesting part comes with how these objects interact during the reservation process. Let's examine how DCI roles enhance this basic structure:

<pre class="mermaid" style="display:flex; justify-content: center;">
classDiagram
    class ReservableRoom {
        +isAvailableForDates(checkIn, checkOut)
        +canAccommodateGuests(guestCount)
        +calculatePrice(checkIn, checkOut)
    }

    class ReservingGuest {
        +canMakeReservation()
        +calculateDiscount(basePrice)
    }

    class RoomReservationContext {
        +Room room
        +Guest primaryGuest
        +List~Guest~ additionalGuests
        +Date checkIn
        +Date checkOut
        +execute()
    }

    Room ..|> ReservableRoom : implements
    Guest ..|> ReservingGuest : implements
    RoomReservationContext --> ReservableRoom : uses
    RoomReservationContext --> ReservingGuest : uses
</pre>

The reservation process involves multiple interactions between objects, each playing their specific roles. The sequence diagram below illustrates how these components work together:

<pre class="mermaid" style="display:flex; justify-content: center;">
sequenceDiagram
    participant RC as ReservationsController
    participant RRC as RoomReservationContext
    participant R as Room
    participant G as Guest
    participant RR as ReservableRoom
    participant RG as ReservingGuest
    participant DB as Database

    RC->>RRC: new RoomReservationContext(room, guest, dates)
    activate RRC

    RRC->>R: addRole('ReservableRoom')
    RRC->>G: addRole('ReservingGuest')

    RC->>RRC: execute()

    RRC->>R: isAvailableForDates(checkIn, checkOut)
    R->>RR: isAvailableForDates(checkIn, checkOut)
    RR-->>RRC: true/false

    alt Room is available
        RRC->>R: canAccommodateGuests(guestCount)
        R->>RR: canAccommodateGuests(guestCount)
        RR-->>RRC: true/false

        alt Can accommodate guests
            RRC->>G: canMakeReservation()
            G->>RG: canMakeReservation()
            RG-->>RRC: true/false

            alt Guest can make reservation
                RRC->>R: calculatePrice(checkIn, checkOut)
                R->>RR: calculatePrice(checkIn, checkOut)
                RR-->>RRC: basePrice

                RRC->>G: calculateDiscount(basePrice)
                G->>RG: calculateDiscount(basePrice)
                RG-->>RRC: discount

                RRC->>DB: save reservation
                DB-->>RRC: success
            else
                RRC-->>RC: throw GuestCannotReserveException
            end
        else
            RRC-->>RC: throw CapacityExceededException
        end
    else
        RRC-->>RC: throw RoomNotAvailableException
    end

    RRC->>R: removeRole('ReservableRoom')
    RRC->>G: removeRole('ReservingGuest')
    deactivate RRC
</pre>

This sequence diagram demonstrates the complete reservation flow, including role attachment, validation checks, price calculations, and proper error handling. Each step ensures that business rules are followed and the system maintains consistency.

### Testing with Behavior-Driven Development

While our DCI implementation provides clear separation of concerns and maintainable code, we need to ensure it works correctly through comprehensive testing. Behavior-Driven Development (BDD) with Behat is particularly well-suited for testing DCI implementations because both approaches focus on behaviors and interactions.

#### Understanding Behat and Gherkin

Behat is a PHP framework for BDD, which allows us to write tests in natural language using Gherkin syntax. Gherkin is a business-readable domain-specific language that lets you describe software's behavior without detailing how that behavior is implemented. This aligns perfectly with DCI's focus on separating what objects are from what they do.

A typical Gherkin feature file consists of:
- **Feature**: A description of the functionality being tested
- **Scenario**: A specific situation being tested
- **Given**: The initial context
- **When**: The action being taken
- **Then**: The expected outcome

### Setting Up Behat Testing Environment

First, add the required dependencies to your `composer.json`:

```json
{
    "require-dev": {
        "behat/behat": "^3.13",
        "behat/mink-extension": "^2.3",
        "behat/mink-browserkit-driver": "^2.1",
        "dmore/behat-chrome-extension": "^1.4"
    }
}
```

Here's how we configure Behat for our project:

```yaml
# behat.yml
default:
  autoload:
    "": "%paths.base%/tests/Behat"
  suites:
    reservation:
      paths:
        features: "%paths.base%/tests/Behat/Features/Reservation"
      contexts:
        - App\Test\Behat\Context\ReservationContext
        - App\Test\Behat\Context\DatabaseContext
  extensions:
    Behat\MinkExtension:
      base_url: 'http://localhost'
      sessions:
        default:
          browser_stack: ~
```

### Complete Behat Test Implementation


Our test implementation consists of several key components that work together to verify our DCI implementation:

#### Base Test Context Setup

The BaseContext class provides basic test infrastructure, handling test environment initialization and database connections. It loads the application bootstrap file and configures the test environment, including database connections and debug settings.

```php
// tests/Behat/Context/BaseContext.php
<?php
declare(strict_types=1);

namespace App\Test\Behat\Context;

use Behat\Behat\Context\Context;
use Cake\Core\Configure;
use Cake\ORM\TableRegistry;
use Cake\TestSuite\ConnectionHelper;

abstract class BaseContext implements Context
{
    public function __construct(string $bootstrap = null)
    {
    }

    protected function initialize(): void
    {
        require_once dirname(__DIR__, 3) . '/tests/bootstrap.php';
        require_once dirname(dirname(dirname(__DIR__))) . '/config/bootstrap.php';
        ConnectionHelper::addTestAliases();
        Configure::write('debug', true);
    }

    protected function getTableLocator()
    {
        return TableRegistry::getTableLocator();
    }
}
```

#### Database Management and Fixtures

The DatabaseContext class handles database setup and cleanup, including table creation, data insertion, and deletion. It uses fixtures to populate the database with initial data, ensuring tests start with a known state. This setup allows for consistent testing conditions across different scenarios.

```php
// tests/Behat/Context/DatabaseContext.php
<?php
declare(strict_types=1);

namespace App\Test\Behat\Context;

use Behat\Behat\Hook\Scope\BeforeScenarioScope;
use Behat\Gherkin\Node\TableNode;
use Cake\ORM\TableRegistry;

class DatabaseContext extends BaseContext
{
    private $tables = [
        'audit_logs',
        'reservation_guests',
        'reservations',
        'guests',
        'rooms',
    ];

    /**
     * @BeforeScenario
     */
    public function initializeTest(BeforeScenarioScope $scope): void
    {
        $this->initialize();
        $this->clearDatabase();
    }

    /**
     * @BeforeScenario
     */
    public function clearDatabase(): void
    {
        $connection = TableRegistry::getTableLocator()
            ->get('Reservations')
            ->getConnection();

        $connection->execute('PRAGMA foreign_keys = OFF');
        foreach ($this->tables as $tableName) {
            TableRegistry::getTableLocator()->get($tableName)->deleteAll([]);
        }
        $connection->execute('PRAGMA foreign_keys = ON');
    }

    /**
     * @Given the following rooms exist:
     */
    public function theFollowingRoomsExist(TableNode $rooms): void
    {
        $roomsTable = TableRegistry::getTableLocator()->get('Rooms');
        $headers = $rooms->getRow(0);
        foreach ($rooms->getRows() as $i => $room) {
            if ($i === 0) {
                continue;
            }
            $room = array_combine($headers, $room);
            $entity = $roomsTable->newEntity($room);
            $roomsTable->save($entity);
        }
    }

    /**
     * @Given the following guests exist:
     */
    public function theFollowingGuestsExist(TableNode $guests)
    {
        $guestsTable = TableRegistry::getTableLocator()->get('Guests');
        $headers = $guests->getRow(0);
        foreach ($guests->getRows() as $i => $guest) {
            if ($i === 0) {
                continue;
            }
            $guest = array_combine($headers, $guest);
            $entity = $guestsTable->newEntity($guest);
            $guestsTable->save($entity);
        }
    }

    /**
     * @Given the following reservations exist:
     */
    public function theFollowingReservationsExist(TableNode $reservations)
    {
        $reservationsTable = TableRegistry::getTableLocator()->get('Reservations');
        $headers = $reservations->getRow(0);
        foreach ($reservations->getRows() as $i => $reservation) {
            if ($i === 0) {
                continue;
            }
            $reservation = array_combine($headers, $reservation);
            $entity = $reservationsTable->newEntity($reservation);
            $reservationsTable->save($entity);
        }
    }
}
```
#### Reservation Testing Context

ReservationContext implements the business logic testing for our room reservation system. It manages the test workflow for reservation creation, guest management, and verification of reservation outcomes. This context translates Gherkin steps into actual system operations, handling authentication, room selection, guest assignment, and reservation confirmation. It also captures and verifies error conditions, ensuring our DCI roles and contexts behave correctly under various scenarios.

```php
// tests/Behat/Context/ReservationContext.php
<?php
declare(strict_types=1);

namespace App\Test\Behat\Context;

use App\Context\RoomReservation\RoomReservationContext;
use App\Model\Entity\Guest;
use App\Model\Entity\Room;
use Behat\Behat\Context\Context;
use Behat\Gherkin\Node\TableNode;
use Behat\MinkExtension\Context\RawMinkContext;
use Cake\I18n\DateTime;
use Cake\ORM\TableRegistry;
use PHPUnit\Framework\Assert;

class ReservationContext extends RawMinkContext implements Context
{
    private ?Guest $authenticatedGuest = null;
    private ?Room $selectedRoom = null;
    private array $additionalGuests = [];
    private ?string $lastError = null;
    private ?float $totalPrice = null;
    private ?array $reservationDates = null;
    private ?array $lastLoggedOperation = null;

    /**
     * @Given I am authenticated as :name
     */
    public function iAmAuthenticatedAs(string $name): void
    {
        $this->authenticatedGuest = TableRegistry::getTableLocator()
            ->get('Guests')
            ->find()
            ->where(['name' => $name])
            ->firstOrFail();
    }

    /**
     * @When I try to reserve room :number for the following stay:
     */
    public function iTryToReserveRoomForTheFollowingStay(string $number, TableNode $table): void
    {
        $this->selectedRoom = TableRegistry::getTableLocator()
            ->get('Rooms')
            ->find()
            ->where(['number' => $number])
            ->contain(['Reservations'])
            ->firstOrFail();

        $this->reservationDates = $table->getRowsHash();
    }

    /**
     * @When I add :name as an additional guest
     */
    public function iAddAsAnAdditionalGuest(string $name): void
    {
        $guest = TableRegistry::getTableLocator()
            ->get('Guests')
            ->find()
            ->where(['name' => $name])
            ->firstOrFail();

        $this->additionalGuests[] = $guest;
    }

    private function executeReservation(): void
    {
        if (!$this->selectedRoom || !$this->reservationDates || !$this->authenticatedGuest) {
            return;
        }

        try {
            $context = new RoomReservationContext(
                $this->selectedRoom,
                $this->authenticatedGuest,
                $this->additionalGuests,
                new DateTime($this->reservationDates['check_in']),
                new DateTime($this->reservationDates['check_out'])
            );

            $reservation = $context->execute();
            $this->totalPrice = (float)$reservation->total_price;
            $this->lastError = null;
        } catch (\Exception $e) {
            $this->lastError = $e->getMessage();
        }
    }

    /**
     * @Then the reservation should be confirmed
     */
    public function theReservationShouldBeConfirmed(): void
    {
        $this->executeReservation();

        if ($this->lastError !== null) {
            throw new \Exception("Expected reservation to be confirmed but got error: {$this->lastError}");
        }
    }

    /**
     * @Then the total price should be :price
     */
    public function theTotalPriceShouldBe(string $price): void
    {
        $this->executeReservation();

        $expectedPrice = (float)str_replace('"', '', $price);
        if ($this->totalPrice !== $expectedPrice) {
            throw new \Exception(
                "Expected price to be {$expectedPrice} but got {$this->totalPrice}"
            );
        }
    }

    /**
     * @Then I should see an error :message
     */
    public function iShouldSeeAnError(string $message): void
    {
        $this->executeReservation();

        if ($this->lastError === null) {
            throw new \Exception("Expected error but none was thrown");
        }
        if (strpos($this->lastError, $message) === false) {
            throw new \Exception(
                "Expected error message '{$message}' but got '{$this->lastError}'"
            );
        }
    }

    /**
     * @Then the following operation should be logged:
     */
    public function theFollowingOperationShouldBeLogged(TableNode $table): void
    {
        $expectedLog = $table->getRowsHash();

        $AuditLogs = TableRegistry::getTableLocator()->get('AuditLogs');
        $lastOperation = $AuditLogs->find()->orderByDesc('created')->first();

        Assert::assertNotNull($lastOperation, 'No operation was logged');
        Assert::assertEquals($expectedLog['model'], $lastOperation->model);
        Assert::assertEquals($expectedLog['operation'], $lastOperation->operation);

        $expectedData = [];
        foreach (explode(', ', $expectedLog['data']) as $pair) {
            [$key, $value] = explode('=', $pair);
            $expectedData[$key] = $value;
        }

        Assert::assertEquals($expectedData, json_decode($lastOperation->data, true));
    }
}
```

And here's the Gherkin feature that describes tests for our reservation system:

```gherkin
# tests/Behat/Features/Reservation/room_reservation.feature
Feature: Room Reservation
    In order to stay at the hotel
    As a guest
    I need to be able to make room reservations

    Background:
        Given the following rooms exist:
            | id | number | type     | capacity | base_price | status    |
            | 1  | 101    | standard | 2        | 100.00     | available |
            | 2  | 201    | suite    | 4        | 200.00     | available |
            | 3  | 301    | deluxe   | 3        | 150.00     | available |
        And the following guests exist:
            | id | name          | email              | phone       | loyalty_level |
            | 1  | John Smith    | john@example.com   | 1234567890  | gold          |
            | 2  | Jane Doe      | jane@example.com   | 0987654321  | silver        |
            | 3  | Bob Wilson    | bob@example.com    | 5555555555  | bronze        |
        And the following reservations exist:
            | id | room_id | check_in    | check_out   | status    | guest_id | total_price | primary_guest_id |
            | 1  | 2       | 2025-06-01  | 2025-06-05  | confirmed | 2        | 200.00      | 2                |

    Scenario: Successfully make a room reservation
        Given I am authenticated as "John Smith"
        When I try to reserve room "101" for the following stay:
            | check_in    | 2025-07-01 |
            | check_out   | 2025-07-05 |
        And I add "Bob Wilson" as an additional guest
        Then the reservation should be confirmed
        And the total price should be "360.00"
        And the following operation should be logged:
            | model         | Reservations         |
            | operation     | reservation_created  |
            | data          | room_number=101, guest_name=John Smith, check_in=2025-07-01, check_out=2025-07-05, total_price=360, additional_guests=1 |

    Scenario: Cannot reserve an already booked room
        Given I am authenticated as "John Smith"
        When I try to reserve room "201" for the following stay:
            | check_in    | 2025-06-03 |
            | check_out   | 2025-06-07 |
        Then I should see an error "Room is not available for selected dates"

    Scenario: Cannot exceed room capacity
        Given I am authenticated as "John Smith"
        When I try to reserve room "101" for the following stay:
            | check_in    | 2025-08-01 |
            | check_out   | 2025-08-05 |
        And I add "Jane Doe" as an additional guest
        And I add "Bob Wilson" as an additional guest
        Then I should see an error "Total number of guests (3) exceeds room capacity (2)"

    Scenario: Apply loyalty discounts correctly
        Given I am authenticated as "Jane Doe"
        When I try to reserve room "301" for the following stay:
            | check_in    | 2025-09-01 |
            | check_out   | 2025-09-04 |
        Then the reservation should be confirmed
        And the total price should be "427.5"
        And the following operation should be logged:
            | model         | Reservations         |
            | operation     | reservation_created  |
            | data          | room_number=301, guest_name=Jane Doe, check_in=2025-09-01, check_out=2025-09-04, total_price=427.5, additional_guests=0 |
```

The test context mirrors our DCI implementation in several ways:

1. **Role Assignment**: Just as our DCI implementation attaches roles to objects, our test context manages the state of actors (guests and rooms) involved in the reservation process.

2. **Context Creation**: The test creates a RoomReservationContext with all necessary participants, similar to how our application would in production.

3. **Behavior Verification**: Tests verify both successful scenarios and error conditions, ensuring our DCI roles enforce business rules correctly.

Last two scenarios demonstrate how BDD tests can effectively verify:

1. **Role Constraints**: The ReservableRoom role's capacity constraints
2. **Role Behaviors**: The ReservingGuest role's discount calculations
3. **Context Orchestration**: The RoomReservationContext's coordination of multiple roles

The combination of DCI and BDD provides several benefits:

- **Clear Specifications**: Gherkin scenarios serve as living documentation of system behavior
- **Role Verification**: Each test verifies that roles implement their responsibilities correctly
- **Context Validation**: Tests ensure that contexts properly orchestrate role interactions
- **Business Rule Enforcement**: Scenarios verify that business rules are properly enforced through roles


## Money Transfer Testing Example

Before concluding, let's look at how we tested the money transfer system from our previous article. This example demonstrates how BDD tests can effectively verify DCI pattern implementation:

```gherkin
Feature: Money Transfer
    In order to move money between accounts
    As an account holder
    I need to be able to transfer funds between accounts

    # Setup initial test data
    Background:
        Given the following accounts exist:
            | id | balance  | account_type | status | is_frozen |
            | 1  | 1000.00  | checking     | active | false     |
            | 2  | 500.00   | savings      | active | false     |
            | 3  | 200.00   | checking     | active | true      |
            | 4  | 300.00   | deposit_only | active | false     |

    # Tests basic transfer functionality and audit logging
    Scenario: Successful transfer between active accounts
        When I transfer "200.00" from account "1" to account "2"
        Then account "1" should have balance of "800.00"
        And account "2" should have balance of "700.00"
        # Verifies that all transfer steps are properly logged
        And an audit log should exist with:
            | foreign_key | operation       |
            | 1           | pre_withdrawal  |
            | 1           | post_withdrawal |
            | 2           | pre_deposit     |
            | 2           | post_deposit    |

    # Verifies role constraints - frozen accounts cannot perform withdrawals
    Scenario: Cannot transfer from frozen account
        When I try to transfer "100.00" from account "3" to account "2"
        Then I should get an error "Source cannot withdraw this amount"
        And account "3" should have balance of "200.00"
        And account "2" should have balance of "500.00"

    # Verifies business rule - insufficient funds
    Scenario: Cannot transfer more than available balance
        When I try to transfer "1200.00" from account "1" to account "2"
        Then I should get an error "Source cannot withdraw this amount"
        And account "1" should have balance of "1000.00"
        And account "2" should have balance of "500.00"
```

This feature file tests several key aspects of our DCI implementation:

1. **Role Behavior Testing**
   - TransferSource role's withdrawal capabilities
   - TransferDestination role's deposit functionality
   - Role constraints (frozen accounts, insufficient funds)

2. **Context Orchestration**
   - Proper execution of the transfer process
   - Transaction atomicity (all-or-nothing transfers)
   - Proper cleanup of role assignments

3. **Business Rules Verification**
   - Balance constraints
   - Account status restrictions
   - Audit trail requirements

4. **Error Handling**
   - Proper error messages for various failure scenarios
   - State preservation after failed transfers
   - Role constraint violations

These tests ensure that our DCI implementation maintains system integrity while enforcing business rules through role behaviors and context coordination.

## Conclusion

Testing DCI implementations with Behat creates a perfect match between how we build our software and how we test it. Let's look at why this combination works so well:

First, Behat's behavior-driven approach matches naturally with DCI's focus on what objects do rather than just what they are. When we write tests in Gherkin language, we describe actions and their results - just like DCI describes roles and their behaviors. This makes our tests easier to understand and write because they follow the same thinking pattern as our code.

Second, both DCI and BDD focus on real-world scenarios. DCI helps us organize code around actual use cases (like making a room reservation or transferring money), while Behat lets us write tests that directly reflect these same use cases. This means our tests read like a story of what the system should do, making them valuable not just for testing but also as living documentation.

Additionally, the way Behat structures tests with "Given-When-Then" steps fits perfectly with how DCI contexts work:
- "Given" steps set up our data objects
- "When" steps trigger the context's actions
- "Then" steps verify that roles performed their behaviors correctly

This natural alignment between DCI and BDD testing makes our development process more straightforward and our tests more reliable. We can be confident that our tests are checking the right things because they're structured in the same way as the system they're testing.

## Demo Project for Article

The complete example, including all tests and implementations, is available at https://github.com/skie/cakephp-dci.

