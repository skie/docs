---
title: Building Dynamic Web Applications with CakePHP and htmx A Practical Guide
date: 2024-12-02
description: This article explores how to integrate htmx with CakePHP to create more dynamic and interactive web applications while writing less JavaScript code. We'll cover the basics of htmx, its setup with CakePHP, and practical examples to demonstrate its power.
tags:
  - CakePHP
  - htmx
  - JavaScript
  - Web Development
  - Tutorial
---

#### Other Articles in the Series

- [Building Dynamic Web Applications with CakePHP and HTMX: Infinite Scroll](/articles/Building%20Dynamic%20Web%20Applications%20with%20CakePHP%20and%20htmx%20Infinite%20Scroll)

This article explores how to integrate htmx with CakePHP to create more dynamic and interactive web applications while writing less JavaScript code. We'll cover the basics of htmx, its setup with CakePHP, and practical examples to demonstrate its power.

## Introduction to htmx library

htmx is a modern JavaScript library that allows you to access AJAX, CSS Transitions, WebSockets, and Server Sent Events directly in HTML, using attributes. It's designed to be simple, powerful, and a natural extension of HTML's existing capabilities.

The library's main purpose is to allow you to build modern user interfaces with the simplicity of HTML, reducing the need for complex JavaScript. Instead of writing JavaScript to handle frontend interactions, you can use HTML attributes to define dynamic behaviors.

htmx works by intercepting HTML events (like clicks or form submissions), making HTTP requests in the background, and updating the DOM with the response. This approach, often called "hypermedia-driven applications," allows for rich interactivity while maintaining the simplicity of the web's original architecture.

## Basic setup with CakePHP

To get started with htmx in your CakePHP application, follow these steps:

1. Install the CakePHP htmx plugin using Composer:
```bash
composer require zunnu/cake-htmx
```

2. Load the htmx JavaScript library in your layout file (templates/layout/default.php):
```php
<?= $this->Html->script('https://unpkg.com/htmx.org@1.9.12') ?>
```

3. Load the plugin in your application (Application.php):
```php
public function bootstrap(): void
{
    // ... other plugins
    $this->addPlugin('CakeHtmx');
}
```

## Boost your CakePHP application with htmx

One of the simplest yet powerful features of htmx is the `hx-boost` attribute. By adding this attribute to any container element (often the `<body>` tag), you can automatically enhance all anchor tags and forms within that container to use AJAX instead of full page loads.

### Basic Implementation

Add the `hx-boost` attribute to your layout file (templates/layout/default.php):

```php
<body hx-boost="true">
    <?= $this->Flash->render() ?>
    <?= $this->fetch('content') ?>
</body>
```

With this single attribute, all links and forms in your application will automatically use AJAX requests instead of full page loads. The content will be smoothly updated without refreshing the page, while maintaining browser history and back/forward button functionality.

### How it Works

When `hx-boost` is enabled:

1. Clicks on links (`<a>` tags) are intercepted
2. Form submissions are captured
3. Instead of a full page load, htmx makes an AJAX request
4. The response's `<body>` content replaces the current page's `<body>`
5. The URL is updated using the History API
6. Browser history and navigation work as expected

### Practical Example

Here's a typical CakePHP navigation setup enhanced with `hx-boost`:

```php
<!-- templates/layout/default.php -->
<!DOCTYPE html>
<html>
<head>
    <title><?= $this->fetch('title') ?></title>
    <?= $this->Html->script('https://unpkg.com/htmx.org@1.9.10') ?>
</head>
<body hx-boost="true">
    <nav>
        <?= $this->Html->link('Home', ['controller' => 'Pages', 'action' => 'display', 'home']) ?>
        <?= $this->Html->link('Posts', ['controller' => 'Posts', 'action' => 'index']) ?>
        <?= $this->Html->link('About', ['controller' => 'Pages', 'action' => 'display', 'about']) ?>
    </nav>

    <main>
        <?= $this->Flash->render() ?>
        <?= $this->fetch('content') ?>
    </main>
</body>
</html>
```

### Selective Boosting

You can also apply `hx-boost` to specific sections of your page:

```php
<!-- Only boost the post list -->
<div class="post-section" hx-boost="true">
    <?php foreach ($posts as $post): ?>
        <?= $this->Html->link(
            $post->title,
            ['action' => 'view', $post->id],
            ['class' => 'post-link']
        ) ?>
    <?php endforeach; ?>
</div>

<!-- Regular links outside won't be boosted -->
<div class="external-links">
    <a href="https://example.com">External Link</a>
</div>
```

### Excluding Elements

You can exclude specific elements from being boosted using `hx-boost="false"`:

```php
<body hx-boost="true">
    <!-- This link will use AJAX -->
    <?= $this->Html->link('Profile', ['controller' => 'Users', 'action' => 'profile']) ?>

    <!-- This link will perform a full page load -->
    <a href="/logout" hx-boost="false">Logout</a>
</body>
```

The `hx-boost` attribute provides a simple way to enhance your CakePHP application's performance and user experience with minimal code changes. It's particularly useful for:

- Navigation between pages
- Form submissions
- Search results
- Pagination
- Any interaction that traditionally requires a full page reload

By using `hx-boost`, you get the benefits of single-page application-like behavior while maintaining the simplicity and reliability of traditional server-rendered applications.

## Going deeper with htmx with custom attributes

First, let's see how we can transform a traditional CakePHP index page to use htmx.

### Index page example

Here's a traditional index page without htmx, showing a list of posts:

```php
// PostsController.php
public function index()
{
    $query = $this->Posts->find();
    $posts = $this->paginate($query, ['limit' => 12]);
    $this->set(compact('posts'));
}
```

