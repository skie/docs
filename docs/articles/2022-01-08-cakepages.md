---
title: CakePHP Pages Layer
date: 2022-01-08
description: Learn how to use the CakePHP Pages plugin to implement the Page Controller pattern, bringing Razor Pages-style architecture to CakePHP with ViewModels for type-safe template data.
tags:
  - CakePHP
  - Page Controller
  - ViewModel
  - Architecture
---

# CakePHP Pages Layer

[CakePHP Pages](https://github.com/skie/cake-pages) is a plugin that enables a different controller structure organization and controller-view interaction.

## Motivation and goals of the project

* Show how easy it is to change CakePHP project files structure.
* Show CakePHP community another way of building the controller layer and interacting with the view layer.
* Bring Razor Pages style into CakePHP stack.
* Introduce ViewModel layer for interacting with view and full type support control for passed template's data.

## What is .NET Razor Pages

<span>ASP</span>.NET Razor Pages is a server-side, page-focused framework. This framework is the recommended framework for cross-platform server-side HTML generation. Architecturally, Razor Pages is an implementation of the MVC pattern.

The key difference between Razor Pages implementation of the MVC pattern and <span>ASP</span>.NET Core MVC is that Razor Pages uses the [Page Controller](https://martinfowler.com/eaaCatalog/pageController.html) pattern instead of the [Front Controller pattern](https://martinfowler.com/eaaCatalog/frontController.html).

## Defining CakePHP Pages Controller

The original CakePHP controller class responds to multiple actions grouped in a single class. For a baked class, these actions are typically *index*, *view*, *add*, *edit*, and *delete*.
The Page Controller pattern, in contrast to the default approach, uses a separate class for each action. This means we have small classes per action, with the ability to define separate handlers per HTTP verb. In this implementation, each handler is prefixed with *on* and named like *onGet*, *onPost*, *onPut*, or *onDelete*.

### Switching to CakePHP Pages

First, you need to add the plugin to your application.

```bash
composer require skie/cake-pages
```

The next step is to configure middleware interaction with the application.
CakePHP Pages can be enabled at the router level using RouteBuilder::scope.

```php
$routes->scope('/pg', function (RouteBuilder $builder) {
    $builder->applyMiddleware('Pages');
    $builder->fallbacks();
});
```

It is possible to connect just single controller using `_middleware` option like this:

```php
    $builder->connect('/items/{action}/*', ['controller' => 'Items'], ['_middleware' => 'Pages']);
```

The routes middleware should be loaded from the `Application::routes` method.

```php
    public function routes($routes): void
    {
        $routes->registerMiddleware('Pages', new \CakePages\Page\PagesMiddleware($this));
        // ...
        parent::routes($routes);
    }
```

The `App\Application` class must implement the following method, which is used by the `PagesMiddleware`:

```php
    public function setControllerFactory(ControllerFactoryInterface $factory): void
    {
        $this->controllerFactory = $factory;
    }
```

This method allows switching to the Pages Controller layer only on limited scope. Of course it could be applied to the whole application in the main router scope.

### How CakePHP Pages works

When the router matches the scope, it propagates the request through middlewares. The Pages middleware passes the request to `CakePages\Page\PageFactory`, which overrides the controller construction logic that is normally performed by `Cake\Controller\ControllerFactory`.
The final step is how the controller decides which action should be invoked. This is handled by the controller implementing `CakePages\Page\PageTrait::getAction` from `CakePages\Page\PageTrait`, which overrides the default `Cake\Controller\Controller::getAction` implementation.

### CakePHP Pages Files Structure

For the generic route `/:controller/:action`, the Pages controller structure looks different from the default CakePHP controller layer. All page controllers are organized in a folder named with the camelized controller name, and each class is named as the camelized action name with a **Page** suffix.

Here is the files structure for route `/items/:action`.

```text
src/
   |Controller
   |Controller/Items
              |Items/AddPage.php
              |Items/EditPage.php
              |Items/IndexPage.php
              |Items/ViewPage.php
              |Items/DeletePage.php
```

This change on the controller layer does not affect the template layer. The template names and location stay the same.

### Pages controller requirements

There is only one requirement for any Pages controller classes: the class must use the `CakePages\Page\PageTrait` so that `CakePages\Page\PageFactory` can correctly retrieve the needed action for execution.

## ViewModel

The ViewModel in the MVC design pattern is very similar to a "model". The major difference between "Model" and "ViewModel" is that we use a ViewModel only in rendering views.

The benefit of using a ViewModel is that instead of passing a large number of variables to the view layer, we pass only the view model instance. It contains all the data (strictly typed where possible), making it more convenient to work with this data from the templates. You still need to declare the view model hint in each of your templates, but adding a new property to the model in the future immediately provides access to that property from each template where this view model is already declared.

Using a viewmodel to pass data to a view allows the view templates to take advantage of strong type checking. Strong typing means that every variable and constant has an explicitly defined type (for example, string, int, or DateTime).

ViewModel classes are stored in a `src/ViewModels` named folder.
Here are examples of `Items/AddPage` controller, `ViewModel/Items/ItemAdd` view model and `templates/Items/add` template.

### Page controller: _Items/AddPage_.

```php
<?php
namespace App\Controller\Items;

use App\ViewModel\Items\ItemAdd;
use CakePages\Page\PageTrait;
use App\Controller\AppController;

/**
 * Items Add Page
 *
 * @property \App\Model\Table\ItemsTable $Items
 */
class AddPage extends AppController
{
    use PageTrait;

    /**
     * @var \App\ViewModel\Items\ItemAdd
     */
     public $model;

    /**
     * Initialize controller
     *
     * @return void
     */
    public function initialize(): void
    {
        parent::initialize();
        $this->model = new ItemAdd();
    }
    /**
     * On Get method
     *
     * @return \Cake\Http\Response|null|void Redirects on successful add, renders view otherwise.
     */
    public function onGet()
    {
        $this->model->item = $this->init($id);
        $this->setData();
    }

    /**
     * On Post method
     *
     * @return \Cake\Http\Response|null|void Redirects on successful add, renders view otherwise.
     */
    public function onPost()
    {
        $this->model->item = $this->Items->patchEntity($this->init(), $this->request->getData());
        if ($this->Items->save($this->model->item)) {
            $this->Flash->success(__('The item has been saved.'));

            return $this->redirect(['action' => 'index']);
        }
        $this->Flash->error(__('The item could not be saved. Please, try again.'));
        $this->setData();
    }

    private function init()
    {
        return $this->Items->newEmptyEntity();
    }

    private function setData()
    {

        $this->model->blogs = $this->Items->Blogs->find('list', ['limit' => 200]);

        $this->set(['model' => $this->model]);
    }
}
```

### View model _ViewModel/Items/ItemAdd_.

```php
namespace App\ViewModel\Items;

/**
 * Items ItemAdd ViewModel
 */
class ItemAdd
{
    /**
     * @var \App\Model\Entity\Item $item
     */
     public $item;

    /**
     * @var \App\Model\Table\BlogsTable $blogs
     */
     public $blogs;

}
```


### Template: _templates/Items/add_.


```php/3,7,12
<?php
/**
 * @var \App\View\AppView $this
 * @var \App\ViewModel\Items\ItemAdd $model
 */
?>
...
    <?= $this->Form->create($model->item) ?>
    <fieldset>
        <legend><?= __('Add Item') ?></legend>
        <?php
            echo $this->Form->control('name');
            echo $this->Form->control('blog_id', ['options' => $model->blogs]);
        ?>
    </fieldset>
    <?= $this->Form->button(__('Submit')) ?>
    <?= $this->Form->end() ?>
...
```

## Cake Pages tooling.

The plugin provides tools for baking controllers, view models, and the template layer that uses view models.

Usage:

```bash
bin/cake bake page ControllerName
bin/cake bake view_model ControllerName
bin/cake bake page_template ControllerName
```

## Conclusion

If you've read this far, you might be interested in trying this CakePHP extension. Any feedback and comments are appreciated.