```php
<!-- templates/Posts/index.php -->
<div class="posts index content">
    <div class="table-responsive">
        <table>
            <thead>
                <tr>
                    <th><?= $this->Paginator->sort('id') ?></th>
                    <?php // .... ?>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($posts as $post): ?>
                    <?php // .... ?>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
    <div class="paginator">
        <ul class="pagination">
            <?php // .... ?>
        </ul>
    </div>
</div>
```

### Index page example with htmx

Now, let's enhance the same page with htmx to handle pagination and sorting without page reloads:

```php
// PostsController.php
public function index()
{
    $query = $this->Posts->find();
    $posts = $this->paginate($query, ['limit' => 12]);
    $this->set(compact('posts'));
    if($this->getRequest()->is('htmx')) {
        $this->viewBuilder()->disableAutoLayout();
        $this->Htmx->setBlock('posts');
    }
}

```

```php
<!-- templates/Posts/index.php -->
<div id="posts" class="posts index content">
<?php $this->start('posts'); ?>
    <div class="table-container">
        <div id="table-loading" class="htmx-indicator">
            <div class="spinner"></div>
        </div>
        <div class="table-responsive">
            <table>
                <thead
                    hx-boost="true"
                    hx-target="#posts"
                    hx-indicator="#table-loading"
                    hx-push-url="true"
                >
                    <tr>
                        <th><?= $this->Paginator->sort('id') ?></th>
                        <?php // .... ?>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($posts as $post): ?>
                        <?php // .... ?>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
        <div class="paginator"
            hx-boost="true"
            hx-target="#posts"
            hx-indicator="#table-loading"
            hx-push-url="true"
        >
            <ul class="pagination">
                <?php // .... ?>
            </ul>
        </div>
    </div>
<?php $this->end(); ?>
</div>
<?= $this->fetch('posts'); ?>
```

Now let's look at the changes we made to the controller and the HTML structure.

### Controller Changes
In the controller, we've added htmx-specific handling. When a request comes from htmx, we:
1. Disable the layout since we only want to return the table content
2. Use the `Htmx` helper to set a specific block that will be updated
3. Maintain the same pagination logic, making it work seamlessly with both regular and htmx requests

### Out-of-Band (OOB) Swaps with htmx

htmx supports Out-of-Band (OOB) Swaps, which allow you to update multiple elements on a page in a single request. This is particularly useful when you need to update content in different parts of your page simultaneously, such as updating a list of items while also refreshing a counter or status message.

#### How OOB Works

1. In your response HTML, include elements with `hx-swap-oob="true"` attribute
2. These elements will update their counterparts on the page based on matching IDs
3. The main response content updates normally, while OOB content updates independently


### HTML Structure Changes
The main changes to the HTML structure include:
1. Adding an outer container with a specific ID (`posts`) for targeting updates
2. Wrapping the content in a block using `$this->start('posts')` and `$this->end()` to allow for OOB swaps
3. Adding a loading indicator element
4. Implementing htmx attributes on the table header and paginator sections

### HTMX Attributes Explained
The following htmx attributes were added to enable dynamic behavior:
- `hx-boost="true"`: Converts regular links into AJAX requests
- `hx-target="#posts"`: Specifies where to update content (the posts container)
- `hx-indicator="#table-loading"`: Shows/hides the loading spinner
- `hx-push-url="true"`: Updates the browser URL for proper history support

These attributes work together to create a smooth, dynamic experience while maintaining proper browser history and navigation.


### Loading Indicator Implementation
The loading indicator provides visual feedback during AJAX requests:
1. A centered spinner appears over the table during loading
2. The table content is dimmed using CSS opacity
3. The indicator is hidden by default and only shows during htmx requests
4. CSS transitions provide smooth visual feedback

```css
.table-container {
    position: relative;
    min-height: 200px;
}

.htmx-indicator {
    display: none;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 100;
}

.htmx-indicator.htmx-request {
    display: block;
}

.htmx-indicator.htmx-request ~ .table-responsive,
.htmx-indicator.htmx-request ~ .paginator {
    opacity: 0.3;
    pointer-events: none;
    transition: opacity 0.2s ease;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
```

## Problems with current htmx implementation and boost implementation

### Browser History and Back Button Issues

When using htmx with `hx-boost` or AJAX requests, you might encounter issues with the browser's back button showing partial content. This happens because:

1. htmx requests only return partial HTML content
2. The browser's history stack stores this partial content
3. When users click the back button, the partial content is displayed instead of the full page


### Preventing Cache Issues in Controllers

To disable htmx caching by browsers, you can add the following headers to your response in your controller:

```php
    if ($this->request->is('htmx') || $this->request->is('boosted')) {
        $this->response = $this->response
            ->withHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
            ->withHeader('Pragma', 'no-cache')
            ->withHeader('Expires', '0');

    }
```

#### General Solution

Prevent caching issues with htmx requests by creating a middleware:

```php
// src/Middleware/HtmxMiddleware.php
public function process(ServerRequest $request, RequestHandler $handler): Response
{
    $response = $handler->handle($request);

    if ($request->is('htmx')) {
        return $response
            ->withHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
            ->withHeader('Pragma', 'no-cache')
            ->withHeader('Expires', '0');
    }

    return $response;
}
```

## Conclusion

htmx is a powerful library that can significantly enhance the interactivity and user experience of your CakePHP applications. By using htmx attributes, you can create dynamic, responsive, and efficient web applications with minimal JavaScript code.

## Demo Project for Article

The examples used in this article are located at https://github.com/skie/cakephp-htmx/tree/1.0.0 and available for testing.
